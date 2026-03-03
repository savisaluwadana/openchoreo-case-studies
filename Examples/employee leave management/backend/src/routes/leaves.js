const express = require('express');
const { pool } = require('../db/client');

const router = express.Router();

// List leaves (optional status)
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let q = 'SELECT * FROM leaves';
    const params = [];
    if (status) {
      params.push(status);
      q += ` WHERE status = $${params.length}`;
    }
    q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const { rows } = await pool.query(q, params);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// Create leave request
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, employee_email, start_date, end_date, reason, approver_email } = req.body;
    if (!employee_id || !start_date || !end_date) return res.status(400).json({ error: 'employee_id, start_date and end_date are required' });
    const { rows } = await pool.query(
      `INSERT INTO leaves (employee_id, employee_email, start_date, end_date, reason, approver_email)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_id, employee_email || null, start_date, end_date, reason || null, approver_email || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// Get single leave by id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM leaves WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Update leave (full replace of mutable fields)
router.put('/:id', async (req, res, next) => {
  try {
    const { employee_id, employee_email, start_date, end_date, reason, approver_email, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE leaves SET employee_id=$1, employee_email=$2, start_date=$3, end_date=$4, reason=$5, approver_email=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [employee_id, employee_email, start_date, end_date, reason, approver_email, status || 'PENDING', req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Patch status only
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const { rows } = await pool.query(`UPDATE leaves SET status=$1 WHERE id=$2 RETURNING *`, [status, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Approve leave (shortcut)
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`UPDATE leaves SET status = 'APPROVED' WHERE id = $1 RETURNING *`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Reject leave (shortcut)
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`UPDATE leaves SET status = 'REJECTED' WHERE id = $1 RETURNING *`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Delete leave
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM leaves WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
