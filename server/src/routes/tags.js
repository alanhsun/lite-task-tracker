const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/tags - List all tags
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const tags = await db('tags').orderBy('name');

    const tagIds = tags.map((t) => t.id);
    const counts = tagIds.length > 0
      ? await db('task_tags')
          .whereIn('tag_id', tagIds)
          .groupBy('tag_id')
          .select('tag_id')
          .count('* as task_count')
      : [];

    const countMap = {};
    counts.forEach((c) => { countMap[c.tag_id] = c.task_count; });

    const result = tags.map((t) => ({
      ...t,
      task_count: countMap[t.id] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tags - Create a tag
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, color } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const existing = await db('tags').where({ name: name.trim() }).first();
    if (existing) {
      return res.status(409).json({ error: 'Tag already exists' });
    }

    const [id] = await db('tags').insert({
      name: name.trim(),
      color: color || '#6366f1',
    });

    const tag = await db('tags').where('id', id).first();
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tags/:id - Update a tag
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const tag = await db('tags').where({ id: req.params.id }).first();

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.color !== undefined) updates.color = req.body.color;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db('tags').where('id', req.params.id).update(updates);
    const updated = await db('tags').where('id', req.params.id).first();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tags/:id - Delete a tag
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const tag = await db('tags').where({ id: req.params.id }).first();

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await db('tags').where('id', req.params.id).del();
    res.json({ message: 'Tag deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
