const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const auth = req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);
    // attach user info; do NOT attach passwordHash
    req.user = { id: payload.id, role: payload.role, email: payload.email, name: payload.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// role check middleware factory
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!Array.isArray(roles)) roles = [roles];
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient permission' });
  next();
};

module.exports = { requireAuth, requireRole };
