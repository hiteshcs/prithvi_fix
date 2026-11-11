const { verifyToken, isTokenRevoked } = require('../utils/jwt');
const { query } = require('../db/connection');

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header using PostgreSQL.
 * Attaches user object to req.user.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if token has been revoked / logged out
    const revoked = await isTokenRevoked(token);
    if (revoked) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been revoked. Please log in again.',
      });
    }

    const decoded = verifyToken(token);
    const result = await query(
      'SELECT id, name, email, phone, role, district, city, is_active, admin_type, designation, society_id FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or account has been removed.',
      });
    }

    if (user.is_active === 0 || user.is_active === false) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is deactivated. Contact your cooperative administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please log in again.',
      });
    }
    console.error('Auth verification error:', err.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token.',
    });
  }
}

/**
 * Role-based authorization middleware.
 * Must be used AFTER authenticate middleware.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
