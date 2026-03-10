const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/tasks/:taskId/subtasks - List subtasks
router.get('/:taskId/subtasks', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtasks = await db('subtasks')
      .where('task_id', req.params.taskId)
      .orderBy('sort_order', 'asc');

    res.json(subtasks);
  } catch (err) {
    console.error('GET subtasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:taskId/subtasks - Add subtask
router.post('/:taskId/subtasks', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [maxOrder] = await db('subtasks').where('task_id', req.params.taskId).max('sort_order as max');
    const sortOrder = (maxOrder.max || 0) + 1;

    const [id] = await db('subtasks').insert({
      task_id: parseInt(req.params.taskId),
      title: title.trim(),
      completed: false,
      sort_order: sortOrder,
      created_at: new Date().toISOString(),
    });

    const subtask = await db('subtasks').where('id', id).first();
    res.status(201).json(subtask);
  } catch (err) {
    console.error('POST subtask error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:taskId/subtasks/:id - Toggle / update subtask
router.put('/:taskId/subtasks/:id', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = await db('subtasks')
      .where({ id: req.params.id, task_id: req.params.taskId }).first();
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.completed !== undefined) updates.completed = req.body.completed ? 1 : 0;

    await db('subtasks').where('id', req.params.id).update(updates);
    const updated = await db('subtasks').where('id', req.params.id).first();
    res.json(updated);
  } catch (err) {
    console.error('PUT subtask error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:taskId/subtasks/:id - Remove subtask
router.delete('/:taskId/subtasks/:id', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const deleted = await db('subtasks')
      .where({ id: req.params.id, task_id: req.params.taskId }).del();

    if (!deleted) return res.status(404).json({ error: 'Subtask not found' });
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    console.error('DELETE subtask error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:taskId/notes - List notes
router.get('/:taskId/notes', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const notes = await db('task_notes')
      .where('task_id', req.params.taskId)
      .orderBy('created_at', 'desc');

    res.json(notes);
  } catch (err) {
    console.error('GET notes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:taskId/notes - Add a note
router.post('/:taskId/notes', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { content, source } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [id] = await db('task_notes').insert({
      task_id: parseInt(req.params.taskId),
      content: content.trim(),
      source: source || 'user',
      created_at: new Date().toISOString(),
    });

    const note = await db('task_notes').where('id', id).first();
    res.status(201).json(note);
  } catch (err) {
    console.error('POST note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:taskId/notes/:id - Delete a note
router.delete('/:taskId/notes/:id', async (req, res) => {
  try {
    const db = getDb();
    const task = await db('tasks').where({ id: req.params.taskId }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const deleted = await db('task_notes')
      .where({ id: req.params.id, task_id: req.params.taskId }).del();

    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('DELETE note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
