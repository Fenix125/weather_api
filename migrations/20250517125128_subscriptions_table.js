/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("subscriptions", (table) => {
        table.increments("id").primary();
        table.string("email", 254).notNullable();
        table.string("city", 35).notNullable();
        table.enu("frequency", ["hourly", "daily"]).notNullable();
        table.string("token", 255).notNullable().unique();
        table.boolean("confirmed").notNullable().defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("subscriptions");
};
