
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/registrations/:eventId
router.post('/:eventId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'attendee') {
    return res.status(403).json({
      error: 'Only attendees can register for events',
    });
  }

  const eventId = Number(req.params.eventId);

  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    // Find event in database
    const [events] = await pool.query(
      'SELECT id, ticket_price, status FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Block cancelled events
    if (event.status !== 'published') {
      return res.status(400).json({
        error: 'Registration is closed for this event',
      });
    }

    // Block paid events
    if (Number(event.ticket_price) !== 0) {
      return res.status(400).json({
        error: 'Free registration is only available for free events',
      });
    }

    // Save registration in MySQL
    const [result] = await pool.query(
      `INSERT INTO registrations (attendee_id, event_id)
       VALUES (?, ?)`,
      [req.user.id, eventId]
    );

    return res.status(201).json({
      message: 'Registration successful!',
      registrationId: result.insertId,
      eventId,
    });
  } catch (err) {
    // MySQL unique constraint blocks duplicate registrations
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'You are already registered for this event',
      });
    }

    console.error('Registration error:', err.message);
    return res.status(500).json({
      error: 'Could not register for event',
    });
  }
});

module.exports = router;
