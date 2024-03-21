/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return Promise.all([
    knex.schema.createTable('InventoryItem', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('description');
      table.integer('price_in_cents').unsigned().notNullable();


      table.string('base_image_path').notNullable();
      table.integer('weight').unsigned();
      table.float('length').unsigned();

      table.boolean('active').defaultTo(true).notNullable();
    }),

    knex.schema.createTable('InventoryItem_x_Tag', function(table) {
      table.increments('id').primary();
      table.integer('TagId').references('Tag.id');
      table.integer('InventoryItemId').references('InventoryItem.id');

    })

    knex.schema.createTable('Tag', function(table) {
      table.increments('id').primary();
      table.string('name').unique().notNullable();
      table.boolean('active').defaultTo(true).notNullable();
    }),
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('inventory_item'),
    knex.schema.dropTableIfExists('tag'),
  ]);
};
