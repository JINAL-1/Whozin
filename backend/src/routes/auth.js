const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// Creates a signed login token that the frontend sends with later requests
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['attendee', 'organizer']).withMessage('Role must be attendee or organizer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password, role = 'attendee' } = req.body;

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      // Hash the password so the plain text is never stored
      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, passwordHash, role]
      );

      const user = { id: result.insertId, email, role };
      res.status(201).json({ token: signToken(user), user });
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = ?',
        [email]
      );
      const user = rows[0];
      const passwordMatches = user && (await bcrypt.compare(password, user.password_hash));

      // Same message for a wrong email or wrong password, so attackers can't tell which
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const safeUser = { id: user.id, email: user.email, role: user.role };
      res.json({ token: signToken(safeUser), user: safeUser });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;