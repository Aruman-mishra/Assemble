const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function verify(req) {
  const h = req.headers.authorization;
  if (!h) return null;
  try {
    return jwt.verify(h.replace('Bearer ', ''), JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { sign, verify };
