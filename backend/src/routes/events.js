
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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

// PUT /api/events/:id - edit an existing event
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('event_date').isDate().withMessage('A valid date is required'),
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
      return res.status(403).json({
        error: 'Only organizers can edit events',
      });
    }

    const eventId = req.params.id;

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
      // Check whether the event exists and who created it
      const [events] = await pool.query(
        'SELECT organizer_id, status FROM events WHERE id = ?',
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (events[0].organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'You can only edit your own events',
        });
      }

      if (events[0].status === 'cancelled') {
        return res.status(400).json({
          error: 'Cancelled events cannot be edited',
        });
      }

      // Update the event in MySQL
      await pool.query(
        `UPDATE events
         SET title = ?,
             description = ?,
             event_date = ?,
             event_time = ?,
             location = ?,
             image_url = ?,
             ticket_price = ?,
             capacity = ?
         WHERE id = ?
           AND organizer_id = ?
           AND status = 'published'`,
        [
          title,
          description,
          event_date,
          event_time,
          location,
          image_url || null,
          ticket_price,
          capacity,
          eventId,
          req.user.id,
        ]
      );

      return res.json({
        message: 'Event updated successfully',
      });
    } catch (err) {
      console.error('Edit event error:', err.message);
      return res.status(500).json({
        error: 'Could not update event',
      });
    }
  }
);


// PATCH /api/events/:id/cancel - cancel an event
router.patch(
  '/:id/cancel',
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        error: 'Only organizers can cancel events',
      });
    }

    const eventId = req.params.id;

    try {
      // Find the event and check ownership
      const [events] = await pool.query(
        'SELECT organizer_id, status FROM events WHERE id = ?',
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (events[0].organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'You can only cancel your own events',
        });
      }

      if (events[0].status === 'cancelled') {
        return res.status(400).json({
          error: 'Event is already cancelled',
        });
      }

      // Soft cancellation: keep the record but change its status
      await pool.query(
        `UPDATE events
         SET status = 'cancelled'
         WHERE id = ?
           AND organizer_id = ?
           AND status = 'published'`,
        [eventId, req.user.id]
      );

      return res.json({
        message: 'Event cancelled successfully',
      });
    } catch (err) {
      console.error('Cancel event error:', err.message);
      return res.status(500).json({
        error: 'Could not cancel event',
      });
    }
  }
);


// GET /api/events/mine - list events created by the logged-in organizer
router.get('/mine', authenticateToken, async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      error: 'Only organizers can view their events',
    });
  }

  try {
    const [events] = await pool.query(
      `SELECT id, organizer_id, title, description, event_date,
              event_time, location, image_url, ticket_price,
              capacity, status, created_at
       FROM events
       WHERE organizer_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ events });
  } catch (err) {
    console.error('My events error:', err.message);
    return res.status(500).json({
      error: 'Could not retrieve your events',
    });
  }
});



module.exports = router;


