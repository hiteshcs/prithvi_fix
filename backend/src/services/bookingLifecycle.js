const { query } = require('../db/connection');

/**
 * Release a worker to AVAILABLE if they have no other live jobs (ACCEPTED or IN_PROGRESS).
 */
async function releaseWorkerIfIdle(workerId) {
  if (!workerId) return;
  try {
    const liveJobs = await query(`
      SELECT COUNT(*) as count FROM bookings
      WHERE (worker_id = $1 OR paired_master_worker_id = $1)
        AND status IN ('ACCEPTED', 'IN_PROGRESS')
    `, [workerId]);

    if (parseInt(liveJobs.rows[0].count, 10) === 0) {
      await query(`
        UPDATE workers
        SET availability = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND availability = 'BUSY'
      `, [workerId]);
    }
  } catch (err) {
    console.error(`Error releasing worker ${workerId}:`, err.message);
  }
}

/**
 * 1. Auto-cancel unaccepted bookings:
 *    - Emergency orders (is_emergency = 1): Must be accepted within 10 minutes of creation.
 *    - Standard orders (is_emergency = 0): Must be accepted within 30 minutes of creation.
 */
async function expireUnacceptedBookings() {
  try {
    const expiredRes = await query(`
      UPDATE bookings
      SET status = 'CANCELLED',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = CASE
            WHEN is_emergency = 1 THEN 'Auto-cancelled: Emergency acceptance window (10 mins) expired without artisan acceptance.'
            ELSE 'Auto-cancelled: Standard acceptance window (30 mins) expired without artisan acceptance.'
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('REQUESTED', 'MATCHED')
        AND (
          (is_emergency = 1 AND created_at < NOW() - INTERVAL '10 minutes')
          OR
          (is_emergency = 0 AND created_at < NOW() - INTERVAL '30 minutes')
        )
      RETURNING id, booking_code, worker_id, paired_master_worker_id, is_emergency, status, cancellation_reason;
    `);

    for (const b of expiredRes.rows) {
      if (b.worker_id) await releaseWorkerIfIdle(b.worker_id);
      if (b.paired_master_worker_id) await releaseWorkerIfIdle(b.paired_master_worker_id);
      console.log(`⏱️ [Lifecycle] Auto-cancelled expired unaccepted order: ${b.booking_code} (${b.is_emergency ? 'Emergency' : 'Standard'})`);
    }

    return expiredRes.rows;
  } catch (err) {
    console.error('Error expiring unaccepted bookings:', err.message);
    return [];
  }
}

/**
 * 2. Next-Day Completion / Overdue Slot Resolution:
 *    "if a work was Scheduled Slot: 2026-08-28 at 02:00 PM it should be over by next day"
 *    Any job whose scheduled_date is before today (scheduled_date < CURRENT_DATE):
 *    - If IN_PROGRESS or ACCEPTED: auto-complete it, arm 30-day warranty, mark invoice paid, release worker.
 *    - If REQUESTED or MATCHED: auto-cancel with date elapsed reason.
 */
async function closeOverdueScheduledJobs() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Close IN_PROGRESS / ACCEPTED past-date jobs as COMPLETED
    const overdueActiveRes = await query(`
      UPDATE bookings
      SET status = 'COMPLETED',
          completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP),
          guarantee_armed_until = COALESCE(guarantee_armed_until, CURRENT_TIMESTAMP + INTERVAL '30 days'),
          notes = CASE 
            WHEN notes IS NULL OR notes = '' THEN 'Job completed (over by next day rule).'
            ELSE notes || ' [Completed - next-day lifecycle schedule rule]'
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('IN_PROGRESS', 'ACCEPTED')
        AND scheduled_date < $1
      RETURNING id, booking_code, worker_id, paired_master_worker_id, scheduled_date, scheduled_time, amount;
    `, [todayStr]);

    for (const b of overdueActiveRes.rows) {
      // Mark invoice paid
      await query(`UPDATE invoices SET payment_status = 'PAID' WHERE booking_id = $1`, [b.id]);

      // Update worker stats
      if (b.worker_id) {
        await query(`
          UPDATE workers
          SET total_jobs_completed = total_jobs_completed + 1,
              total_earnings = total_earnings + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [b.amount || 499, b.worker_id]);

        await releaseWorkerIfIdle(b.worker_id);
      }
      if (b.paired_master_worker_id) {
        await releaseWorkerIfIdle(b.paired_master_worker_id);
      }

      console.log(`✅ [Lifecycle] Auto-completed past scheduled job: ${b.booking_code} (Scheduled: ${b.scheduled_date} at ${b.scheduled_time} - over by next day rule)`);
    }

    // Cancel REQUESTED / MATCHED bookings whose scheduled date has completely passed
    const overdueRequestedRes = await query(`
      UPDATE bookings
      SET status = 'CANCELLED',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = 'Auto-cancelled: Scheduled service date has passed without execution.',
          updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('REQUESTED', 'MATCHED')
        AND scheduled_date < $1
      RETURNING id, booking_code, worker_id, paired_master_worker_id, scheduled_date;
    `, [todayStr]);

    for (const b of overdueRequestedRes.rows) {
      if (b.worker_id) await releaseWorkerIfIdle(b.worker_id);
      if (b.paired_master_worker_id) await releaseWorkerIfIdle(b.paired_master_worker_id);
      console.log(`🚫 [Lifecycle] Auto-cancelled past unfulfilled booking: ${b.booking_code} (Date: ${b.scheduled_date})`);
    }

    return {
      completed: overdueActiveRes.rows,
      cancelled: overdueRequestedRes.rows,
    };
  } catch (err) {
    console.error('Error closing overdue scheduled jobs:', err.message);
    return { completed: [], cancelled: [] };
  }
}

let lastLifecycleCheck = 0;
const LIFECYCLE_THROTTLE_MS = 15000; // Throttle to at most once per 15s

/**
 * Execute all lifecycle checks (acceptance timeout + next-day completion).
 * Throttled to eliminate redundant DB lock contention on rapid user requests.
 */
async function runLifecycleChecks(force = false) {
  const now = Date.now();
  if (!force && now - lastLifecycleCheck < LIFECYCLE_THROTTLE_MS) {
    return { expired: [], overdue: { completed: [], cancelled: [] } };
  }
  lastLifecycleCheck = now;
  const expired = await expireUnacceptedBookings();
  const overdue = await closeOverdueScheduledJobs();
  return { expired, overdue };
}

let lifecycleTimer = null;

/**
 * Start periodic lifecycle worker (runs every 30 seconds).
 */
function startLifecycleCron(intervalMs = 30000) {
  if (lifecycleTimer) clearInterval(lifecycleTimer);
  // Run once immediately on startup
  runLifecycleChecks().catch(() => {});
  // Schedule recurring checks
  lifecycleTimer = setInterval(() => {
    runLifecycleChecks().catch(() => {});
  }, intervalMs);
  console.log(`⚙️ [Lifecycle] Background booking lifecycle monitor active (30s interval: 10m/30m acceptance timeout & next-day completion)`);
}

module.exports = {
  expireUnacceptedBookings,
  closeOverdueScheduledJobs,
  runLifecycleChecks,
  startLifecycleCron,
  releaseWorkerIfIdle,
};
