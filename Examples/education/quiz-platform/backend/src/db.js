const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.CHOREO_QUIZ_DB_HOSTNAME || 'localhost',
  port:     parseInt(process.env.CHOREO_QUIZ_DB_PORT || '5432'),
  database: process.env.CHOREO_QUIZ_DB_DBNAME   || 'quizdb',
  user:     process.env.CHOREO_QUIZ_DB_USERNAME  || 'postgres',
  password: process.env.CHOREO_QUIZ_DB_PASSWORD  || 'password',
  ssl: process.env.CHOREO_QUIZ_DB_HOSTNAME
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

module.exports = { query: (text, params) => pool.query(text, params) };
