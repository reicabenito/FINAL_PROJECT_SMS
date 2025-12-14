// ptc-sms-backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,        // from .env
  user: process.env.DB_USER,        // from .env
  password: process.env.DB_PASSWORD,// from .env
  database: process.env.DB_NAME,    // from .env
  port: process.env.DB_PORT,        // from .env
  ssl: { rejectUnauthorized: false } // required for Render Postgres
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1); // stop if connection fails
  } else {
    console.log(`Connected to PostgreSQL database: ${process.env.DB_NAME}`);
    release(); // release the client back to the pool
  }
});

module.exports = pool;
