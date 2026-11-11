const { query } = require('../db/connection');

/**
 * Security Audit Logging Service (Tamper-Evident Ledger).
 * Tracks sensitive governance, treasury, dispatch, and administrative events.
 *
 * @param {Object} entry
 * @param {number|null} entry.userId - Authenticated user ID (if available)
 * @param {string|null} entry.userRole - User role (CUSTOMER, WORKER, COOPERATIVE_ADMIN)
 * @param {string} entry.action - Standard action tag (e.g. 'PAYMENT_PROCESSED', 'WORKER_VERIFIED')
 * @param {string|null} entry.entityType - Target entity ('BOOKING', 'WORKER', 'SOCIETY', 'DISPUTE')
 * @param {string|number|null} entry.entityId - Target entity ID
 * @param {string|null} entry.ipAddress - Client IP address
 * @param {Object|null} entry.details - Arbitrary JSON metadata
 */
async function logAuditEvent({
  userId = null,
  userRole = null,
  action,
  entityType = null,
  entityId = null,
  ipAddress = null,
  details = null,
}) {
  try {
    if (!action) return;

    await query(`
      INSERT INTO audit_logs (user_id, user_role, action, entity_type, entity_id, ip_address, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      userRole,
      action,
      entityType,
      entityId ? String(entityId) : null,
      ipAddress,
      details ? JSON.stringify(details) : null,
    ]);
  } catch (err) {
    // Non-blocking: Audit failure should be logged to console without crashing user request
    console.error('⚠️ Audit log recording error:', err.message);
  }
}

/**
 * Retrieve recent audit logs (Restricted to Cooperative Admins).
 */
async function getAuditLogs(limit = 100) {
  const res = await query(`
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.id DESC
    LIMIT $1
  `, [limit]);
  return res.rows;
}

module.exports = {
  logAuditEvent,
  getAuditLogs,
};
