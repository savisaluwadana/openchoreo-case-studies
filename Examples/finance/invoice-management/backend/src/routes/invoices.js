const express = require('express');
const PDFDocument = require('pdfkit');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { invoice_number, customer_name, customer_email, amount, due_date } = req.body;
  const [result] = await pool.query(
    'INSERT INTO invoices (invoice_number, customer_name, customer_email, amount, due_date) VALUES (?,?,?,?,?)',
    [invoice_number, customer_name, customer_email, amount, due_date]
  );
  const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.get('/:id/pdf', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const invoice = rows[0];
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
  doc.text(`Invoice: ${invoice.invoice_number}`, { underline: true });
  doc.text(`Customer: ${invoice.customer_name}`);
  doc.text(`Amount: ${invoice.amount}`);
  doc.text(`Due: ${invoice.due_date}`);
  doc.end();
  doc.pipe(res);
});

module.exports = router;
