const mysql = require('mysql2/promise');
require('dotenv').config();

// A pool reuses database connections instead of opening a new one per request.
// If DB_SOCKET is set, connect through the local socket file instead of the network.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  socketPath: process.env.DB_SOCKET || undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;