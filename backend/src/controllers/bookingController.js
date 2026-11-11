const { query } = require('../db/connection');
const { getBookingAccess } = require('../utils/bookingAccess');
const { runLifecycleChecks } = require('../services/bookingLifecycle');
const {
  calculateHaversineDistanceKm,
  calculateEtaMinutes,
  generateRouteWaypoints,
  ODISHA_LOCALITY_COORDS,
} = require('./matchingController');

// Valid booking lifecycle states — mirrors the CHECK constraint on bookings.status
const BOOKING_STATUSES = ['REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// Helper to generate 4-digit random numeric OTP
function generate4DigitOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Release an artisan back to AVAILABLE, but only when they have no other
 * live job. Blindly setting AVAILABLE would free a worker who is still
 * on-site for a different booking.
 */
async function releaseWorkerIfIdle(workerId, exceptBookingId) {
  if (!workerId) return;
  const remaining = await query(`
    SELECT COUNT(*) as count FROM bookings
    WHERE worker_id = $1 AND status IN ('ACCEPTED', 'IN_PROGRESS') AND id != $2
  `, [workerId, exceptBookingId]);

  if (parseInt(remaining.rows[0].count, 10) === 0) {
    await query(`
      UPDATE workers
      SET availability = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND availability = 'BUSY'
    `, [workerId]);
  }
}

/**
 * POST /api/bookings
 * Create a new service booking (Phase 1-3).
 */
async function createBooking(req, res) {
  try {
    const serviceId = req.body.serviceId || req.body.service_id;
    const workerId = req.body.workerId || req.body.worker_id;
    const pairedMasterId = req.body.pairedMasterId || req.body.paired_master_worker_id || null;
    const location_district = req.body.location_district || req.body.district || req.body.locationDistrict || 'Khordha';
    const location_city = req.body.location_city || req.body.city || req.body.locationCity || 'Bhubaneswar';
    const location_address = req.body.location_address || req.body.address || req.body.locationAddress || 'Patia, Bhubaneswar';
    const location_pincode = req.body.location_pincode || req.body.pincode || req.body.locationPincode || '751024';
    const scheduled_date = req.body.scheduled_date || req.body.scheduledDate || new Date().toISOString().split('T')[0];
    const scheduled_time = req.body.scheduled_time || req.body.scheduledTime || '10:00 AM';
    const is_emergency = req.body.is_emergency || req.body.isEmergency ? 1 : 0;
    const is_bulk_order = req.body.is_bulk_order || req.body.isBulkOrder ? 1 : 0;
    const notes = req.body.notes || '';

    // The route is mounted behind authenticate + authorize('CUSTOMER'),
    // so req.user is always present. Never fall back to a hardcoded id.
    const customerId = req.user.id;

    if (!serviceId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Service selection is required.' });
    }

    const serviceRes = await query('SELECT * FROM services WHERE id = $1', [serviceId]);
    const service = serviceRes.rows[0];
    if (!service) {
      return res.status(404).json({ error: 'Not Found', message: 'Selected service not found in catalog.' });
    }

    // Sizing & Squad Support
    const squad_size = Math.max(1, Math.min(10, parseInt(req.body.squad_size || req.body.squadSize || 1, 10)));
    const squad_worker_ids = String(req.body.squad_worker_ids || req.body.squadWorkerIds || '').trim();

    // Price calculation (scaled by squad headcount)
    let baseAmount = (Number(service.base_price) || 299) * squad_size;
    if (is_emergency) {
      baseAmount = Math.max(baseAmount, 499 * squad_size);
    }

    // Bulk discount (15% off labour for apartment societies / bulk orders)
    let bulkDiscount = 0;
    if (is_bulk_order) {
      bulkDiscount = Math.round(baseAmount * 0.15 * 100) / 100;
      baseAmount = baseAmount - bulkDiscount;
    }

    // Dynamic Cooperative Economics (defaults to 93-2-5 if not customized in society bylaws)
    let welfarePct = 5.0;
    let platformPct = 2.0;
    try {
      const econRes = await query(`
        SELECT welfare_fund_share_pct, platform_upkeep_share_pct
        FROM cooperatives
        WHERE district ILIKE $1 OR name ILIKE $1
        LIMIT 1
      `, [`%${location_district}%`]);
      if (econRes.rows[0]) {
        welfarePct = econRes.rows[0].welfare_fund_share_pct ?? 5.0;
        platformPct = econRes.rows[0].platform_upkeep_share_pct ?? 2.0;
      }
    } catch (_) {}

    const cooperativeFee = Math.round(baseAmount * (welfarePct / 100) * 100) / 100; // Configurable Welfare/ESIC
    const platformFee = Math.round(baseAmount * (platformPct / 100) * 100) / 100; // Configurable Upkeep
    const totalAmount = Math.round((baseAmount + cooperativeFee + platformFee) * 100) / 100;

    // Generate Guaranteed Unique Booking Code and Invoice Code
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const bookingCode = `BKG-2026-${uniqueSuffix}`;
    const invoiceNum = `INV-2026-${uniqueSuffix}`;

    // Security OTPs are NULL upon creation; generated only when worker accepts the work order
    const arrivalOtp = null;
    const completionOtp = null;

    const todayDate = scheduled_date || new Date().toISOString().split('T')[0];
    const defaultTime = scheduled_time || '10:00 AM';

    // Resolve Customer GPS Coordinates
    let customerLat = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let customerLng = req.body.longitude ? parseFloat(req.body.longitude) : null;

    if (!customerLat || !customerLng) {
      const searchStr = `${location_address} ${location_city} ${location_district}`.toLowerCase();
      for (const [key, coords] of Object.entries(ODISHA_LOCALITY_COORDS)) {
        if (searchStr.includes(key)) {
          customerLat = coords.lat;
          customerLng = coords.lng;
          break;
        }
      }
      if (!customerLat) {
        customerLat = 20.2961;
        customerLng = 85.8245;
      }
    }

    // Fair Cooperative Broadcast Dispatch Protocol:
    const validWorkerId = null;
    const initialStatus = 'REQUESTED';

    const insertResult = await query(`
      INSERT INTO bookings (
        booking_code, customer_id, worker_id, paired_master_worker_id, service_id,
        location_district, location_city, location_address, location_pincode,
        latitude, longitude,
        scheduled_date, scheduled_time, is_emergency, is_bulk_order, bulk_discount_amount, status,
        amount, cooperative_fee, platform_fee, total_amount, notes,
        arrival_otp, completion_otp, squad_size, squad_worker_ids, transit_compensation_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *
    `, [
      bookingCode,
      customerId,
      validWorkerId,
      pairedMasterId || null,
      serviceId,
      location_district,
      location_city,
      location_address,
      location_pincode,
      customerLat,
      customerLng,
      todayDate,
      defaultTime,
      is_emergency ? 1 : 0,
      is_bulk_order ? 1 : 0,
      bulkDiscount,
      initialStatus,
      baseAmount,
      cooperativeFee,
      platformFee,
      totalAmount,
      notes || null,
      arrivalOtp,
      completionOtp,
      squad_size,
      squad_worker_ids,
      50.0 // Doorstep transit compensation fee
    ]);

    const newBookingRow = insertResult.rows[0];
    const bookingId = newBookingRow.id;

    // Create Invoice Skeleton
    let coopName = 'Bhubaneswar Labour Cooperative Federation';
    let workerName = 'Assigned Cooperative Worker';
    const customerName = req.user.name || 'Citizen Customer';

    if (validWorkerId) {
      const workerInfoRes = await query(`
        SELECT u.name, c.name as cooperative_name, w.tier
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN cooperatives c ON w.cooperative_id = c.id
        WHERE w.id = $1
      `, [validWorkerId]);
      if (workerInfoRes.rows[0]) {
        workerName = `${workerInfoRes.rows[0].name} (${workerInfoRes.rows[0].tier} Artisan)`;
        coopName = workerInfoRes.rows[0].cooperative_name;
      }
    }

    await query(`
      INSERT INTO invoices (
        booking_id, invoice_number, cooperative_name, customer_name,
        worker_name, service_name, service_date, amount, parts_cost,
        cooperative_fee, platform_fee, total_amount, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (booking_id) DO UPDATE SET
        invoice_number = EXCLUDED.invoice_number,
        cooperative_name = EXCLUDED.cooperative_name,
        customer_name = EXCLUDED.customer_name,
        worker_name = EXCLUDED.worker_name,
        service_name = EXCLUDED.service_name,
        service_date = EXCLUDED.service_date,
        amount = EXCLUDED.amount,
        cooperative_fee = EXCLUDED.cooperative_fee,
        platform_fee = EXCLUDED.platform_fee,
        total_amount = EXCLUDED.total_amount
    `, [
      bookingId,
      invoiceNum,
      coopName,
      customerName,
      workerName,
      service.name,
      todayDate,
      baseAmount,
      0,
      cooperativeFee,
      platformFee,
      totalAmount,
      'UNPAID'
    ]);

    const enrichedBookingRes = await query(`
      SELECT b.*, s.name as service_name, s.category as service_category
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `, [bookingId]);

    res.status(201).json({
      message: 'Booking created successfully with Security OTP Handshake enabled',
      booking: enrichedBookingRes.rows[0],
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server Error', message: err.message || 'Failed to create booking.' });
  }
}

/**
 * GET /api/bookings
 */
async function getBookings(req, res) {
  try {
    await runLifecycleChecks();
    const { role, id: userId } = req.user;
    const { status, limit = 50 } = req.query;

    let baseQuery = `
      SELECT b.*, 
             s.name as service_name, s.category as service_category, s.icon as service_icon,
             u_cust.name as customer_name, u_cust.phone as customer_phone, u_cust.email as customer_email,
             u_work.name as worker_name, u_work.phone as worker_phone,
             w.worker_code, w.rating as worker_rating, w.tier as worker_tier,
             w.latitude as worker_latitude, w.longitude as worker_longitude, w.service_area as worker_service_area,
             u_master.name as paired_master_name,
             soc.name as society_name, soc.registration_number as society_reg,
             c.name as federation_name, c.name as cooperative_name,
             p.status as payment_status, p.transaction_id,
             r.rating as user_review_rating, r.comment as user_review_comment
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u_cust ON b.customer_id = u_cust.id
      LEFT JOIN workers w ON b.worker_id = w.id
      LEFT JOIN users u_work ON w.user_id = u_work.id
      LEFT JOIN workers w_master ON b.paired_master_worker_id = w_master.id
      LEFT JOIN users u_master ON w_master.user_id = u_master.id
      LEFT JOIN societies soc ON w.society_id = soc.id
      LEFT JOIN cooperatives c ON (soc.federation_id = c.id OR w.cooperative_id = c.id)
      LEFT JOIN payments p ON p.booking_id = b.id
      LEFT JOIN reviews r ON r.booking_id = b.id
    `;

    const where = [];
    const params = [];
    let paramIdx = 1;

    if (role === 'CUSTOMER') {
      where.push(`b.customer_id = $${paramIdx}`);
      params.push(userId);
      paramIdx++;
    } else if (role === 'WORKER') {
      const workerProfileRes = await query('SELECT id FROM workers WHERE user_id = $1', [userId]);
      const workerProfile = workerProfileRes.rows[0];
      if (workerProfile) {
        where.push(`(b.worker_id = $${paramIdx} OR b.paired_master_worker_id = $${paramIdx})`);
        params.push(workerProfile.id);
        paramIdx++;
      } else {
        return res.json({ bookings: [] });
      }
    }

    if (status) {
      where.push(`b.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
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

      const cleanB = {
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

      // Cryptographic OTP Handshake Protection:
      // Strip OTPs for non-owner customers and workers (workers must never see the customer's handshake code)
      if (role !== 'COOPERATIVE_ADMIN' && (role !== 'CUSTOMER' || b.customer_id !== userId)) {
        delete cleanB.arrival_otp;
        delete cleanB.completion_otp;
      }

      return cleanB;
    });

    res.json({ bookings: enrichedBookings });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch bookings.' });
  }
}

/**
 * GET /api/bookings/:id
 */
async function getBookingById(req, res) {
  try {
    await runLifecycleChecks();
    const rawId = req.params.id;
    const isNumeric = /^\d+$/.test(rawId);
    const whereClause = isNumeric ? 'b.id = $1' : 'b.booking_code = $1';
    const queryVal = isNumeric ? parseInt(rawId, 10) : rawId;

    const bookingRes = await query(`
      SELECT b.*, 
             s.name as service_name, s.category as service_category, s.description as service_description, s.icon as service_icon,
             u_cust.name as customer_name, u_cust.phone as customer_phone, u_cust.email as customer_email,
             u_work.name as worker_name, u_work.phone as worker_phone, u_work.email as worker_email,
             w.worker_code, w.rating as worker_rating, w.tier as worker_tier, w.experience_years as worker_experience,
             w.latitude as worker_latitude, w.longitude as worker_longitude, w.service_area as worker_service_area,
             u_master.name as paired_master_name, u_master.phone as paired_master_phone,
             soc.name as society_name, soc.registration_number as society_reg, soc.district as society_district, COALESCE(soc.city, c.local_area, 'Urban Zone') as society_local_area,
             c.name as federation_name, c.name as cooperative_name, c.contact_phone as cooperative_phone, c.registration_number as cooperative_reg
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u_cust ON b.customer_id = u_cust.id
      LEFT JOIN workers w ON b.worker_id = w.id
      LEFT JOIN users u_work ON w.user_id = u_work.id
      LEFT JOIN workers w_master ON b.paired_master_worker_id = w_master.id
      LEFT JOIN users u_master ON w_master.user_id = u_master.id
      LEFT JOIN societies soc ON w.society_id = soc.id
      LEFT JOIN cooperatives c ON (soc.federation_id = c.id OR w.cooperative_id = c.id)
      WHERE ${whereClause}
    `, [queryVal]);

    const booking = bookingRes.rows[0];

    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    // Attach Live Route Telemetry & Waypoints if worker is assigned
    const cityUpper = (booking.location_city || booking.location_district || '').toUpperCase();
    let workerLat = Number(booking.worker_latitude);
    let workerLng = Number(booking.worker_longitude);

    if (isNaN(workerLat) || !workerLat) {
      if (cityUpper.includes('PURI')) { workerLat = 19.8100; workerLng = 85.8380; }
      else if (cityUpper.includes('CUTTACK')) { workerLat = 20.4890; workerLng = 85.8770; }
      else { workerLat = 20.2750; workerLng = 85.8100; }
    }

    let custLat = Number(booking.latitude);
    let custLng = Number(booking.longitude);

    if (isNaN(custLat) || !custLat) {
      if (cityUpper.includes('PURI')) { custLat = 19.8135; custLng = 85.8312; }
      else if (cityUpper.includes('CUTTACK')) { custLat = 20.4625; custLng = 85.8830; }
      else { custLat = 20.3540; custLng = 85.8170; }
    }

    const straightDist = calculateHaversineDistanceKm(workerLat, workerLng, custLat, custLng) || 2.4;
    const distanceKm = Math.max(1.2, Math.round(straightDist * 1.3 * 10) / 10);
    const etaMinutes = calculateEtaMinutes(distanceKm);
    const routeWaypoints = generateRouteWaypoints(workerLat, workerLng, custLat, custLng);

    booking.latitude = custLat;
    booking.longitude = custLng;
    booking.worker_latitude = workerLat;
    booking.worker_longitude = workerLng;
    booking.distance_km = distanceKm;
    booking.eta_minutes = etaMinutes;

    booking.tracking = {
      workerCoords: { lat: workerLat, lng: workerLng },
      customerCoords: { lat: custLat, lng: custLng },
      distanceKm,
      etaMinutes,
      routeWaypoints,
      dispatchStatus: booking.status === 'IN_PROGRESS'
        ? 'On-Site Performing Service'
        : booking.status === 'ACCEPTED'
        ? 'Artisan En Route to Customer Location'
        : booking.status === 'MATCHED'
        ? 'Artisan Dispatched & Preparing Transit'
        : booking.status === 'COMPLETED'
        ? 'Service Successfully Completed'
        : 'Awaiting Dispatch',
    };

    // Authorization Guard
    if (req.user) {
      if (req.user.role === 'CUSTOMER' && booking.customer_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden', message: 'Access denied: You can only view your own bookings.' });
      } else if (req.user.role === 'WORKER') {
        const workerProfileRes = await query('SELECT id FROM workers WHERE user_id = $1', [req.user.id]);
        const workerProfile = workerProfileRes.rows[0];
        if (workerProfile && booking.worker_id !== workerProfile.id && booking.paired_master_worker_id !== workerProfile.id) {
          return res.status(403).json({ error: 'Forbidden', message: 'Access denied: You can only view jobs assigned to you.' });
        }
      }
    }

    // Cryptographic OTP Handshake Protection:
    // Only the citizen who raised the order and Cooperative Admin can view the OTPs.
    // The artisan MUST NOT see the code in the API response — they must collect it physically on-site from the customer.
    const isCitizenOwner = req.user && req.user.role === 'CUSTOMER' && booking.customer_id === req.user.id;
    const isCoopAdmin = req.user && req.user.role === 'COOPERATIVE_ADMIN';
    if (!isCitizenOwner && !isCoopAdmin) {
      delete booking.arrival_otp;
      delete booking.completion_otp;
    }

    const paymentRes = await query('SELECT * FROM payments WHERE booking_id = $1', [booking.id]);
    const invoiceRes = await query('SELECT * FROM invoices WHERE booking_id = $1', [booking.id]);
    const reviewRes = await query('SELECT * FROM reviews WHERE booking_id = $1', [booking.id]);

    res.json({
      booking,
      payment: paymentRes.rows[0] || null,
      invoice: invoiceRes.rows[0] || null,
      review: reviewRes.rows[0] || null,
    });
  } catch (err) {
    console.error('Get booking detail error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch booking detail.' });
  }
}

/**
 * POST /api/bookings/:id/verify-arrival-otp (Phase 4 Security Handshake)
 */
async function verifyArrivalOtp(req, res) {
  try {
    const otp = req.body.otp || req.body.arrivalOtp;
    const bookingId = req.params.id;

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    // Only the dispatched artisan (or a cooperative admin acting on support)
    // may complete the arrival handshake — the customer holds the code, the
    // artisan proves they are on-site by entering it.
    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the artisan dispatched to this job can verify the arrival OTP.',
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Work is already marked as completed.' });
    }
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Cannot verify arrival for a cancelled booking.' });
    }
    if (booking.status === 'IN_PROGRESS') {
      return res.json({
        message: 'Arrival OTP already verified. Work session is currently IN_PROGRESS.',
        booking,
      });
    }
    if (booking.status === 'REQUESTED' || !booking.worker_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This job has not been accepted by an artisan yet.',
      });
    }

    // Brute-force protection: Check if OTP verification is temporarily locked
    if (booking.otp_locked_until && new Date() < new Date(booking.otp_locked_until)) {
      const remainingSecs = Math.ceil((new Date(booking.otp_locked_until).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `OTP verification is locked due to multiple failed attempts. Please retry in ${Math.max(1, Math.ceil(remainingSecs / 60))} minute(s).`,
        lockedRemainingSeconds: remainingSecs,
      });
    }

    const expectedOtp = String(booking.arrival_otp || '').trim();
    const providedOtp = String(otp || '').trim();

    if (!expectedOtp || providedOtp !== expectedOtp) {
      const currentAttempts = (parseInt(booking.arrival_otp_attempts, 10) || 0) + 1;
      if (currentAttempts >= 3) {
        await query(`
          UPDATE bookings
          SET arrival_otp_attempts = $1, otp_locked_until = CURRENT_TIMESTAMP + INTERVAL '15 minutes', updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [currentAttempts, bookingId]);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Security Alert: Maximum 3 failed OTP attempts reached. Handshake verification is locked for 15 minutes.',
          lockedRemainingSeconds: 900,
        });
      } else {
        await query(`
          UPDATE bookings
          SET arrival_otp_attempts = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [currentAttempts, bookingId]);
        return res.status(400).json({
          error: 'Invalid OTP',
          message: `The 4-digit Arrival OTP entered is incorrect (${currentAttempts}/3 attempts). Please ask the customer to confirm the code on their screen.`,
          attemptsRemaining: 3 - currentAttempts,
        });
      }
    }

    // Set status to IN_PROGRESS upon successful arrival handshake & reset failed attempts
    const updateRes = await query(`
      UPDATE bookings
      SET status = 'IN_PROGRESS', arrival_otp_attempts = 0, otp_locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [bookingId]);

    // Ensure worker availability is set to BUSY during the active work session
    if (booking.worker_id) {
      await query(`
        UPDATE workers
        SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [booking.worker_id]);
    }

    res.json({
      message: 'Arrival OTP verified! Work session is now IN_PROGRESS.',
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Verify arrival OTP error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to verify arrival OTP.' });
  }
}

/**
 * POST /api/bookings/:id/verify-completion-otp (Phase 4 Security Handshake)
 */
async function verifyCompletionOtp(req, res) {
  try {
    const otp = req.body.otp || req.body.completionOtp;
    const bookingId = req.params.id;

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the artisan dispatched to this job can verify the completion OTP.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Cannot complete a cancelled booking.' });
    }
    if (booking.status === 'COMPLETED') {
      return res.json({
        message: 'Booking is already verified as completed.',
        booking,
      });
    }
    if (!['ACCEPTED', 'IN_PROGRESS'].includes(booking.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This job has not started yet. Verify the arrival OTP first.',
      });
    }

    // Brute-force protection: Check if OTP verification is temporarily locked
    if (booking.otp_locked_until && new Date() < new Date(booking.otp_locked_until)) {
      const remainingSecs = Math.ceil((new Date(booking.otp_locked_until).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `OTP verification is locked due to multiple failed attempts. Please retry in ${Math.max(1, Math.ceil(remainingSecs / 60))} minute(s).`,
        lockedRemainingSeconds: remainingSecs,
      });
    }

    const expectedOtp = String(booking.completion_otp || '').trim();
    const providedOtp = String(otp || '').trim();

    if (!expectedOtp || providedOtp !== expectedOtp) {
      const currentAttempts = (parseInt(booking.completion_otp_attempts, 10) || 0) + 1;
      if (currentAttempts >= 3) {
        await query(`
          UPDATE bookings
          SET completion_otp_attempts = $1, otp_locked_until = CURRENT_TIMESTAMP + INTERVAL '15 minutes', updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [currentAttempts, bookingId]);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Security Alert: Maximum 3 failed OTP attempts reached. Handshake verification is locked for 15 minutes.',
          lockedRemainingSeconds: 900,
        });
      } else {
        await query(`
          UPDATE bookings
          SET completion_otp_attempts = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [currentAttempts, bookingId]);
        return res.status(400).json({
          error: 'Invalid OTP',
          message: `The 4-digit Completion OTP entered is incorrect (${currentAttempts}/3 attempts). Please ask the customer to confirm the code on their screen.`,
          attemptsRemaining: 3 - currentAttempts,
        });
      }
    }

    const completedAt = new Date().toISOString();
    // Arm 30-day cooperative guarantee
    const guaranteeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updateRes = await query(`
      UPDATE bookings
      SET status = 'COMPLETED', completed_at = $1, guarantee_armed_until = $2,
          completion_otp_attempts = 0, otp_locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [completedAt, guaranteeUntil, bookingId]);

    // Update worker stats, merit points (+20 points for verified completion), and availability
    if (booking.worker_id) {
      await query(`
        UPDATE workers
        SET total_jobs_completed = total_jobs_completed + 1,
            total_earnings = total_earnings + $1,
            merit_points = merit_points + 20,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [booking.amount || 299, booking.worker_id]);

      // Release worker back to AVAILABLE if no other active jobs
      await releaseWorkerIfIdle(booking.worker_id, bookingId);
    }

    // Auto-record in Appliance Lineage (Phase 6)
    const serviceRes = await query('SELECT name, category FROM services WHERE id = $1', [booking.service_id]);
    const service = serviceRes.rows[0];

    await query(`
      INSERT INTO appliance_lineage (
        customer_id, appliance_type, brand_model, last_service_date, service_summary, booking_id, warranty_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      booking.customer_id,
      service ? service.name : 'General Maintenance',
      booking.notes || 'Routine Servicing',
      completedAt.split('T')[0],
      `Completed service under booking ${booking.booking_code}. Standard 30-Day Guarantee active.`,
      bookingId,
      guaranteeUntil.split('T')[0]
    ]);

    res.json({
      message: 'Job completed verified! 30-Day Cooperative Repair Guarantee is armed.',
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Verify completion OTP error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to verify completion OTP.' });
  }
}

/**
 * POST /api/bookings/:id/photo-proof (Phase 4 Photo Proofs)
 */
async function uploadPhotoProof(req, res) {
  try {
    const { type, photoUrl } = req.body;
    const bookingId = req.params.id;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Validation Error', message: 'Photo URL or proof data is required.' });
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the artisan assigned to this job can upload work proofs.',
      });
    }

    // `type` is interpolated into the SQL, so it must never come straight
    // from the request body — map it to one of two known columns instead.
    const column = type === 'POST' ? 'post_job_photo_url' : 'pre_job_photo_url';
    const updateRes = await query(`
      UPDATE bookings
      SET ${column} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [photoUrl, bookingId]);

    res.json({
      message: `${type === 'POST' ? 'Post-job' : 'Pre-job'} photo proof recorded successfully.`,
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Photo proof error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to save photo proof.' });
  }
}

/**
 * POST /api/bookings/:id/add-parts (Phase 4 Locked Parts Matrix)
 */
async function addParts(req, res) {
  try {
    const { parts } = req.body;
    const bookingId = req.params.id;

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the artisan assigned to this job can add parts to the work order.',
      });
    }

    if (!Array.isArray(parts)) {
      return res.status(400).json({ error: 'Validation Error', message: 'parts must be an array of catalog line items.' });
    }

    let partsTotal = 0;
    const partsSummary = parts.map((p) => {
      // Guard against NaN totals from a malformed/absent price or quantity.
      const price = Number(p.price) || 0;
      const quantity = Math.max(1, parseInt(p.quantity, 10) || 1);
      const lineCost = Math.round(price * quantity * 100) / 100;
      partsTotal += lineCost;
      return `${p.partName || 'Standard Part'} (x${quantity}) - ₹${lineCost}`;
    }).join(', ');

    partsTotal = Math.round(partsTotal * 100) / 100;

    const newTotalAmount = Math.round(
      (Number(booking.amount) + Number(booking.cooperative_fee) + Number(booking.platform_fee) + partsTotal) * 100
    ) / 100;

    const updateRes = await query(`
      UPDATE bookings
      SET parts_cost = $1, parts_details = $2, total_amount = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [partsTotal, partsSummary, newTotalAmount, bookingId]);

    // Update invoice
    await query(`
      UPDATE invoices
      SET parts_cost = $1, total_amount = $2
      WHERE booking_id = $3
    `, [partsTotal, newTotalAmount, bookingId]);

    res.json({
      message: 'Locked standard parts successfully added to work order.',
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Add parts error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to add parts.' });
  }
}

/**
 * POST /api/bookings/:id/claim-guarantee (Phase 6 30-Day Free Repair Guarantee)
 */
async function claimGuarantee(req, res) {
  try {
    const bookingId = req.params.id;
    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];

    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the citizen who raised this order can claim its 30-Day Guarantee.',
      });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'The 30-Day Guarantee applies only to completed services.',
      });
    }

    // Without this the endpoint mints an unlimited number of free
    // Master-Artisan dispatches from a single completed booking.
    if (booking.guarantee_claimed) {
      return res.status(409).json({
        error: 'Already Claimed',
        message: 'The 30-Day Guarantee for this service has already been claimed. Please raise a grievance ticket for further help.',
      });
    }

    if (!booking.guarantee_armed_until || new Date() > new Date(booking.guarantee_armed_until)) {
      return res.status(400).json({ error: 'Expired', message: 'The 30-Day Guarantee period for this service has expired.' });
    }

    // Flag the claim first, conditionally, so two concurrent requests cannot
    // both pass the check above and each get a free re-dispatch.
    const claimRes = await query(`
      UPDATE bookings
      SET guarantee_claimed = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND (guarantee_claimed IS NULL OR guarantee_claimed = 0)
      RETURNING id
    `, [bookingId]);

    if (claimRes.rowCount === 0) {
      return res.status(409).json({
        error: 'Already Claimed',
        message: 'The 30-Day Guarantee for this service has already been claimed.',
      });
    }

    // Find top Master Artisan in district
    const masterRes = await query(`
      SELECT w.id FROM workers w
      WHERE w.tier = 'MASTER' AND (w.verification_status = 'VERIFIED' OR w.verification_status IS NULL)
      LIMIT 1
    `);
    const masterWorkerId = masterRes.rows[0] ? masterRes.rows[0].id : booking.worker_id;

    // Create free re-dispatch booking
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const rebookingCode = `GRNT-${uniqueSuffix}`;
    const newArrivalOtp = generate4DigitOtp();
    const newCompletionOtp = generate4DigitOtp();

    const newBookingRes = await query(`
      INSERT INTO bookings (
        booking_code, customer_id, worker_id, service_id, location_district, location_city,
        location_address, location_pincode, scheduled_date, scheduled_time, is_emergency,
        status, amount, cooperative_fee, platform_fee, total_amount, notes,
        arrival_otp, completion_otp, guarantee_claimed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, 'MATCHED', 0, 0, 0, 0, $11, $12, $13, 1)
      RETURNING *
    `, [
      rebookingCode,
      booking.customer_id,
      masterWorkerId,
      booking.service_id,
      booking.location_district,
      booking.location_city,
      booking.location_address,
      booking.location_pincode,
      new Date().toISOString().split('T')[0],
      'Express 60 Mins',
      `30-Day Guarantee Claim for original order ${booking.booking_code}. Master Artisan re-dispatched at ₹0 cost.`,
      newArrivalOtp,
      newCompletionOtp
    ]);

    res.json({
      message: '30-Day Guarantee Claim Approved! Master Artisan dispatched at ₹0 labour cost.',
      rebooking: newBookingRes.rows[0],
    });
  } catch (err) {
    console.error('Claim guarantee error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process guarantee claim.' });
  }
}

