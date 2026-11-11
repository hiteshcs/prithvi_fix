const { query } = require('../db/connection');
const { runLifecycleChecks } = require('../services/bookingLifecycle');

/**
 * GET /api/worker-portal/dashboard
 * Aggregated dashboard metrics for the logged-in worker.
 */
async function getWorkerDashboard(req, res) {
  try {
    // Run automated lifecycle reconciliation (10m/30m acceptance timeout & next-day completion)
    await runLifecycleChecks();

    const userId = req.user.id;

    // Find worker record
    const workerRes = await query(`
      SELECT w.*, u.name, u.email, u.phone, u.district, u.city, u.address, u.pincode,
             c.name as cooperative_name, c.registration_number as cooperative_reg, c.contact_phone as cooperative_phone,
             s.name as society_name, s.society_code,
             (w.society_id IS NULL) as is_independent
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN societies s ON w.society_id = s.id
      WHERE w.user_id = $1
    `, [userId]);

    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found for this account.' });
    }

    // Worker skills
    const skillsRes = await query(`
      SELECT s.id, s.name, s.category, ws.proficiency_level
      FROM worker_skills ws
      JOIN skills s ON ws.skill_id = s.id
      WHERE ws.worker_id = $1
    `, [worker.id]);
    const skills = skillsRes.rows;

    // Worker certifications
    const certsRes = await query(`
      SELECT * FROM certifications WHERE worker_id = $1 ORDER BY issue_date DESC
    `, [worker.id]);
    const certifications = certsRes.rows;

    // Incoming requests (REQUESTED for worker's trade category and district/city, OR MATCHED to this worker)
    const incomingRes = await query(`
      SELECT b.*, s.name as service_name, s.category as service_category, s.icon as service_icon,
             u.name as customer_name, u.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE (b.worker_id = $1 AND b.status = 'MATCHED')
         OR (
              b.worker_id IS NULL 
              AND b.status = 'REQUESTED' 
              AND (b.declined_worker_ids IS NULL OR b.declined_worker_ids NOT LIKE '%,' || $1 || ',%')
              AND (
                b.location_district = $2 
                OR $2 IS NULL 
                OR b.location_district IS NULL 
                OR b.location_city = $4
              )
              AND (
                $3 = '' OR $3 IS NULL
                OR $3 ILIKE '%' || s.category || '%'
                OR s.category ILIKE '%' || $3 || '%'
                OR s.category = 'Emergency Services'
                OR EXISTS (
                  SELECT 1 FROM worker_skills ws
                  JOIN skills sk ON ws.skill_id = sk.id
                  WHERE ws.worker_id = $1
                    AND (sk.category ILIKE s.category OR s.category ILIKE '%' || sk.category || '%' OR sk.name ILIKE '%' || s.name || '%')
                )
              )
            )
      ORDER BY b.is_emergency DESC, b.id DESC
      LIMIT 15
    `, [worker.id, worker.district || 'Khordha', worker.primary_trade || '', worker.city || 'Bhubaneswar']);
    const incomingJobs = incomingRes.rows;

    // Active Jobs (ACCEPTED or IN_PROGRESS)
    const activeRes = await query(`
      SELECT b.*, s.name as service_name, s.category as service_category, s.icon as service_icon,
             u.name as customer_name, u.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE (b.worker_id = $1 OR b.paired_master_worker_id = $1) AND b.status IN ('ACCEPTED', 'IN_PROGRESS')
      ORDER BY b.id DESC
    `, [worker.id]);
    const activeJobs = activeRes.rows;

    // Auto-heal worker availability: If artisan is actively assigned to live jobs, they must be BUSY
    if (activeJobs.length > 0 && worker.availability === 'AVAILABLE') {
      await query(`
        UPDATE workers
        SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [worker.id]);
      worker.availability = 'BUSY';
    }

    // Completed Jobs with Itemized 93-2-5 Split Metrics
    const completedRes = await query(`
      SELECT b.*, s.name as service_name, s.category as service_category,
             u.name as customer_name,
             p.status as payment_status,
             r.rating as review_rating, r.comment as review_comment
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN payments p ON p.booking_id = b.id
      LEFT JOIN reviews r ON r.booking_id = b.id
      WHERE b.worker_id = $1 AND b.status = 'COMPLETED'
      ORDER BY b.id DESC
      LIMIT 30
    `, [worker.id]);

    const completedJobs = completedRes.rows.map((job) => {
      const grossLabour = Number(job.amount || 0);
      const parts = Number(job.parts_cost || 0);
      const workerWage93 = Math.round(grossLabour * 0.93 * 100) / 100;
      const welfareFund5 = Math.round(grossLabour * 0.05 * 100) / 100;
      const platformFee2 = Math.round(grossLabour * 0.02 * 100) / 100;
      const netTakeHome = Math.round((workerWage93 + parts) * 100) / 100;

      return {
        ...job,
        gross_labour: grossLabour,
        worker_wage_93: workerWage93,
        welfare_fund_5: welfareFund5,
        platform_fee_2: platformFee2,
        parts_cost: parts,
        net_payout: netTakeHome,
        settlement_status: job.payment_status === 'PAID' ? 'SETTLED' : (job.payment_status || 'SETTLED'),
      };
    });

    // Cumulative Lifetime 93-2-5 Split Summary
    const summaryRes = await query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_labour,
        COALESCE(SUM(parts_cost), 0) as total_parts,
        COALESCE(SUM(total_amount), 0) as total_gross,
        COUNT(*) as total_completed
      FROM bookings
      WHERE worker_id = $1 AND status = 'COMPLETED'
    `, [worker.id]);

    const summaryRow = summaryRes.rows[0] || {};
    const totalLabour = Number(summaryRow.total_labour) || Number(worker.total_earnings) || 0;
    const totalParts = Number(summaryRow.total_parts) || 0;
    const lifetimeWage93 = Math.round(totalLabour * 0.93 * 100) / 100;
    const lifetimeWelfare5 = Math.round(totalLabour * 0.05 * 100) / 100;
    const lifetimePlatform2 = Math.round(totalLabour * 0.02 * 100) / 100;
    const lifetimeDisbursed = Math.round((lifetimeWage93 + totalParts) * 100) / 100;

    const splitSummary = {
      totalLabour,
      totalParts,
      grossBilled: totalLabour + totalParts,
      workerWage93: lifetimeWage93,
      welfareFund5: lifetimeWelfare5,
      platformFee2: lifetimePlatform2,
      netDisbursed: lifetimeDisbursed,
      statutoryBylaw: 'Odisha Cooperative Societies Act 1962 (93% Direct Living Wage, 5% ESIC Welfare, 2% Infrastructure)',
    };

    // Recent reviews
    const reviewsRes = await query(`
      SELECT r.*, u.name as customer_name, b.service_id, s.name as service_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [worker.id]);
    const reviews = reviewsRes.rows;

    // Welfare enrolled count
    const welfareCountRes = await query(`
      SELECT COUNT(*) as count FROM worker_welfare
      WHERE worker_id = $1 AND status = 'ENROLLED'
    `, [worker.id]);
    const welfareCount = parseInt(welfareCountRes.rows[0].count, 10);

    res.json({
      worker,
      skills,
      certifications,
      stats: {
        totalEarnings: worker.total_earnings || 0,
        totalJobsCompleted: worker.total_jobs_completed || 0,
        activeJobsCount: activeJobs.length,
        incomingJobsCount: incomingJobs.length,
        rating: worker.rating || 0,
        totalReviews: worker.total_reviews || 0,
        welfareEnrolledCount: welfareCount,
      },
      splitSummary,
      incomingJobs,
      activeJobs,
      completedJobs,
      reviews,
    });
  } catch (err) {
    console.error('Worker dashboard error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch worker dashboard data.' });
  }
}

/**
 * PUT /api/worker-portal/availability
 * Update worker availability status (AVAILABLE, BUSY, OFFLINE).
 */
async function updateAvailability(req, res) {
  try {
    const { availability } = req.body;
    const userId = req.user.id;

    const allowed = ['AVAILABLE', 'BUSY', 'OFFLINE'];
    if (!allowed.includes(availability)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid availability status.' });
    }

    // Business rule: Both Cooperative Verification and Mandatory ISI Toolkit are required to go AVAILABLE
    if (availability === 'AVAILABLE') {
      const workerCheck = await query(`
        SELECT verification_status, toolkit_compliance 
        FROM workers 
        WHERE user_id = $1
      `, [userId]);
      const w = workerCheck.rows[0];
      if (!w || w.verification_status !== 'VERIFIED' || w.toolkit_compliance !== 'VERIFIED_EQUIPPED') {
        return res.status(403).json({
          error: 'Compliance Prerequisite Unmet',
          message: 'Both Cooperative Verification (VERIFIED) and Mandatory ISI Toolkit (VERIFIED_EQUIPPED) are strictly required before an artisan can go online and take jobs.'
        });
      }
    }

    // Business rule: Workers with active jobs (ACCEPTED or IN_PROGRESS) cannot be marked AVAILABLE or OFFLINE
    if (availability === 'AVAILABLE' || availability === 'OFFLINE') {
      const activeJobsCheck = await query(`
        SELECT b.id, b.booking_code, b.status, s.name as service_name
        FROM bookings b
        JOIN workers w ON (b.worker_id = w.id OR b.paired_master_worker_id = w.id)
        JOIN services s ON b.service_id = s.id
        WHERE w.user_id = $1 AND b.status IN ('ACCEPTED', 'IN_PROGRESS')
        LIMIT 1
      `, [userId]);

      if (activeJobsCheck.rows.length > 0) {
        const job = activeJobsCheck.rows[0];
        return res.status(400).json({
          error: 'Validation Error',
          message: `Cannot change availability to ${availability} while you have an active work order (${job.booking_code} - ${job.service_name} is ${job.status}). Please complete or update your active jobs first.`
        });
      }
    }

    await query(`
      UPDATE workers SET availability = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [availability, userId]);

    res.json({ message: `Availability status updated to ${availability}`, availability });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update availability.' });
  }
}

