const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'sahakari-shramsetu-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a cryptographically secure hash of the token for revocation tracking.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a JWT token for a user.
 * @param {Object} user - User object with id, email, role
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Revoke a token (placed in token_denylist table).
 */
async function revokeToken(token) {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const tokenHash = hashToken(token);

    await query(`
      INSERT INTO token_denylist (token_hash, expires_at)
      VALUES ($1, $2)
      ON CONFLICT (token_hash) DO NOTHING
    `, [tokenHash, expiresAt]);

    return true;
  } catch (err) {
    console.error('Revoke token error:', err.message);
    return false;
  }
}

/**
 * Check if a token has been revoked / blacklisted.
 */
async function isTokenRevoked(token) {
  try {
    const tokenHash = hashToken(token);
    const result = await query(
      'SELECT id FROM token_denylist WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP LIMIT 1',
      [tokenHash]
    );
    return result.rowCount > 0;
  } catch (err) {
    console.error('Check token revoked error:', err.message);
    return false;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  revokeToken,
  isTokenRevoked,
  hashToken,
};
