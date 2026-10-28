
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Middleware: verify the user's JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

// POST /api/events - create an event
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('event_date').isDate().withMessage('A valid event_date is required (YYYY-MM-DD)'),
    body('event_time').notEmpty().withMessage('Event time is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('ticket_price').optional().isFloat({ min: 0 }),
    body('capacity').optional({ values: 'null' }).isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'organizer') {
      return res.status(403).json({ error: 'Only organizers can create events' });
    }

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      image_url,
      ticket_price = 0,
      capacity = null,
    } = req.body;

    try {
      const [result] = await pool.query(
        `INSERT INTO events
          (organizer_id, title, description, event_date, event_time,
           location, image_url, ticket_price, capacity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          title,
          description,
          event_date,
          event_time,
          location,
          image_url || null,
          ticket_price,
          capacity,
        ]
      );

      return res.status(201).json({
        message: 'Event created successfully',
        eventId: result.insertId,
      });
    } catch (err) {
      console.error('Create event error:', err.message);
      return res.status(500).json({ error: 'Could not create event' });
    }
  }
);

// GET /api/events?keyword=&location= - search published events
router.get('/', async (req, res) => {
  const { keyword = '', location = '' } = req.query;

  try {
    const [events] = await pool.query(
      `SELECT id, organizer_id, title, description, event_date, event_time,
              location, image_url, ticket_price, capacity, status, created_at
       FROM events
       WHERE status = 'published'
         AND title LIKE ?
         AND location LIKE ?
       ORDER BY event_date ASC, event_time ASC`,
      [`%${keyword}%`, `%${location}%`]
    );

    return res.json({ events });
  } catch (err) {
    console.error('Search events error:', err.message);
    return res.status(500).json({ error: 'Could not retrieve events' });
  }
});

module.exports = router;
