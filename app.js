const express = require("express");
const usersRouter = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = 3000;
const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", usersRouter);

let all_users = [];

usersRouter.get("/weather", (req, res) => {
    res.json({ message: "Returning weather" });
});

app.listen(port);
