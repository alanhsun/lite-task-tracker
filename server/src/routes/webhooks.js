const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/webhooks - List all registered webhooks
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const hooks = await db('webhooks').orderBy('created_at', 'desc');
    res.json(hooks);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/webhooks - Register a new webhook (for AI to listen to push events)
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, url, events } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const [id] = await db('webhooks').insert({
      name: name.trim(),
      url: url.trim(),
      events: events ? JSON.stringify(events) : JSON.stringify(['task.created', 'task.updated', 'task.overdue']),
      is_active: true,
      created_at: new Date().toISOString()
    });

    const hook = await db('webhooks').where('id', id).first();
    res.status(201).json(hook);
  } catch (err) {
    console.error('Webhook create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
