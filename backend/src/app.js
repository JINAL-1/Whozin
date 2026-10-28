
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

app.use(cors());          // lets the React frontend call this API
app.use(express.json());  // parses JSON request bodies

// Health check: also proves the database connection works
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ status: 'error', database: 'unreachable' });
  }
});

// Authentication routes: register and login
app.use('/api/auth', authRoutes);

// Event routes: create and search events
app.use('/api/events', eventRoutes);

module.exports = app;

