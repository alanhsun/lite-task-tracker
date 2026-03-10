const app = require('./app');
const config = require('./config');
const { initDb } = require('./db');

async function start() {
  try {
    await initDb();
    console.log('Database initialized');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Task Manager API running on http://0.0.0.0:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
