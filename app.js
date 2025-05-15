const express = require("express");
const { fetchCurrentWeather } = require("./services/weather");
const usersRouter = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = 3000;
const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", usersRouter);

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

usersRouter.post("/subscribe", (req, res) => {
    res.json({ message: "Makes subscribtion" });
});

usersRouter.get("/confirm/:token", (req, res) => {
    res.json({ message: "Confirms subscribtion" });
});

usersRouter.get("/unsubscribe/:token", (req, res) => {
    res.json({ message: "Unsubscribes" });
});

app.listen(port);