/**
 * PUT /api/bookings/:id/status
 */
async function updateBookingStatus(req, res) {
  try {
    const { status, workerId } = req.body;

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isOwner && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update bookings you are party to.',
      });
    }

    // status is written straight into the bookings row; anything outside the
    // lifecycle enum either violates the CHECK constraint (500) or wedges the
    // booking in a state no screen knows how to render.
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `status must be one of: ${BOOKING_STATUSES.join(', ')}.`,
      });
    }

    let updateWorkerId = booking.worker_id;
    if (workerId && workerId !== booking.worker_id) {
      // Reassigning an artisan is a dispatch-desk action, not something a
      // citizen or another worker may do.
      if (!access.isAdmin) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the cooperative dispatch desk can reassign an artisan to a booking.',
        });
      }

      const workerRes = await query(`
        SELECT w.id, w.availability, u.name
        FROM workers w
        JOIN users u ON w.user_id = u.id
        WHERE w.id = $1
      `, [workerId]);
      const targetWorker = workerRes.rows[0];

      if (!targetWorker) {
        return res.status(404).json({ error: 'Not Found', message: 'Worker not found.' });
      }

      if (targetWorker.availability === 'BUSY') {
        return res.status(409).json({
          error: 'Worker Busy',
          message: `Artisan ${targetWorker.name} is currently busy on an active job assignment and cannot be assigned.`
        });
      }

      const slotCollision = await query(`
        SELECT id, booking_code, scheduled_date, scheduled_time
        FROM bookings
        WHERE worker_id = $1
          AND id != $2
          AND scheduled_date = $3
          AND (scheduled_time = $4 OR $4 = 'Immediate' OR scheduled_time = 'Immediate')
          AND status IN ('MATCHED', 'ACCEPTED', 'IN_PROGRESS')
        LIMIT 1
      `, [workerId, booking.id, booking.scheduled_date, booking.scheduled_time]);

      if (slotCollision.rows.length > 0) {
        return res.status(409).json({
          error: 'Slot Conflict',
          message: `Artisan ${targetWorker.name} already has an active booking (${slotCollision.rows[0].booking_code}) during this time slot (${booking.scheduled_time} on ${booking.scheduled_date}).`
        });
      }

      updateWorkerId = workerId;
    }

    const newArrivalOtp = (status === 'ACCEPTED' && !booking.arrival_otp)
      ? generate4DigitOtp()
      : booking.arrival_otp;
    const newCompletionOtp = (status === 'ACCEPTED' && !booking.completion_otp)
      ? generate4DigitOtp()
      : booking.completion_otp;

    const updateRes = await query(`
      UPDATE bookings
      SET status = $1,
          worker_id = $2,
          arrival_otp = $3,
          completion_otp = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [status, updateWorkerId, newArrivalOtp, newCompletionOtp, req.params.id]);

    // Manage worker availability status based on booking status transition
    if (updateWorkerId) {
      if (status === 'ACCEPTED' || status === 'IN_PROGRESS') {
        await query(`
          UPDATE workers
          SET availability = 'BUSY', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [updateWorkerId]);
      } else if (status === 'COMPLETED' || status === 'CANCELLED') {
        await releaseWorkerIfIdle(updateWorkerId, req.params.id);
      }
    }

    res.json({
      message: `Booking status updated to ${status}`,
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update booking status.' });
  }
}

