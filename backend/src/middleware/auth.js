const jwt = require('jsonwebtoken');
const { findUserById, sanitizeUser } = require('../services/db');

/**
 * Verify JWT token and attach user to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB
    const user = await findUserById(decoded.id);

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or user is deactivated.',
      });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.',
    });
  }
};

/**
 * Optional auth — attaches user if token present but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(decoded.id);
      if (user && user.isActive !== false) {
        req.user = sanitizeUser(user);
      }
    }
  } catch (_) {}
  next();
};

module.exports = { authMiddleware, optionalAuth };
