const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  socketPath: process.env.DB_SOCKET || undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: true }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;