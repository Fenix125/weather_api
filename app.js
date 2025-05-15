const express = require("express");
const crypto = require("crypto");
const { fetchCurrentWeather } = require("./services/weather");
const usersRouter = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = 3000;
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", usersRouter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let ALL_USERS = [];

usersRouter.get("/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "Invalid request" });
    }
    try {
        const weather = await fetchCurrentWeather(city);
        res.json(weather);
    } catch (error) {
        res.status(404).json({ error: "City not found" });
    }
});

function makeToken(bytes = 16) {
    return crypto.randomBytes(bytes).toString("hex");
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

    const token = makeToken();
    ALL_USERS.push({ email, city, frequency, confirmed: false, token });
});

usersRouter.get("/confirm/:token", (req, res) => {
    res.json({ message: "Confirms subscribtion" });
});

usersRouter.get("/unsubscribe/:token", (req, res) => {
    res.json({ message: "Unsubscribes" });
});

app.listen(port);
