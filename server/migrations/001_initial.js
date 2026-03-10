/**
 * Initial migration: tasks, tags, task_tags (no user management)
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('description').defaultTo('');
      table.enu('status', ['todo', 'in_progress', 'done']).defaultTo('todo');
      table.enu('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      table.date('due_date').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['status']);
      table.index(['priority']);
      table.index(['due_date']);
    })
    .createTable('tags', (table) => {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('color', 7).defaultTo('#6366f1');
    })
    .createTable('task_tags', (table) => {
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('tasks').onDelete('CASCADE');
      table.integer('tag_id').unsigned().notNullable()
        .references('id').inTable('tags').onDelete('CASCADE');
      table.primary(['task_id', 'tag_id']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('task_tags')
    .dropTableIfExists('tags')
    .dropTableIfExists('tasks');
};
