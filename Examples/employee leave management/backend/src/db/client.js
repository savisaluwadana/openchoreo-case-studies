const { Pool } = require('pg');

// OpenChoreo will inject database connection environment variables
// when you connect the service to the managed database.
const pool = new Pool({
  host: process.env.CHOREO_LEAVE_DB_HOSTNAME || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.CHOREO_LEAVE_DB_PORT || process.env.DB_PORT || '5432', 10),
  database: process.env.CHOREO_LEAVE_DB_DBNAME || process.env.DB_NAME || 'leave_db',
  user: process.env.CHOREO_LEAVE_DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.CHOREO_LEAVE_DB_PASSWORD || process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = { pool };
