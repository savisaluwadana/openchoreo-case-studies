const cron = require('node-cron');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// DB connection - OpenChoreo injects the same DB connection env vars as the service
const pool = new Pool({
  host: process.env.CHOREO_LEAVE_DB_HOSTNAME || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.CHOREO_LEAVE_DB_PORT || process.env.DB_PORT || '5432', 10),
  database: process.env.CHOREO_LEAVE_DB_DBNAME || process.env.DB_NAME || 'leave_db',
  user: process.env.CHOREO_LEAVE_DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.CHOREO_LEAVE_DB_PASSWORD || process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
});

// Email transporter - prefer SMTP env vars, otherwise stub to console
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  transporter = {
    sendMail: async (opts) => {
      console.log('--- Stubbed email ---');
      console.log(opts);
      return Promise.resolve();
    },
  };
}

// default scheduling: run every day at 08:00
const SCHEDULE = process.env.REMINDER_CRON || '0 8 * * *';

async function sendReminders() {
  console.log(new Date().toISOString(), 'Scheduler triggered — looking for upcoming leaves');
  try {
    // look for approved leaves starting tomorrow
    const { rows } = await pool.query(
      `SELECT * FROM leaves WHERE status = 'APPROVED' AND start_date = (CURRENT_DATE + INTERVAL '1 day')`);
    if (!rows.length) {
      console.log('No upcoming leaves found');
      return;
    }

    for (const leave of rows) {
      const subject = `Reminder: Leave starts on ${leave.start_date}`;
      const text = `Hello,\n\nThis is a reminder that a leave for employee ${leave.employee_id} starts on ${leave.start_date} and ends on ${leave.end_date}.\n\nReason: ${leave.reason || 'N/A'}`;

      // send to approver
      if (leave.approver_email) {
        await transporter.sendMail({
          from: process.env.NOTIFY_FROM || 'noreply@example.com',
          to: leave.approver_email,
          subject,
          text,
        });
        console.log(`Sent reminder to approver ${leave.approver_email}`);
      }

      // optionally send to employee
      if (leave.employee_email) {
        await transporter.sendMail({
          from: process.env.NOTIFY_FROM || 'noreply@example.com',
          to: leave.employee_email,
          subject,
          text,
        });
        console.log(`Sent reminder to employee ${leave.employee_email}`);
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err);
  }
}

console.log('Leave scheduler starting. Cron:', SCHEDULE);
cron.schedule(SCHEDULE, sendReminders, { timezone: process.env.TIMEZONE || 'UTC' });

// run immediately at startup for quick testing
sendReminders();
