const jwt = require('jsonwebtoken');

// Checks the login token sent as "Authorization: Bearer <token>".
// On success the logged-in user ({ id, email, role }) is available as req.user.
// Used by every route that needs a login, so they all answer the same way.
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Your session has expired. Please log in again.' });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
