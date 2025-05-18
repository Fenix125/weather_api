/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require("dotenv").config();

module.exports = {
    development: {
        client: "pg",
        connection: {
            host: "localhost",
            user: "admin",
            database: "weather_api",
            port: 5432,
        },
        migrations: {
            directory: "./migrations",
        },
    },
    production: {
        client: "pg",
        connection: {
            host: process.env.PG_HOST,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            port: process.env.PG_PORT,
        },
    },
};
