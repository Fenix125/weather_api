const express = require("express");
const crypto = require("crypto");
const cron = require("node-cron");
const { fetchCurrentWeather } = require("./services/weather");
const {
    sendConfirmationEmail,
    sendUpdates,
} = require("./services/email_sender");
const usersRouter = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = 3000;
const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", usersRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let ALL_USERS = [];

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

function makeToken(bytes = 16) {
    return crypto.randomBytes(bytes).toString("hex");
}
function tokenizeEmail(email) {
    return Buffer.from(email).toString("base64url");
}

usersRouter.post("/subscribe", (req, res) => {
    const { email, city, frequency } = req.body;
    if (
        !email ||
        !city ||
        !frequency ||
        !["hourly", "daily"].includes(frequency)
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }
    const exists = ALL_USERS.some(
        (u) => u.email === email && u.city === city && u.frequency === frequency
    );
    if (exists) {
        return res.status(409).json({
            error: "Email already subscribed",
        });
    }
    const token_email = tokenizeEmail(email);
    const random_token = makeToken();
    const token = `${token_email}.${random_token}`;
    ALL_USERS.push({
        email,
        city,
        frequency,
        confirmed: false,
        token: random_token,
    });
    sendConfirmationEmail(token, email);
    res.status(200).json({
        message: "Subscription successful. Confirmation email sent.",
    });
});

usersRouter.get("/confirm/:token", (req, res) => {
    const { token } = req.params;
    const parts = token.split(".");
    if (parts.length !== 2) {
        return res.status(400).json({ error: "Invalid token" });
    }
    const [emailPart, randomPart] = parts;

    let email = Buffer.from(emailPart, "base64url").toString("utf8");
    const user = ALL_USERS.find((u) => u.email === email);
    if (!user) {
        return res.status(404).json({ error: "Token not found" });
    }
    if (user.token !== randomPart) {
        return res.status(400).json({ error: "Invalid token" });
    }
    user.confirmed = true;
    res.json({ message: "Subscription confirmed successfully" });
});

usersRouter.get("/unsubscribe/:token", (req, res) => {
    const { token } = req.params;
    const parts = token.split(".");
    if (parts.length !== 2) {
        return res.status(400).json({ error: "Invalid token" });
    }
    const [emailPart, randomPart] = parts;
    let email = Buffer.from(emailPart, "base64url").toString("utf8");
    const user = ALL_USERS.find((u) => u.email === email);
    if (!user) {
        return res.status(404).json({ error: "Token not found" });
    }
    if (user.token !== randomPart) {
        return res.status(400).json({ error: "Invalid token" });
    }
    ALL_USERS = ALL_USERS.filter((u) => u.email !== email);
    res.json({ message: "Unsubscribed successfully" });
});

usersRouter.get("/users", (req, res) => {
    res.json(ALL_USERS);
});

app.listen(port);

async function sendWeatherUpdates(frequency) {
    const users = ALL_USERS.filter(
        (u) => u.confirmed === true && u.frequency === frequency
    );
    for (const u of users) {
        const weather = await fetchCurrentWeather(u.city);
        const token_email = tokenizeEmail(u.email);
        const token = `${token_email}.${u.token}`;
        sendUpdates(token, u.email, weather);
    }
}

cron.schedule("0 * * * *", () => {
    sendWeatherUpdates("hourly");
});

cron.schedule("0 8 * * *", () => {
    sendWeatherUpdates("daily");
});
