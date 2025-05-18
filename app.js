const express = require("express");
const cron = require("node-cron");
const { fetchCurrentWeather } = require("./services/weather");
const {
    sendConfirmationEmail,
    sendUpdates,
} = require("./services/email_sender");
const {
    makeToken,
    tokenizeString,
    detokenizeString,
} = require("./services/tokenization");
const knex = require("knex");
const config = require("./knexfile")[process.env.NODE_ENV || "development"];
const db = knex(config);

const usersRouter = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = 3000;
const cleanup_interval = 10;
const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", usersRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static("public"));

usersRouter.get("/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "Invalid request" });
    }
    try {
        const weather = await fetchCurrentWeather(city);
        res.status(200).json(weather);
    } catch (error) {
        res.status(404).json({ error: "City not found" });
    }
});

usersRouter.post("/subscribe", async (req, res) => {
    const { email, city, frequency } = req.body;
    if (
        !email ||
        !city ||
        !frequency ||
        !["hourly", "daily"].includes(frequency)
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }
    const exists = await db("subscriptions").where({ email, city }).first();
    if (exists) {
        return res.status(409).json({
            error: "Email already subscribed",
        });
    }
    try {
        await fetchCurrentWeather(city);
    } catch (err) {
        return res
            .status(400)
            .json({ error: `City "${city}" is not found or not supported.` });
    }

    const token_email = tokenizeString(email);
    const token_city = tokenizeString(city);
    const random_token = makeToken();
    const token = `${token_email}.${token_city}.${random_token}`;
    await db("subscriptions").insert({
        email,
        city,
        frequency,
        token: random_token,
        confirmed: false,
    });
    sendConfirmationEmail(token, email, city);
    res.status(200).json({
        message: "Subscription successful. Confirmation email sent.",
    });
});

usersRouter.get("/confirm/:token", async (req, res) => {
    const { token } = req.params;
    const parts = token.split(".");
    if (parts.length !== 3) {
        return res.status(400).json({ error: "Invalid token" });
    }
    const [emailPart, cityPart, randomPart] = parts;

    const email = detokenizeString(emailPart);
    const city = detokenizeString(cityPart);

    const user = await db("subscriptions").where({ email, city }).first();
    if (!user) {
        return res.status(404).json({ error: "Token not found" });
    }
    if (user.token !== randomPart) {
        return res.status(400).json({ error: "Invalid token" });
    }
    await db("subscriptions")
        .where({ email, city })
        .update({ confirmed: true });
    res.json({ message: "Subscription confirmed successfully" });
});

usersRouter.get("/unsubscribe/:token", async (req, res) => {
    const { token } = req.params;
    const parts = token.split(".");
    if (parts.length !== 3) {
        return res.status(400).json({ error: "Invalid token" });
    }
    const [emailPart, cityPart, randomPart] = parts;
    const email = detokenizeString(emailPart);
    const city = detokenizeString(cityPart);
    const user = await db("subscriptions").where({ email, city }).first();
    if (!user) {
        return res.status(404).json({ error: "Token not found" });
    }
    if (user.token !== randomPart) {
        return res.status(400).json({ error: "Invalid token" });
    }
    await db("subscriptions").where({ email, city }).del();
    res.json({ message: "Unsubscribed successfully" });
});

app.listen(port);

async function sendWeatherUpdates(frequency) {
    const users = await db("subscriptions").where({
        confirmed: true,
        frequency,
    });
    for (const u of users) {
        try {
            weather = await fetchCurrentWeather(u.city);
        } catch (err) {
            console.error(
                `Failed to fetch weather for "${u.city}" (user ${u.email}):`,
                err
            );
            continue;
        }
        const token_email = tokenizeString(u.email);
        const token_city = tokenizeString(u.city);
        const token = `${token_email}.${token_city}.${u.token}`;
        sendUpdates(token, u.email, weather, u.city);
    }
}

async function cleanUpSubscriptions() {
    await db("subscriptions")
        .where("confirmed", false)
        .andWhere(
            "created_at",
            "<",
            db.raw(`now() - interval '${cleanup_interval} minutes'`)
        )
        .del();
}

cron.schedule("0 * * * *", () => {
    sendWeatherUpdates("hourly");
});

cron.schedule("0 8 * * *", () => {
    sendWeatherUpdates("daily");
});

cron.schedule("*/10 * * * *", cleanUpSubscriptions);
