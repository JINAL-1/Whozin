const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());          // lets the React frontend call this API
app.use(express.json());  // parses JSON request bodies

// Health check: also proves the database connection works
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Database error:', err.message); // <-- the new line
    res.status(500).json({ status: 'error', database: 'unreachable' });
  }
});

// Auth and event routes will be mounted here in later steps

module.exports = app;