/**
 * PUT /api/worker-portal/jobs/:id/action
 * Handle worker dispatch action: ACCEPT, DECLINE, START, COMPLETE.
 */
async function handleJobAction(req, res) {
  try {
    const { action } = req.body;
    const bookingId = req.params.id;
    const userId = req.user.id;

    const workerRes = await query('SELECT id, verification_status, toolkit_compliance FROM workers WHERE user_id = $1', [userId]);
    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    if (action === 'ACCEPT') {
      if (worker.verification_status !== 'VERIFIED' || worker.toolkit_compliance !== 'VERIFIED_EQUIPPED') {
        return res.status(403).json({
          error: 'Compliance Prerequisite Unmet',
          message: 'Both Cooperative Verification (VERIFIED) and Mandatory ISI Toolkit (VERIFIED_EQUIPPED) are strictly required before an artisan can accept work orders.'
        });
      }
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    // ACCEPT is a claim on an open broadcast, so it is guarded by the atomic
    // conditional UPDATE below. DECLINE may target either a job matched to this
    // artisan or an open broadcast they are being offered. START and COMPLETE
    // mutate a live job that must already belong to them — without this check
    // any logged-in worker could start or complete someone else's booking by id.
    const isAssigned = booking.worker_id === worker.id;
    const isOpenBroadcast = booking.worker_id === null && booking.status === 'REQUESTED';

    if ((action === 'START' || action === 'COMPLETE') && !isAssigned) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This job is not assigned to you.',
      });
    }

    if (action === 'DECLINE') {
      if (!isAssigned && !isOpenBroadcast) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'This job is not in your dispatch pool.',
        });
      }
      if (['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `A job that is already ${booking.status} cannot be declined.`,
        });
      }
    }

    if (action === 'START' && booking.status !== 'ACCEPTED') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Only an accepted job can be started.',
      });
    }

    if (action === 'ACCEPT') {
      // Check 10-min (emergency) / 30-min (standard) acceptance timeout
      const createdTime = new Date(booking.created_at).getTime();
      const elapsedMinutes = (Date.now() - createdTime) / (1000 * 60);
      const maxWindowMinutes = booking.is_emergency ? 10 : 30;

      if (elapsedMinutes > maxWindowMinutes && (booking.status === 'REQUESTED' || booking.status === 'MATCHED')) {
        await query(`
          UPDATE bookings
          SET status = 'CANCELLED',
              cancelled_at = CURRENT_TIMESTAMP,
              cancellation_reason = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [
          `Auto-cancelled: ${booking.is_emergency ? 'Emergency' : 'Standard'} acceptance window (${maxWindowMinutes} mins) expired without artisan acceptance.`,
          bookingId
        ]);

        return res.status(410).json({
          error: 'Order Expired',
          message: `This service request has expired (${maxWindowMinutes}-minute acceptance window exceeded) and was automatically cancelled. Please refresh your dispatch pool.`
        });
      }

      // Generate 4-digit Security OTPs upon worker acceptance
      const arrivalOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

      // First-to-Accept atomic claim: only claim if booking is still REQUESTED & unassigned (or MATCHED to this worker)
      const claimRes = await query(`
        UPDATE bookings
        SET status = 'ACCEPTED',
            worker_id = $1,
            arrival_otp = COALESCE(arrival_otp, $3),
            completion_otp = COALESCE(completion_otp, $4),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND (
            (status = 'REQUESTED' AND worker_id IS NULL)
            OR (status = 'MATCHED' AND worker_id = $1)
          )
        RETURNING *
      `, [worker.id, bookingId, arrivalOtp, completionOtp]);
      if (claimRes.rows.length === 0) {
        return res.status(409).json({
          error: 'Order Already Claimed',
          message: 'This job request has already been accepted by another nearby artisan and is no longer available in the dispatch pool.'
        });
      }

      // Automatically change the worker status to BUSY in schedule slot
      await query(`
        UPDATE workers
        SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [worker.id]);

      // Also update invoice with worker name and cooperative affiliation
      const workerInfoRes = await query(`
        SELECT u.name, c.name as cooperative_name, w.tier
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN cooperatives c ON w.cooperative_id = c.id
        WHERE w.id = $1
      `, [worker.id]);
      if (workerInfoRes.rows[0]) {
        const wInfo = workerInfoRes.rows[0];
        await query(`
          UPDATE invoices
          SET worker_name = $1, cooperative_name = $2
          WHERE booking_id = $3
        `, [`${wInfo.name} (${wInfo.tier} Artisan)`, wInfo.cooperative_name, bookingId]);
      }
    } else if (action === 'DECLINE') {
      await query(`
        UPDATE bookings
        SET status = 'REQUESTED',
            worker_id = NULL,
            declined_worker_ids = CASE 
              WHEN declined_worker_ids IS NULL OR declined_worker_ids = '' THEN ',' || $2 || ','
              WHEN declined_worker_ids NOT LIKE '%,' || $2 || ',%' THEN declined_worker_ids || $2 || ','
              ELSE declined_worker_ids
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [bookingId, worker.id]);

      // If worker has no remaining active jobs, restore to AVAILABLE
      const remainingActive = await query(`
        SELECT COUNT(*) as count FROM bookings
        WHERE worker_id = $1 AND status IN ('ACCEPTED', 'IN_PROGRESS') AND id != $2
      `, [worker.id, bookingId]);

      if (parseInt(remainingActive.rows[0].count, 10) === 0) {
        await query(`
          UPDATE workers
          SET availability = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND availability = 'BUSY'
        `, [worker.id]);
      }
    } else if (action === 'START') {
      await query(`
        UPDATE bookings
        SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [bookingId]);

      // Ensure worker status is BUSY while on-site
      await query(`
        UPDATE workers
        SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [worker.id]);
    } else if (action === 'COMPLETE') {
      if (booking.status === 'COMPLETED') {
        return res.json({ message: 'Booking is already completed', booking });
      }
      const completedAt = new Date().toISOString();
      const guaranteeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await query(`
        UPDATE bookings
        SET status = 'COMPLETED', completed_at = $1, guarantee_armed_until = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [completedAt, guaranteeUntil, bookingId]);

      // Update worker stats
      await query(`
        UPDATE workers
        SET total_jobs_completed = total_jobs_completed + 1,
            total_earnings = total_earnings + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [booking.amount || 299, worker.id]);

      // If worker has no other active jobs, restore to AVAILABLE
      const remainingActive = await query(`
        SELECT COUNT(*) as count FROM bookings
        WHERE worker_id = $1 AND status IN ('ACCEPTED', 'IN_PROGRESS') AND id != $2
      `, [worker.id, bookingId]);

      if (parseInt(remainingActive.rows[0].count, 10) === 0) {
        await query(`
          UPDATE workers
          SET availability = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND availability = 'BUSY'
        `, [worker.id]);
      }

      // Update invoice
      await query(`
        UPDATE invoices SET payment_status = 'PAID' WHERE booking_id = $1
      `, [bookingId]);
    } else {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid action.' });
    }

    const updatedRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    res.json({ message: `Job action ${action} processed successfully`, booking: updatedRes.rows[0] });
  } catch (err) {
    console.error('Job action error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process job action.' });
  }
}

/**
 * GET /api/worker-portal/welfare
 * Get worker welfare and social security information.
 */
async function getWorkerWelfare(req, res) {
  try {
    const userId = req.user.id;

    const workerRes = await query(`
      SELECT w.id, w.worker_code, w.total_earnings, w.total_jobs_completed,
             c.name as cooperative_name
      FROM workers w
      JOIN cooperatives c ON w.cooperative_id = c.id
      WHERE w.user_id = $1
    `, [userId]);

    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    const welfareRes = await query(`
      SELECT * FROM worker_welfare WHERE worker_id = $1 ORDER BY id ASC
    `, [worker.id]);

    const availableSchemes = [
      {
        benefit_type: 'Insurance',
        benefit_name: 'ESIC Group Accident Insurance',
        provider: 'Employees State Insurance Corp',
        details: '₹2,00,000 accidental coverage + disability support',
      },
      {
        benefit_type: 'Health',
        benefit_name: 'Cooperative Health Support & Annual Checkup',
        provider: 'Cooperative Labour Welfare Fund',
        details: 'Free annual health checkup + subsidized family diagnostics',
      },
      {
        benefit_type: 'Training',
        benefit_name: 'NSDC Advanced Trade Upskilling Workshop',
        provider: 'National Skill Development Corp / Vocational Network',
        details: 'Certified 2-week advanced appliance & green energy skill training',
      },
      {
        benefit_type: 'Pension',
        benefit_name: 'EPFO Social Security & Pension Scheme',
        provider: 'Employees Provident Fund Organisation',
        details: 'Monthly cooperative retirement corpus & pension contribution',
      },
      {
        benefit_type: 'Emergency',
        benefit_name: 'Cooperative Emergency Family Assistance',
        provider: 'District Labour Cooperative Federation Fund',
        details: 'Interest-free emergency assistance up to ₹25,000 for medical/disaster needs',
      },
    ];

    res.json({
      worker,
      welfareRecords: welfareRes.rows,
      availableSchemes,
      cooperativeLevyShare: '5% of every completed booking fee is directly credited to your PF & Insurance (Cooperative Welfare) Account',
      pocNotice: 'POC Welfare Integration: Real-world claim processing requires integration with authorized ESIC/EPFO digital portals and physical verification.',
    });
  } catch (err) {
    console.error('Get welfare error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch welfare records.' });
  }
}

/**
 * POST /api/worker-portal/welfare/enroll
 * Apply / enroll for a welfare program.
 */
async function enrollWelfare(req, res) {
  try {
    const { benefit_type, benefit_name, provider, details } = req.body;
    const userId = req.user.id;

    const workerRes = await query('SELECT id FROM workers WHERE user_id = $1', [userId]);
    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    const existingRes = await query(`
      SELECT id FROM worker_welfare
      WHERE worker_id = $1 AND benefit_name = $2
    `, [worker.id, benefit_name]);

    const todayDate = new Date().toISOString().split('T')[0];

    if (existingRes.rowCount > 0) {
      await query(`
        UPDATE worker_welfare
        SET status = 'ENROLLED', enrollment_date = $1
        WHERE id = $2
      `, [todayDate, existingRes.rows[0].id]);
    } else {
      await query(`
        INSERT INTO worker_welfare (worker_id, benefit_type, benefit_name, provider, status, enrollment_date, details)
        VALUES ($1, $2, $3, $4, 'ENROLLED', $5, $6)
      `, [worker.id, benefit_type, benefit_name, provider, todayDate, details]);
    }

    res.json({ message: `Successfully enrolled in ${benefit_name}` });
  } catch (err) {
    console.error('Enroll welfare error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to enroll in welfare scheme.' });
  }
}

// Comprehensive Urban Item List for all Working Facility Types (Urban Company & BIS/ISI benchmarked)
const ALL_URBAN_FACILITY_TOOLKITS = [
  {
    trade_category: 'Electrical',
    kit_name: 'Pradhan Mantri Kaushal ISI Electrical Safety & Diagnostic Toolkit',
    description: 'Official Federation-certified professional electrical toolkit. All insulated hand tools meet IS 13778 / IEC 60900 1000V high-voltage protection standards.',
    items_included: JSON.stringify([
      { item: '1000V VDE Insulated Plier & Screwdriver Set (7-Pc)', standard: 'IS 13778 / IEC 60900', mandatory: true },
      { item: 'Digital True-RMS Auto-Ranging Multimeter with Temp Probe', standard: 'CAT III 600V / ISI Certified', mandatory: true },
      { item: 'Heavy-Duty 800W Rotary SDS Hammer Drill + 5 Masonry Bits', standard: 'BIS Certified Industrial Class', mandatory: true },
      { item: 'Non-Contact AC Voltage Detector (90V-1000V) with Flashlight', standard: 'CAT IV 1000V Audible/Visual', mandatory: true },
      { item: 'High-Impact Fibre Safety Hardhat & 1000V Dielectric Gloves', standard: 'IS 2925 & IS 4770 Class 0', mandatory: true },
      { item: 'High-Tensile Spring Steel Conduit Wire Puller (30 Meters)', standard: 'Standard Artisan Guild Spec', mandatory: true },
      { item: '500V Insulation Resistance Megger Tester', standard: 'IS 11994 High Voltage Standard', mandatory: true },
      { item: 'Magnetic Torpedo Bubble Spirit Level (9 Inch 3-Vial)', standard: 'Precision Calibrated', mandatory: false },
    ]),
    market_price: 8500.0, subsidized_price: 4850.0, monthly_emi: 485.0, tenure_months: 10,
    isi_standards: 'IS 13778 (1000V Insulation), IS 2925 (Safety Helmet), IS 4770 (Dielectric Gloves)',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
  },
  {
    trade_category: 'Plumbing',
    kit_name: 'Cooperative Hydro-Mechanic Master Plumber Toolkit',
    description: 'Standardized municipal and domestic plumbing toolkit. Complete with high-pressure pipe leak sensors, pipe threading, and heavy joint wrenches.',
    items_included: JSON.stringify([
      { item: 'Heavy-Duty Ductile Iron Pipe Wrenches (10 Inch & 14 Inch)', standard: 'IS 4003 Heavy-Duty Certified', mandatory: true },
      { item: 'CPVC / PPR Pipe Heat Fusion Welding Die Machine (800W)', standard: 'ISI Approved 20-63mm Dies', mandatory: true },
      { item: 'High-Precision Hydrostatic Pressure Test Gauge (0-25 Bar)', standard: 'IS 3624 Hydraulic Class 1.6', mandatory: true },
      { item: 'Rotary Drain Unclogging Spring Steel Snake Cable (7.5m Drum)', standard: 'High-Carbon Anti-Kink Steel', mandatory: true },
      { item: 'Heavy Ratchet PVC/CPVC Pipe Cutter (Up to 42mm OD)', standard: 'SK-5 High Carbon Blade', mandatory: true },
      { item: 'Telescoping Basin Wrench & Multi-Angle Sink Faucet Spanner', standard: 'Forged Chrome Vanadium Steel', mandatory: true },
      { item: 'Digital Water TDS, Hardness & pH Tester Pen', standard: 'Precision 1 PPM Resolution', mandatory: true },
      { item: 'Thread Seal Teflon Tape (Pack of 10 Rolls) + O-Ring Kit', standard: 'Food-Grade Potable Water Safe', mandatory: false },
    ]),
    market_price: 7400.0, subsidized_price: 4200.0, monthly_emi: 420.0, tenure_months: 10,
    isi_standards: 'IS 4003 (Pipe Wrenches), IS 3624 (Pressure Gauges), BIS Certified Dies',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600',
  },
  {
    trade_category: 'Appliance Repair',
    kit_name: 'National HVAC & Refrigeration Precision Servicing Toolkit',
    description: 'Complete digital refrigeration & inverter appliance servicing suite. Designed for leak detection, gas recovery, vacuum charging, and jet washing.',
    items_included: JSON.stringify([
      { item: 'High-Pressure Cordless AC Service Jet Wash Pump (120 Bar)', standard: 'BIS Certified / 360-Degree Wand', mandatory: true },
      { item: 'Waterproof Indoor AC Service Apron Catchment Jacket', standard: 'Heavy-Duty PVC Ripstop 3m Hose', mandatory: true },
      { item: '2-Stage Rotary Vane Deep Vacuum Pump (1/3 HP, 3.5 CFM)', standard: 'ISO 9001 HVAC Grade 15 Micron', mandatory: true },
      { item: 'Forged Brass 2-Way Manifold Gauge with R32/R410A Hoses', standard: 'Anti-Flutter 800 PSI Rated', mandatory: true },
      { item: 'Sensitive Electronic Halogen & Refrigerant Gas Leak Detector', standard: 'Detects all HFC/HCFC down to 3g/yr', mandatory: true },
      { item: 'Heavy-Duty Copper Tube Flaring & Swaging Tool Kit', standard: 'Eccentric Cone Type 1/4" to 3/4"', mandatory: true },
      { item: 'True-RMS Digital HVAC Multimeter with Temp Clamp', standard: 'CAT III 600V / ISI Certified', mandatory: true },
      { item: 'Infrared Non-Contact Laser Thermometer (-50C to 550C)', standard: 'Calibrated Emissivity 0.95', mandatory: true },
    ]),
    market_price: 14500.0, subsidized_price: 8900.0, monthly_emi: 890.0, tenure_months: 10,
    isi_standards: 'ISO 9001 (Vacuum Pump), CE Certified Halogen Leak Sniffer, IS 13778',
    image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
  },
  {
    trade_category: 'Carpentry',
    kit_name: 'Master Joinery & Architectural Woodcraft Urban Toolkit',
    description: 'Standardized urban carpentry and interior modular assembly toolkit. Complete with 18V cordless impact driver, 360-degree laser level, and lock mortise chisels.',
    items_included: JSON.stringify([
      { item: '18V Brushless Cordless Impact Driver & Drill with Dual 2.0Ah Batteries', standard: 'IS 60745 / BIS Industrial Grade', mandatory: true },
      { item: 'Heavy-Duty 650W Electric Hand Wood Planer with Tungsten Blades', standard: 'IS 1987 Certified', mandatory: true },
      { item: '3-Beam 360-Degree Self-Leveling Green Laser Level with Magnetic Mount', standard: 'Precision Class II ±1mm/10m', mandatory: true },
      { item: 'Forged Chrome-Vanadium Mortise Chisel Set (6mm, 12mm, 19mm, 25mm)', standard: 'HRC 60 Hardened Steel', mandatory: true },
      { item: 'Concealed 35mm Hydraulic Cup Hinge Hole Jig & Forstner Drill Bit', standard: 'High-Speed Cobalt Steel', mandatory: true },
      { item: 'Quick-Grip Heavy-Duty Bar Clamps (300mm & 600mm Pair)', standard: 'Cast-Iron 150kg Clamping Force', mandatory: true },
      { item: 'HEPA Handheld Cordless Sawdust Suction Vacuum', standard: 'HEPA Grade 99.97% Containment', mandatory: false },
    ]),
    market_price: 11200.0, subsidized_price: 6400.0, monthly_emi: 640.0, tenure_months: 10,
    isi_standards: 'IS 60745 (Electric Tools), IS 1987 (Hand Planers), BIS Heavy Duty',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
  },
  {
    trade_category: 'Painting',
    kit_name: 'Surface Finishing & Terrace Waterproofing Urban Toolkit',
    description: 'Certified urban painter & waterproofing contractor kit. Equipped with digital masonry moisture meter, dustless drywall sander, and PU crack injection pumps.',
    items_included: JSON.stringify([
      { item: 'Digital Pin-Type Wall & Concrete Masonry Moisture Meter', standard: 'Calibrated 0-50% Wood/Wall LCD', mandatory: true },
      { item: 'Dustless Drywall Disc Sander with Vacuum Bag (750W Variable RPM)', standard: 'BIS Certified Dust-Containment', mandatory: true },
      { item: 'High-Volume Low-Pressure (HVLP) Fine Finish Electric Spray Gun', standard: 'CE / 0.3 Bar Ultra-Fine Finish', mandatory: true },
      { item: 'Heavy-Duty Dual-Component Polyurethane Injection Grout Hand Pump', standard: '10,000 PSI High-Pressure Rated', mandatory: true },
      { item: 'Heavy-Duty Washable 10oz Canvas Floor Drop-Cloths (Set of 3)', standard: '100% Anti-Slip Spill Proof', mandatory: true },
      { item: 'Aluminium Telescopic 3.8m Extension Ladder with Rubber Stabilizer Feet', standard: 'EN 131 Load Rated 150kg', mandatory: true },
      { item: 'Self-Adhesive Non-Marking Edge Masking Tape (Pack of 12 Rolls)', standard: 'Clean Peel 14-Day Residue-Free', mandatory: false },
    ]),
    market_price: 13500.0, subsidized_price: 7800.0, monthly_emi: 780.0, tenure_months: 10,
    isi_standards: 'EN 131 (Ladders), BIS Certified Grout Systems',
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
  },
  {
    trade_category: 'Cleaning',
    kit_name: 'Deep Machine Hygiene & Industrial Sanitation Urban Toolkit',
    description: 'Urban Company caliber deep home cleaning & pest containment suite. Includes single-disc 175 RPM rotary floor buffer, wet/dry slurry vacuum extractor, and steam sterilizer.',
    items_included: JSON.stringify([
      { item: 'Single-Disc Heavy-Duty Rotary Floor Buffer & Scrubber (1100W, 175 RPM)', standard: 'Industrial Cast-Iron Chassis', mandatory: true },
      { item: 'Twin-Motor Commercial Wet & Dry Slurry Vacuum Extractor (30L Tank)', standard: 'ISO 9001 / 2400W Suction', mandatory: true },
      { item: 'Deep Injection-Extraction Upholstery & Sofa Shampoo Wand Machine', standard: '4-Bar Pressure Injection System', mandatory: true },
      { item: 'Continuous Dry Steam Sanitizer (4.5 Bar, 140°C Superheated Boiler)', standard: 'Hospital Grade Thermal Sterilizer', mandatory: true },
      { item: 'Precision Micro-Dose Cockroach & Termite Herbal Gel Applicator Gun', standard: 'Calibrated Drop-Measure Spec', mandatory: true },
      { item: 'Color-Coded Anti-Microbial Microfiber Towel Set (12-Piece Assortment)', standard: 'IS 16670 Lint-Free 350 GSM', mandatory: true },
      { item: 'Personal Protective Respirator Mask & Heavy Nitrile Glove Set', standard: 'IS 9473 N95 / EN 374 Chemical', mandatory: false },
    ]),
    market_price: 18500.0, subsidized_price: 10900.0, monthly_emi: 1090.0, tenure_months: 10,
    isi_standards: 'IS 9473 (Respirators), ISO 9001, EN 374 (Chemical Protection)',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
  },
  {
    trade_category: 'Gardening',
    kit_name: 'Civic Horticulture & Landscape Care Urban Toolkit',
    description: 'Eco-friendly landscape, lawn mowing, and micro-drip irrigation equipment suite. Features 40V cordless lawn mower, telescopic tree lopper, and drip irrigation punch kit.',
    items_included: JSON.stringify([
      { item: 'Cordless 40V Dual-Battery Brushless Rotary Lawn Mower (16" Deck)', standard: 'Zero-Emission Electric BIS Spec', mandatory: true },
      { item: 'Telescopic High-Carbon SK-5 Tree Lopper & Pole Pruner (Extends to 3.5m)', standard: 'Hardened Shear Cut Spec', mandatory: true },
      { item: 'Micro-Drip Hole Punch, Barbed Coupler & 16mm LDPE Pipe Installation Kit', standard: 'Standard Domestic Micro-Irrigation', mandatory: true },
      { item: '16L Lithium-Ion Battery Powered Backpack Garden & Biocide Sprayer', standard: 'IS 3906 Mechanical Sprayer Spec', mandatory: true },
      { item: 'Drop-Forged Bypass Hedge Shears with Shock-Absorbing Rubber Bumpers', standard: 'High-Carbon Forged Steel', mandatory: true },
      { item: 'Digital 4-in-1 Soil pH, Moisture, Sunlight & Temperature Sensor Meter', standard: 'Precision Agronomy Probe', mandatory: false },
    ]),
    market_price: 9800.0, subsidized_price: 5600.0, monthly_emi: 560.0, tenure_months: 10,
    isi_standards: 'IS 3906 (Sprayers), BIS Garden Tool Standard',
    image_url: 'https://images.unsplash.com/photo-1558904541-efa8c4a52d31?w=600',
  },
  {
    trade_category: 'Caregiving',
    kit_name: 'Assisted Clinical Home Care & Patient Diagnostic Suite',
    description: 'Accredited elderly care, bedside patient vital monitoring, and post-operative home dressing toolkit. Equipped with digital BP monitor, pulse oximeter, and blood glucose meter.',
    items_included: JSON.stringify([
      { item: 'Digital Upper-Arm Blood Pressure Monitor with Large Cuff', standard: 'CDSCO & CE Medical Class IIa', mandatory: true },
      { item: 'Fingertip Pulse Oximeter with Perfusion Index Display (SpO2)', standard: 'ISO 80601-2-61 Clinical Standard', mandatory: true },
      { item: 'Digital Blood Glucose Monitor with 50 Test Strips & Auto-Lancet', standard: 'ISO 15197 Accuracy Standard', mandatory: true },
      { item: 'Non-Contact Infrared Forehead Clinical Thermometer', standard: 'ASTM E1965-98 Clinical Spec', mandatory: true },
      { item: 'Sterile Surgical Dressing & Wound Care Tray Kit (10 Pre-Packaged Packs)', standard: 'Gamma Irradiated Sterile IS 5405', mandatory: true },
      { item: 'Patient Mobility Transfer Belt with Heavy-Duty Padded Grip Handles', standard: 'Ergonomic Orthopedic Safe', mandatory: false },
    ]),
    market_price: 6800.0, subsidized_price: 3800.0, monthly_emi: 380.0, tenure_months: 10,
    isi_standards: 'CDSCO Approved, ISO 13485 (Medical Devices), ISO 80601',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
  },
  {
    trade_category: 'Driving',
    kit_name: 'Professional Fleet Chauffeur Diagnostic & Highway Safety Toolkit',
    description: 'Urban & outstation chauffeur road-safety suite. Features semiconductor breathalyzer, digital tire pressure inflator, OBD-2 scan tool, and emergency jump-starter cables.',
    items_included: JSON.stringify([
      { item: 'Digital Semiconductor Alcohol Breathalyzer with Calibration Warning', standard: 'CE / DOT Certified Sensor', mandatory: true },
      { item: 'Heavy-Duty 12V 150 PSI Car Tire Air Inflator with Digital Presets', standard: 'Automotive ISI Spec', mandatory: true },
      { item: 'OBD-2 Bluetooth Engine Diagnostic Scanner (Reads Check-Engine Codes)', standard: 'ISO 9141 / SAE J1850 Protocol', mandatory: true },
      { item: 'Heavy-Duty 4-Meter 1000A Battery Jumper Booster Cables with Clamp Covers', standard: '100% Pure Copper Multi-Strand', mandatory: true },
      { item: 'Reflective Emergency Warning Hazard Triangle & High-Vis Safety Vest', standard: 'AIS-022 Automotive Safety Standard', mandatory: true },
      { item: 'Vehicle Emergency Window Breaker & Seatbelt Cutter Punch Tool', standard: 'Tungsten Steel Tip Automotive Tool', mandatory: true },
    ]),
    market_price: 5900.0, subsidized_price: 3400.0, monthly_emi: 340.0, tenure_months: 10,
    isi_standards: 'AIS-022 (Automotive Warning Devices), ISO 9141 OBD2',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
  },
];

/**
 * GET /api/worker-portal/toolkits
 * Get mandatory toolkit requirements, compliance status, catalog, and active orders/loans.
 * Enforces strict trade restriction: Workers only inspect/procure items for their registered primary trade.
 */
async function getWorkerToolkits(req, res) {
  try {
    const userId = req.user.id;
    const workerRes = await query(`
      SELECT w.id, w.worker_code, w.primary_trade, w.tools_owned, w.toolkit_compliance, w.merit_points,
             u.name, u.phone, u.district, u.city, u.address, c.name as cooperative_name
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      WHERE w.user_id = $1
    `, [userId]);

    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    // Auto-seed missing toolkits from ALL_URBAN_FACILITY_TOOLKITS if not present in DB
    for (const kit of ALL_URBAN_FACILITY_TOOLKITS) {
      const existingKit = await query(
        'SELECT id FROM mandatory_toolkits WHERE trade_category ILIKE $1 LIMIT 1',
        [kit.trade_category]
      );
      if (existingKit.rows.length === 0) {
        await query(
          `INSERT INTO mandatory_toolkits (
            trade_category, kit_name, description, items_included, market_price,
            subsidized_price, monthly_emi, tenure_months, isi_standards, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            kit.trade_category, kit.kit_name, kit.description, kit.items_included,
            kit.market_price, kit.subsidized_price, kit.monthly_emi, kit.tenure_months,
            kit.isi_standards, kit.image_url,
          ]
        );
      }
    }

    // Catalog of all trade toolkits
    const catalogRes = await query(`SELECT * FROM mandatory_toolkits ORDER BY id ASC`);
    const catalog = catalogRes.rows.map((t) => {
      let parsedItems = [];
      try {
        parsedItems = typeof t.items_included === 'string' ? JSON.parse(t.items_included) : t.items_included;
      } catch {
        parsedItems = [];
      }
      return { ...t, items: parsedItems };
    });

    // Find the specific mandatory toolkit strictly matching the worker's primary trade
    const workerTrade = (worker.primary_trade || '').toLowerCase();
    let mandatoryToolkit = catalog.find((t) => {
      const cat = (t.trade_category || '').toLowerCase();
      return workerTrade && (cat === workerTrade || workerTrade.includes(cat) || cat.includes(workerTrade));
    }) || catalog[0] || null;

    // Worker's existing owned tools parsed
    const ownedToolsRaw = (worker.tools_owned || '').toLowerCase();

    // Generate checklist of mandatory items with individual tool pricing
    const totalKitItems = (mandatoryToolkit?.items?.length) || 5;
    const baseIndividualPrice = Math.round((mandatoryToolkit?.subsidized_price || 4500) / totalKitItems);
    const baseMarketPrice = Math.round((mandatoryToolkit?.market_price || 8000) / totalKitItems);

    const checklist = (mandatoryToolkit ? mandatoryToolkit.items : []).map((item, idx) => {
      const itemName = typeof item === 'string' ? item : item.item;
      const isOwned = ownedToolsRaw.length > 0 && ownedToolsRaw.split(',').some((owned) => {
        const cleanOwned = owned.trim();
        return cleanOwned.length > 3 && (itemName.toLowerCase().includes(cleanOwned) || cleanOwned.includes(itemName.toLowerCase()));
      });
      const priceFactor = idx === 0 ? 1.35 : idx === 1 ? 1.15 : idx === 2 ? 1.25 : 0.85;
      const individualSubsidized = Math.max(350, Math.round((baseIndividualPrice * priceFactor) / 50) * 50);
      const individualMarket = Math.max(600, Math.round((baseMarketPrice * priceFactor) / 50) * 50);
      return {
        id: idx + 1,
        item: itemName,
        standard: item.standard || 'ISI Standard',
        mandatory: item.mandatory !== false,
        owned: isOwned || worker.toolkit_compliance === 'VERIFIED_EQUIPPED',
        individual_price: individualSubsidized,
        market_price: individualMarket,
        monthly_emi: Math.round(individualSubsidized / 10),
      };
    });

    // Worker's toolkit orders / loans
    const ordersRes = await query(`
      SELECT o.*, t.kit_name, t.trade_category, t.image_url, t.market_price, t.subsidized_price
      FROM worker_toolkit_orders o
      JOIN mandatory_toolkits t ON o.toolkit_id = t.id
      WHERE o.worker_id = $1
      ORDER BY o.id DESC
    `, [worker.id]);

    const orders = ordersRes.rows;
    const activeLoan = orders.find((o) => o.status === 'ACTIVE_LOAN') || null;

    // Strict Trade Restriction: Only expose the primary trade's toolkit in catalog
    const restrictedCatalog = mandatoryToolkit ? [mandatoryToolkit] : [];

    res.json({
      worker,
      mandatoryToolkit,
      checklist,
      complianceStatus: worker.toolkit_compliance || (checklist.every((c) => c.owned) ? 'VERIFIED_EQUIPPED' : 'PENDING'),
      catalog: restrictedCatalog,
      registeredFacility: `${worker.primary_trade || 'General'} Working Facility`,
      tradeRestricted: true,
      orders,
      activeLoan,
    });
  } catch (err) {
    console.error('Get worker toolkits error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch worker toolkits.' });
  }
}

