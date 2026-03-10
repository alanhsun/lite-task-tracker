/**
 * AI integration features: recurring tasks, subtasks, task notes
 */
exports.up = function (knex) {
  return knex.schema
    // Add recurrence fields to tasks
    .alterTable('tasks', (table) => {
      table.enu('recurrence', ['none', 'daily', 'weekly', 'monthly']).defaultTo('none');
      table.date('recurrence_end').nullable();
    })
    // Subtasks / checklist items
    .createTable('subtasks', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('tasks').onDelete('CASCADE');
      table.string('title', 255).notNullable();
      table.boolean('completed').defaultTo(false);
      table.integer('sort_order').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    // Task notes / activity log
    .createTable('task_notes', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('tasks').onDelete('CASCADE');
      table.text('content').notNullable();
      table.string('source', 50).defaultTo('user'); // 'user' or 'ai'
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('task_notes')
    .dropTableIfExists('subtasks')
    .alterTable('tasks', (table) => {
      table.dropColumn('recurrence');
      table.dropColumn('recurrence_end');
    });
};
