const { query } = require('../db/connection');

/**
 * Resolve what the authenticated user is allowed to do with a given booking.
 *
 * Every /api/bookings/:id/* handler needs the same three questions answered:
 * is this the cooperative admin, the citizen who raised the order, or the
 * artisan the order is dispatched to? Centralising it keeps the guards
 * consistent instead of each handler inventing its own (or skipping it).
 *
 * @param {Object} user - req.user (id, role)
 * @param {Object} booking - booking row (customer_id, worker_id, paired_master_worker_id)
 * @returns {Promise<{isAdmin: boolean, isOwner: boolean, isAssignedWorker: boolean, workerId: number|null}>}
 */
async function getBookingAccess(user, booking) {
  const access = { isAdmin: false, isOwner: false, isAssignedWorker: false, workerId: null };
  if (!user || !booking) return access;

  access.isAdmin = user.role === 'COOPERATIVE_ADMIN';
  access.isOwner = booking.customer_id === user.id;

  if (user.role === 'WORKER') {
    const workerRes = await query('SELECT id FROM workers WHERE user_id = $1', [user.id]);
    access.workerId = workerRes.rows[0] ? workerRes.rows[0].id : null;
    access.isAssignedWorker =
      access.workerId !== null &&
      (booking.worker_id === access.workerId || booking.paired_master_worker_id === access.workerId);
  }

  return access;
}

module.exports = { getBookingAccess };
