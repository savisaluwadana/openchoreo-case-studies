const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/v1/quizzes — list all quizzes
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, created_at FROM quizzes ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET /api/v1/quizzes/:id — get quiz with all questions
router.get('/:id', async (req, res) => {
  try {
    const { rows: qz } = await db.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
    if (!qz.length) return res.status(404).json({ error: 'Quiz not found' });

    const { rows: questions } = await db.query(
      'SELECT id, text, options, points, position FROM questions WHERE quiz_id = $1 ORDER BY position',
      [req.params.id]
    );

    res.json({ ...qz[0], questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/v1/quizzes — create a new quiz
router.post('/', async (req, res) => {
  const { title, description = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const { rows } = await db.query(
      'INSERT INTO quizzes (id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), title, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// POST /api/v1/quizzes/:id/sessions — create a new session for a quiz
router.post('/:id/sessions', async (req, res) => {
  const { participant } = req.body;
  if (!participant) return res.status(400).json({ error: 'participant is required' });

  try {
    // Check quiz exists
    const { rows: qz } = await db.query('SELECT id FROM quizzes WHERE id = $1', [req.params.id]);
    if (!qz.length) return res.status(404).json({ error: 'Quiz not found' });

    const { rows: questions } = await db.query(
      'SELECT COUNT(*) as cnt, COALESCE(SUM(points), 0) as total FROM questions WHERE quiz_id = $1',
      [req.params.id]
    );

    const total = parseInt(questions[0].total) || 0;
    const { rows } = await db.query(
      `INSERT INTO sessions (id, quiz_id, participant, score, total_questions, finished)
       VALUES ($1, $2, $3, 0, $4, false) RETURNING *`,
      [uuidv4(), req.params.id, participant, parseInt(questions[0].cnt)]
    );
    res.status(201).json({ ...rows[0], possible_score: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/v1/quizzes/:id/sessions — list sessions for a quiz
router.get('/:id/sessions', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM sessions WHERE quiz_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
