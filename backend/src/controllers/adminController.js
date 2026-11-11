const { query } = require('../db/connection');
const { calculateHaversineDistanceKm, calculateEtaMinutes } = require('./matchingController');
const { logAuditEvent, getAuditLogs } = require('../services/auditLog');

/**
 * GET /api/admin/dashboard
 * Aggregated administrative metrics, statistics, and cooperative analytics.
 */
async function getAdminDashboard(req, res) {
  try {
    // 1. Statistics
    const totalWorkersRes = await query('SELECT COUNT(*) as c FROM workers');
    const verifiedWorkersRes = await query("SELECT COUNT(*) as c FROM workers WHERE verification_status = 'VERIFIED'");
    const pendingWorkersRes = await query("SELECT COUNT(*) as c FROM workers WHERE verification_status = 'PENDING'");
    const rejectedWorkersRes = await query("SELECT COUNT(*) as c FROM workers WHERE verification_status = 'REJECTED'");

    const totalBookingsRes = await query('SELECT COUNT(*) as c FROM bookings');
    const activeJobsRes = await query("SELECT COUNT(*) as c FROM bookings WHERE status IN ('REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS')");
    const completedJobsRes = await query("SELECT COUNT(*) as c FROM bookings WHERE status = 'COMPLETED'");
    const emergencyRequestsRes = await query('SELECT COUNT(*) as c FROM bookings WHERE is_emergency = 1');

    const totalWorkers = parseInt(totalWorkersRes.rows[0].c, 10);
    const verifiedWorkers = parseInt(verifiedWorkersRes.rows[0].c, 10);
    const pendingWorkers = parseInt(pendingWorkersRes.rows[0].c, 10);
    const rejectedWorkers = parseInt(rejectedWorkersRes.rows[0].c, 10);

    const totalBookings = parseInt(totalBookingsRes.rows[0].c, 10);
    const activeJobs = parseInt(activeJobsRes.rows[0].c, 10);
    const completedJobs = parseInt(completedJobsRes.rows[0].c, 10);
    const emergencyRequests = parseInt(emergencyRequestsRes.rows[0].c, 10);

    // Worker Earnings & Welfare Pool
    const earningsRes = await query("SELECT SUM(amount) as total_earnings, SUM(cooperative_fee) as total_welfare FROM bookings WHERE status = 'COMPLETED'");
    const totalWorkerEarnings = parseFloat(earningsRes.rows[0].total_earnings || 0);
    const totalWelfareFund = parseFloat(earningsRes.rows[0].total_welfare || 0);

    // 2. Cooperative Analytics: Top Requested Services
    const topServicesRes = await query(`
      SELECT s.name, s.category, 
             COUNT(b.id) as request_count, 
             COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM services s
      LEFT JOIN bookings b ON b.service_id = s.id
      GROUP BY s.id, s.name, s.category
      ORDER BY request_count DESC
      LIMIT 6
    `);

    // 3. Service Demand by District / Region
    const demandByAreaRes = await query(`
      SELECT 
        COALESCE(location_district, 'Khordha') as area,
        COUNT(*) as total_requests,
        SUM(CASE WHEN is_emergency = 1 THEN 1 ELSE 0 END) as emergency_requests,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_requests
      FROM bookings
      GROUP BY location_district
      ORDER BY total_requests DESC
    `);

    // 4. Worker Utilization & Capacity by Category
    const workerUtilizationRes = await query(`
      SELECT 
        sk.category,
        COUNT(DISTINCT w.id) as total_workers,
        SUM(CASE WHEN w.availability = 'AVAILABLE' THEN 1 ELSE 0 END) as available_workers,
        SUM(CASE WHEN w.availability = 'BUSY' THEN 1 ELSE 0 END) as busy_workers
      FROM skills sk
      JOIN worker_skills ws ON ws.skill_id = sk.id
      JOIN workers w ON ws.worker_id = w.id
      WHERE w.verification_status = 'VERIFIED'
      GROUP BY sk.category
      ORDER BY total_workers DESC
    `);

    // 5. Recent System Activity Feed
    const recentActivityRes = await query(`
      SELECT b.id, b.booking_code, b.status, b.is_emergency, b.created_at,
             s.name as service_name, u.name as customer_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      ORDER BY b.id DESC
      LIMIT 8
    `);

    res.json({
      statistics: {
        totalWorkers,
        verifiedWorkers,
        pendingWorkers,
        rejectedWorkers,
        totalBookings,
        activeJobs,
        completedJobs,
        emergencyRequests,
        totalWorkerEarnings,
        totalWelfareFund,
      },
      analytics: {
        topServices: topServicesRes.rows,
        demandByArea: demandByAreaRes.rows,
        workerUtilization: workerUtilizationRes.rows,
        recentActivity: recentActivityRes.rows,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch admin dashboard metrics.' });
  }
}

/**
 * GET /api/admin/workers
 * List workers with full administration details and filters.
 */
async function getAdminWorkers(req, res) {
  try {
    const { status, district, search } = req.query;

    let baseQuery = `
      SELECT w.*, u.name, u.email, u.phone, u.district, u.city, u.address,
             c.name as cooperative_name, c.registration_number as cooperative_reg,
             c.local_area, c.jurisdiction_zone,
             s.name as society_name, s.society_code,
             (w.society_id IS NULL) as is_independent
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN societies s ON w.society_id = s.id
    `;

    const where = [];
    const params = [];
    let paramIdx = 1;

    // Federation / Society Admin scope: only workers under their specific local society/federation
    if (req.user?.admin_type === 'SOCIETY_ADMIN' && req.user?.society_id) {
      where.push(`(w.society_id = $${paramIdx} OR w.cooperative_id = $${paramIdx})`);
      params.push(req.user.society_id);
      paramIdx++;
    } else if (req.user?.admin_type === 'DCO_REGISTRAR' && req.user?.district) {
      where.push(`u.district = $${paramIdx}`);
      params.push(req.user.district);
      paramIdx++;
    }

    if (status) {
      where.push(`w.verification_status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (district && req.user?.admin_type !== 'DCO_REGISTRAR') {
      where.push(`u.district = $${paramIdx}`);
      params.push(district);
      paramIdx++;
    }
    if (search) {
      where.push(`(u.name ILIKE $${paramIdx} OR w.worker_code ILIKE $${paramIdx + 1} OR c.name ILIKE $${paramIdx + 2} OR COALESCE(s.name, '') ILIKE $${paramIdx + 3})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      paramIdx += 4;
    }

    if (where.length > 0) {
      baseQuery += ' WHERE ' + where.join(' AND ');
    }

    baseQuery += ' ORDER BY w.id DESC';

    const workersRes = await query(baseQuery, params);
    const workers = workersRes.rows;

    for (const w of workers) {
      const skillsRes = await query(`
        SELECT s.name, s.category, ws.proficiency_level
        FROM worker_skills ws
        JOIN skills s ON ws.skill_id = s.id
        WHERE ws.worker_id = $1
      `, [w.id]);
      w.skills = skillsRes.rows;

      const certsRes = await query(`
        SELECT * FROM certifications WHERE worker_id = $1
      `, [w.id]);
      w.certifications = certsRes.rows;
    }

    res.json({ workers });
  } catch (err) {
    console.error('Admin get workers error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch workers for admin.' });
  }
}

/**
 * PUT /api/admin/workers/:id/verify
 * Update worker verification status (VERIFIED, REJECTED, PENDING).
 */
async function verifyWorker(req, res) {
  try {
    const { status, rejectionReason, verificationStep } = req.body;
    const workerId = req.params.id;
    const adminId = req.user?.id || null;

    const allowed = ['VERIFIED', 'REJECTED', 'PENDING'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid verification status.' });
    }

    const workerRes = await query(`
      SELECT w.id, w.society_id, w.cooperative_id, w.verification_step, u.district 
      FROM workers w 
      JOIN users u ON w.user_id = u.id 
      WHERE w.id = $1
    `, [workerId]);
    if (workerRes.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker not found.' });
    }

    const workerRecord = workerRes.rows[0];
    const targetStep = verificationStep ? Number(verificationStep) : (status === 'VERIFIED' ? 4 : (workerRecord.verification_step || 2));

    // Statutory Authority Separation:
    // The approval authority for artisans/workers is strictly their registered Primary Cooperative Society.
    // The approval authority for societies is the DCO.
    if (req.user?.admin_type === 'DCO_REGISTRAR') {
      return res.status(403).json({
        error: 'Statutory Authority Restriction',
        message: 'Under statutory cooperative hierarchy, the approval authority for workers is strictly the Primary Cooperative Society they chose during registration. The DCO is the approval authority for Societies, not individual artisans.'
      });
    }

    if (req.user?.admin_type === 'SOCIETY_ADMIN' && req.user?.society_id) {
      if (workerRecord.society_id && workerRecord.society_id !== req.user.society_id && workerRecord.cooperative_id !== req.user.society_id) {
        return res.status(403).json({
          error: 'Jurisdiction Restriction',
          message: 'As a Primary Cooperative Society Admin, you can only review and approve workers registered under your society jurisdiction.'
        });
      }
    }

    if (status === 'VERIFIED') {
      await query(`
        UPDATE workers
        SET verification_status = 'VERIFIED',
            verification_step = 4,
            rejection_reason = NULL,
            availability = 'AVAILABLE',
            reviewed_by_admin_id = $1,
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [adminId, workerId]);

      // Also update certifications
      await query(`
        UPDATE certifications
        SET verification_status = 'VERIFIED'
        WHERE worker_id = $1
      `, [workerId]);
    } else if (status === 'REJECTED') {
      await query(`
        UPDATE workers
        SET verification_status = 'REJECTED',
            rejection_reason = $1,
            availability = 'OFFLINE',
            reviewed_by_admin_id = $2,
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [rejectionReason || 'Trade or KYC documents could not be verified by Primary Cooperative Society.', adminId, workerId]);

      await query(`
        UPDATE certifications
        SET verification_status = 'REJECTED'
        WHERE worker_id = $1
      `, [workerId]);
    } else {
      await query(`
        UPDATE workers
        SET verification_status = 'PENDING',
            verification_step = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [targetStep, workerId]);
    }

    // Record administrative action in immutable audit log
    await logAuditEvent({
      userId: adminId,
      userRole: req.user?.role,
      action: status === 'VERIFIED' ? 'WORKER_VERIFIED' : status === 'REJECTED' ? 'WORKER_REJECTED' : 'WORKER_STATUS_PENDING',
      entityType: 'WORKER',
      entityId: workerId,
      ipAddress: req.ip,
      details: { status, rejectionReason },
    });

    res.json({
      message: `Worker application updated to ${status}`,
      status,
      verificationStep: targetStep,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    });
  } catch (err) {
    console.error('Verify worker error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update verification status.' });
  }
}

/**
 * GET /api/admin/bookings
 * List all bookings across the cooperative federation.
 */
async function getAdminBookings(req, res) {
  try {
    const { status, is_emergency, limit = 100 } = req.query;

    let baseQuery = `
      SELECT b.*,
             s.name as service_name, s.category as service_category,
             u_cust.name as customer_name, u_cust.phone as customer_phone,
             u_work.name as worker_name,
             w.worker_code,
             w.latitude as worker_latitude, w.longitude as worker_longitude, w.service_area as worker_service_area,
             c.name as cooperative_name,
             p.status as payment_status, p.transaction_id
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u_cust ON b.customer_id = u_cust.id
      LEFT JOIN workers w ON b.worker_id = w.id
      LEFT JOIN users u_work ON w.user_id = u_work.id
      LEFT JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN payments p ON p.booking_id = b.id
    `;

    const where = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      where.push(`b.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (is_emergency === 'true') {
      where.push(`b.is_emergency = 1`);
    }

    if (where.length > 0) {
      baseQuery += ' WHERE ' + where.join(' AND ');
    }

    baseQuery += ` ORDER BY b.id DESC LIMIT $${paramIdx}`;
    params.push(parseInt(limit, 10));

    const result = await query(baseQuery, params);

    const enrichedBookings = result.rows.map((b) => {
      let custLat = Number(b.latitude);
      let custLng = Number(b.longitude);
      const cityUpper = (b.location_city || b.location_district || '').toUpperCase();

      if (isNaN(custLat) || !custLat) {
        if (cityUpper.includes('PURI')) { custLat = 19.8135; custLng = 85.8312; }
        else if (cityUpper.includes('CUTTACK')) { custLat = 20.4625; custLng = 85.8830; }
        else { custLat = 20.3540; custLng = 85.8170; }
      }

      let workerLat = Number(b.worker_latitude);
      let workerLng = Number(b.worker_longitude);

      if (isNaN(workerLat) || !workerLat) {
        if (cityUpper.includes('PURI')) { workerLat = 19.8100; workerLng = 85.8380; }
        else if (cityUpper.includes('CUTTACK')) { workerLat = 20.4890; workerLng = 85.8770; }
        else { workerLat = 20.2750; workerLng = 85.8100; }
      }

      const straightDist = calculateHaversineDistanceKm(workerLat, workerLng, custLat, custLng) || 2.4;
      const distanceKm = Math.max(1.2, Math.round(straightDist * 1.3 * 10) / 10);
      const etaMinutes = calculateEtaMinutes(distanceKm);

      return {
        ...b,
        latitude: custLat,
        longitude: custLng,
        worker_latitude: workerLat,
        worker_longitude: workerLng,
        distance_km: distanceKm,
        eta_minutes: etaMinutes,
        tracking: {
          workerCoords: { lat: workerLat, lng: workerLng },
          customerCoords: { lat: custLat, lng: custLng },
          distanceKm,
          etaMinutes,
          dispatchStatus: b.status === 'COMPLETED' ? 'Service Completed' : b.status === 'IN_PROGRESS' ? 'On-Site' : 'En Route',
        }
      };
    });

    res.json({ bookings: enrichedBookings });
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch bookings for admin.' });
  }
}

/**
 * GET /api/admin/audit-logs
 * Security Audit Trail Console for Cooperative Federation Admins.
 */
async function getAdminAuditLogs(req, res) {
  try {
    const logs = await getAuditLogs(100);
    res.json({ auditLogs: logs });
  } catch (err) {
    console.error('Admin get audit logs error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch audit logs.' });
  }
}

module.exports = {
  getAdminDashboard,
  getAdminWorkers,
  verifyWorker,
  getAdminBookings,
  getAdminAuditLogs,
};
