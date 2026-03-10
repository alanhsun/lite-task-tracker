const axios = require('axios');
const { getDb } = require('../db');

async function triggerWebhook(event, payload) {
  try {
    const db = getDb();
    const webhooks = await db('webhooks').where('is_active', true);

    for (const hook of webhooks) {
      // 简单支持 JSON 数组检查
      let eventsArray = [];
      try {
        eventsArray = (typeof hook.events === 'string') ? JSON.parse(hook.events) : hook.events;
      } catch (e) {
        eventsArray = [];
      }

      if (eventsArray.includes(event) || eventsArray.includes('*')) {
        axios.post(hook.url, {
          event: event,
          timestamp: new Date().toISOString(),
          data: payload
        }, { timeout: 5000 }).catch(e => console.warn(`Webhook failed [${hook.name}]:`, e.message));
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }
}

module.exports = { triggerWebhook };
