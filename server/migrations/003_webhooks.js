exports.up = function (knex) {
  return knex.schema.createTable('webhooks', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('url', 255).notNullable();
    // 支持监听多种事件，例如 task.created, task.updated, task.overdue
    table.json('events').defaultTo('["task.created", "task.updated", "task.overdue"]');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('webhooks');
};
