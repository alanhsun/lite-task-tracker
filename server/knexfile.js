const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'tasks.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    pool: {
      min: 1,
      max: 1,
      idleTimeoutMillis: 360000 * 1000,
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || '/data/tasks.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    }
  }
};
