/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require("dotenv").config();

module.exports = {
    development: {
        client: "pg",
        connection: {
            host: process.env.PG_HOST,
            user: process.env.PG_USER,
            database: process.env.PG_DATABASE,
            port: process.env.PG_PORT,
        },
        migrations: {
            directory: "./migrations",
        },
    },
};