/**
 * POST /api/bookings/:id/cancel
 */
async function cancelBooking(req, res) {
  try {
    const { reason } = req.body;
    const rawId = req.params.id;
    const isNumeric = /^\d+$/.test(rawId);
    const whereClause = isNumeric ? 'id = $1' : 'booking_code = $1';
    const queryVal = isNumeric ? parseInt(rawId, 10) : rawId;

    const bookingRes = await query(`SELECT * FROM bookings WHERE ${whereClause}`, [queryVal]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    const access = await getBookingAccess(req.user, booking);
    if (!access.isAdmin && !access.isOwner && !access.isAssignedWorker) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only cancel bookings you are party to.',
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Completed bookings cannot be cancelled.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Booking is already cancelled.' });
    }

    // Doorstep Transit Protection:
    // If cancelled after dispatch (ACCEPTED / IN_PROGRESS), credit transit compensation to worker
    let transitCompensationAwarded = 0;
    if (booking.worker_id && ['ACCEPTED', 'IN_PROGRESS'].includes(booking.status)) {
      transitCompensationAwarded = Number(booking.transit_compensation_fee) || 50.0;
      await query(`
        UPDATE workers
        SET total_earnings = total_earnings + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [transitCompensationAwarded, booking.worker_id]);
    }

    // Only free the artisan if this was their last live job
    await releaseWorkerIfIdle(booking.worker_id, booking.id);

    const updateRes = await query(`
      UPDATE bookings
      SET status = 'CANCELLED',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [reason || 'Cancelled by customer', booking.id]);

    res.json({
      message: transitCompensationAwarded > 0
        ? `Booking cancelled. Dispatched artisan credited ₹${transitCompensationAwarded.toFixed(0)} doorstep transit compensation under cooperative protection rules.`
        : 'Booking cancelled successfully. Allocated artisan released.',
      transitCompensationAwarded,
      booking: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Server Error', message: `Failed to cancel booking: ${err.message}` });
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  verifyArrivalOtp,
  verifyCompletionOtp,
  uploadPhotoProof,
  addParts,
  claimGuarantee,
  updateBookingStatus,
  cancelBooking,
};
