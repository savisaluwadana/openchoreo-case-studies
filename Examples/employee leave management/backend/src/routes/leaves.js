const express = require('express');
const { pool } = require('../db/client');

const router = express.Router();

// List leaves (optional status)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    let q = 'SELECT * FROM leaves ORDER BY created_at DESC';
    const params = [];
    if (status) {
      q = 'SELECT * FROM leaves WHERE status = $1 ORDER BY created_at DESC';
      params.push(status);
    }
    const { rows } = await pool.query(q, params);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// Create leave request
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, employee_email, start_date, end_date, reason, approver_email } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO leaves (employee_id, employee_email, start_date, end_date, reason, approver_email)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_id, employee_email, start_date, end_date, reason, approver_email]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// Approve leave
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE leaves SET status = 'APPROVED' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Reject leave
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE leaves SET status = 'REJECTED' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Health probe is handled in index.js

module.exports = router;