/**
 * POST /api/worker-portal/toolkits/order
 * Purchase or finance a mandatory toolkit or individual tool directly through the platform.
 * Restricts procurement strictly to the worker's registered primary trade.
 */
async function orderWorkerToolkit(req, res) {
  try {
    const { toolkit_id, payment_mode, delivery_address, individual_tool, individual_price } = req.body;
    const userId = req.user.id;

    const workerRes = await query('SELECT * FROM workers WHERE user_id = $1', [userId]);
    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    const toolkitRes = await query('SELECT * FROM mandatory_toolkits WHERE id = $1', [toolkit_id]);
    const toolkit = toolkitRes.rows[0];
    if (!toolkit) {
      return res.status(404).json({ error: 'Not Found', message: 'Selected toolkit not found.' });
    }

    // Enforce Registered Primary Trade Restriction
    const kitTrade = (toolkit.trade_category || '').toLowerCase();
    const workerTrade = (worker.primary_trade || '').toLowerCase();
    if (workerTrade && !workerTrade.includes(kitTrade) && !kitTrade.includes(workerTrade)) {
      return res.status(403).json({
        error: 'Trade Restriction Enforced',
        message: `Artisans are restricted to procuring toolkits for their registered primary trade (${worker.primary_trade}). To work in '${toolkit.trade_category}', obtain cooperative guild certification first.`
      });
    }

    if (!['DIRECT_PAY', 'COOP_LOAN'].includes(payment_mode)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid payment mode. Must be DIRECT_PAY or COOP_LOAN.' });
    }

    const isIndividual = Boolean(individual_tool);
    const orderCode = `TKT-ORD-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const totalAmount = isIndividual ? (Number(individual_price) || 850.0) : toolkit.subsidized_price;
    const isLoan = payment_mode === 'COOP_LOAN';
    const paidAmount = isLoan ? 0.0 : totalAmount;
    const remainingAmount = isLoan ? totalAmount : 0.0;
    const monthlyEmi = isLoan ? Math.max(50, Math.round(totalAmount / 10)) : 0.0;
    const orderStatus = isLoan ? 'ACTIVE_LOAN' : 'DELIVERED';
    const deliveryStatus = isLoan ? 'DISPATCHED' : 'DELIVERED';

    const orderInsertRes = await query(`
      INSERT INTO worker_toolkit_orders (
        worker_id, toolkit_id, order_code, payment_mode, total_amount, paid_amount,
        remaining_amount, monthly_emi, status, delivery_address, delivery_status, loan_deduction_per_job
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 50.0)
      RETURNING *
    `, [
      worker.id,
      toolkit.id,
      orderCode,
      payment_mode,
      totalAmount,
      paidAmount,
      remainingAmount,
      monthlyEmi,
      orderStatus,
      delivery_address || 'Cooperative Federation Center Hub',
      deliveryStatus,
    ]);

    // Parse items to append to worker's tools_owned (de-duplicated)
    let itemsToAppend = [];
    if (isIndividual) {
      itemsToAppend = [individual_tool.trim()];
    } else {
      try {
        const parsed = typeof toolkit.items_included === 'string' ? JSON.parse(toolkit.items_included) : toolkit.items_included;
        itemsToAppend = parsed.map((i) => (typeof i === 'string' ? i : i.item).trim());
      } catch {
        itemsToAppend = [toolkit.kit_name.trim()];
      }
    }

    const toolsSet = new Set(
      (worker.tools_owned || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    );
    itemsToAppend.forEach((t) => toolsSet.add(t));
    const newToolsOwned = Array.from(toolsSet).join(', ');

    const pointsAward = isIndividual ? 0 : 50;

    // Update worker profile
    await query(`
      UPDATE workers
      SET tools_owned = $1,
          toolkit_compliance = 'VERIFIED_EQUIPPED',
          merit_points = merit_points + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newToolsOwned, pointsAward, worker.id]);

    // If cooperative loan, record loan disbursement in society treasury ledger
    if (isLoan) {
      try {
        const txnCode = `TXN-LOAN-${orderCode}`;
        const loanDesc = isIndividual
          ? `Artisan individual tool micro-loan for ${individual_tool} (${orderCode})`
          : `Artisan toolkit micro-loan disbursed for ${toolkit.kit_name} (${orderCode})`;

        await query(`
          INSERT INTO society_treasury_ledger (
            society_id, transaction_code, transaction_type, amount, worker_id, description, balance_after
          ) VALUES (
            1, $1, 'LOAN_DISBURSEMENT', $2, $3, $4, 500000.0
          )
        `, [txnCode, -totalAmount, worker.id, loanDesc]);
      } catch (ledgerErr) {
        console.warn('Treasury ledger log notice:', ledgerErr.message);
      }
    }

    res.json({
      message: isIndividual
        ? (isLoan
            ? `🎉 0% Interest Micro-Loan Approved for ${individual_tool}! Order ${orderCode} dispatched.`
            : `🎉 Direct Purchase Confirmed for ${individual_tool}! Order ${orderCode} processed.`)
        : (isLoan
            ? `🎉 0% Interest Cooperative Toolkit Micro-Loan Approved! Order ${orderCode} dispatched.`
            : `🎉 Toolkit Direct Purchase Confirmed! Order ${orderCode} processed.`),
      order: orderInsertRes.rows[0],
      meritPointsAwarded: pointsAward,
      complianceStatus: 'VERIFIED_EQUIPPED',
    });
  } catch (err) {
    console.error('Order toolkit error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process toolkit order.' });
  }
}

module.exports = {
  getWorkerDashboard,
  updateAvailability,
  handleJobAction,
  getWorkerWelfare,
  enrollWelfare,
  getWorkerToolkits,
  orderWorkerToolkit,
};

