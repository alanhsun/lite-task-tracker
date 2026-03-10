const path = require('path');

const config = {
  port: parseInt(process.env.PORT, 10) || 3300,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tasks.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;
