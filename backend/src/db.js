const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const ssl = process.env.DB_SSL === 'true'
  ? {
      ca: fs.readFileSync(
        path.join(__dirname, '../certs/ca.pem')
      ),
      rejectUnauthorized: true,
    }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  socketPath: process.env.DB_SOCKET || undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;