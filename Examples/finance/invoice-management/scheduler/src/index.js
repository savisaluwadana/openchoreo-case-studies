const cron = require('node-cron');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'invoice_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'invoices',
});

async function sendReminders() {
  console.log('Scheduler triggered - checking due invoices');
  const [rows] = await pool.query("SELECT * FROM invoices WHERE status='PENDING' AND due_date = (CURRENT_DATE + INTERVAL 3 DAY)");
  if (!rows.length) { console.log('No reminders to send'); return; }
  for (const inv of rows) {
    // stubbed notification — in production use SMTP or 3rd-party
    console.log(`Reminder for invoice ${inv.invoice_number} to ${inv.customer_email} due ${inv.due_date}`);
  }
}

const schedule = process.env.REMINDER_CRON || '0 9 * * *';
console.log('Invoice scheduler starting, cron:', schedule);
cron.schedule(schedule, sendReminders, { timezone: process.env.TIMEZONE || 'UTC' });
sendReminders();
