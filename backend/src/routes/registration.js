
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { nowInThunderBay } = require('../utils/dates');

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
      `SELECT id, ticket_price, status,
              TIMESTAMP(event_date, event_time) <= ? AS has_started
       FROM events
       WHERE id = ?`,
      [nowInThunderBay(), eventId]
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

    // Block events that have already started
    if (event.has_started) {
      return res.status(400).json({
        error: 'This event has already started, so registration is closed',
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

// Checks the :eventId in the URL. Returns the id, or null after sending a 400.
function readEventId(req, res) {
  const eventId = Number(req.params.eventId);

  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    res.status(400).json({ error: 'Invalid event ID' });
    return null;
  }

  return eventId;
}

// GET /api/registrations/:eventId - is the logged-in attendee registered?
// Lets the event page remember a registration after a refresh.
router.get('/:eventId', authenticateToken, async (req, res) => {
  const eventId = readEventId(req, res);
  if (eventId === null) return undefined;

  try {
    const [rows] = await pool.query(
      'SELECT id FROM registrations WHERE attendee_id = ? AND event_id = ?',
      [req.user.id, eventId]
    );

    return res.json({ registered: rows.length > 0 });
  } catch (err) {
    console.error('Registration status error:', err.message);
    return res.status(500).json({ error: 'Could not check your registration' });
  }
});

// DELETE /api/registrations/:eventId - cancel the logged-in attendee's registration
router.delete('/:eventId', authenticateToken, async (req, res) => {
  const eventId = readEventId(req, res);
  if (eventId === null) return undefined;

  try {
    const [result] = await pool.query(
      'DELETE FROM registrations WHERE attendee_id = ? AND event_id = ?',
      [req.user.id, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'You are not registered for this event' });
    }

    return res.json({ message: 'Your registration was cancelled.' });
  } catch (err) {
    console.error('Cancel registration error:', err.message);
    return res.status(500).json({ error: 'Could not cancel your registration' });
  }
});

module.exports = router;
