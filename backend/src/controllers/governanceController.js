const { query } = require('../db/connection');

/**
 * POST /api/governance/sos
 * Phase 4: Trigger 1-Tap Emergency SOS Beacon (Worker Safety).
 */
async function triggerSos(req, res) {
  try {
    const { bookingId, latitude, longitude, details } = req.body;
    const userId = req.user.id;

    const workerRes = await query('SELECT id, worker_code FROM workers WHERE user_id = $1', [userId]);
    const worker = workerRes.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker profile not found.' });
    }

    const sosRes = await query(`
      INSERT INTO sos_logs (worker_id, booking_id, latitude, longitude, status, details)
      VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
      RETURNING *
    `, [worker.id, bookingId || null, latitude || 20.296, longitude || 85.824, details || 'Emergency SOS button triggered from mobile web interface.']);

    // Set worker sos_active flag
    await query('UPDATE workers SET sos_active = 1 WHERE id = $1', [worker.id]);

    res.status(201).json({
      message: '🚨 EMERGENCY SOS BEACON ACTIVATED. Federation Emergency Response & Supervisor Squad alerted with your live GPS location.',
      sosLog: sosRes.rows[0],
    });
  } catch (err) {
    console.error('SOS trigger error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to activate SOS beacon.' });
  }
}

/**
 * GET /api/governance/sos-alerts
 * Active SOS emergency feeds for Federation Admin.
 */
async function getSosAlerts(req, res) {
  try {
    const alertsRes = await query(`
      SELECT s.*, u.name as worker_name, u.phone as worker_phone, u.district as worker_district,
             w.worker_code, w.tier as worker_tier,
             b.booking_code, b.location_address
      FROM sos_logs s
      JOIN workers w ON s.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      LEFT JOIN bookings b ON s.booking_id = b.id
      ORDER BY s.id DESC
      LIMIT 20
    `);

    res.json({ alerts: alertsRes.rows });
  } catch (err) {
    console.error('Get SOS alerts error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch SOS alerts.' });
  }
}

/**
 * GET /api/governance/live-map
 * Phase 7: Live Interactive Map of active workers, dispatch clusters, and emergency zones.
 */
async function getLiveMap(req, res) {
  try {
    const workersRes = await query(`
      SELECT w.id, w.worker_code, w.tier, w.availability, w.latitude, w.longitude, w.rating, w.sos_active, w.primary_trade,
             u.name, u.phone, u.district, u.city,
             c.name as cooperative_name
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      WHERE w.verification_status = 'VERIFIED' AND u.is_active = 1
    `);

    const isAdmin = req.user && req.user.role === 'COOPERATIVE_ADMIN';

    // Privacy-aware Active Bookings: Only Cooperative Admins see exact citizen street addresses
    const activeBookingsRes = await query(`
      SELECT b.id, b.booking_code, b.status, b.is_emergency, b.latitude, b.longitude,
             b.location_district, b.location_city,
             ${isAdmin ? 'b.location_address,' : "'' as location_address,"}
             s.name as service_name, s.category as service_category
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('MATCHED', 'ACCEPTED', 'IN_PROGRESS')
    `);

    // Demand heatmap density clusters (K-Means simulation)
    const heatmapClusters = [
      { name: 'Patia IT Corridor (Bhubaneswar)', lat: 20.3540, lng: 85.8170, density: 'HIGH', demandIndex: 94, topTrade: 'Electrical & AC' },
      { name: 'Jaydev Vihar Residential Hub', lat: 20.2961, lng: 85.8245, density: 'HIGH', demandIndex: 88, topTrade: 'Plumbing & Deep Cleaning' },
      { name: 'Saheed Nagar Commercial Cluster', lat: 20.2870, lng: 85.8450, density: 'MODERATE', demandIndex: 72, topTrade: 'Carpentry & Maintenance' },
      { name: 'College Square & Buxi Bazar (Cuttack)', lat: 20.4625, lng: 85.8830, density: 'SURPLUS_ZONE', demandIndex: 65, topTrade: 'Drainage & Electrical' },
      { name: 'Grand Road & VIP Corridor (Puri)', lat: 19.8135, lng: 85.8312, density: 'SEASONAL', demandIndex: 58, topTrade: 'Caregiving & Painting' },
    ];

    res.json({
      workers: workersRes.rows,
      activeBookings: activeBookingsRes.rows,
      heatmapClusters,
    });
  } catch (err) {
    console.error('Get live map error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch live map data.' });
  }
}

/**
 * POST /api/governance/disputes
 * Phase 7: Create a dispute / grievance ticket.
 */
async function createDispute(req, res) {
  try {
    const { bookingId, issueType, description } = req.body;
    const customerId = req.user.id;

    if (!issueType || !description) {
      return res.status(400).json({ error: 'Validation Error', message: 'Issue type and description are required.' });
    }

    let workerId = null;
    if (bookingId) {
      const bRes = await query('SELECT customer_id, worker_id FROM bookings WHERE id = $1', [bookingId]);
      if (bRes.rows[0]) {
        // Customer can only raise disputes for their own bookings
        if (req.user.role !== 'COOPERATIVE_ADMIN' && bRes.rows[0].customer_id !== customerId) {
          return res.status(403).json({ error: 'Forbidden', message: 'You can only lodge disputes for your own service bookings.' });
        }
        workerId = bRes.rows[0].worker_id;
      }
    }

    const countRes = await query('SELECT COUNT(*) as c FROM dispute_tickets');
    const ticketCode = `DISP-2026-${String(parseInt(countRes.rows[0].c, 10) + 1).padStart(3, '0')}`;

    const insertRes = await query(`
      INSERT INTO dispute_tickets (ticket_code, booking_id, customer_id, worker_id, issue_type, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
      RETURNING *
    `, [ticketCode, bookingId || null, customerId, workerId, issueType, description]);

    res.status(201).json({
      message: 'Grievance ticket created. Assigned to Cooperative Federation Human Arbitration Desk (No bot dead-ends).',
      ticket: insertRes.rows[0],
    });
  } catch (err) {
    console.error('Create dispute error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create dispute ticket.' });
  }
}

/**
 * GET /api/governance/disputes
 * Role-Based Access Control: Customers see only their own tickets; workers see tickets involving their jobs; Admins see all.
 */
async function getDisputes(req, res) {
  try {
    const userRole = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;

    let sql = `
      SELECT d.*, u_cust.name as customer_name, u_cust.phone as customer_phone,
             u_work.name as worker_name,
             b.booking_code
      FROM dispute_tickets d
      JOIN users u_cust ON d.customer_id = u_cust.id
      LEFT JOIN workers w ON d.worker_id = w.id
      LEFT JOIN users u_work ON w.user_id = u_work.id
      LEFT JOIN bookings b ON d.booking_id = b.id
    `;
    const params = [];

    if (userRole === 'CUSTOMER') {
      sql += ' WHERE d.customer_id = $1';
      params.push(userId);
    } else if (userRole === 'WORKER') {
      const workerRes = await query('SELECT id FROM workers WHERE user_id = $1', [userId]);
      const workerId = workerRes.rows[0]?.id;
      if (!workerId) return res.json({ disputes: [] });
      sql += ' WHERE d.worker_id = $1';
      params.push(workerId);
    } else if (userRole !== 'COOPERATIVE_ADMIN') {
      return res.status(403).json({ error: 'Forbidden', message: 'Authentication required to view disputes.' });
    }

    sql += ' ORDER BY d.id DESC';
    const disputesRes = await query(sql, params);

    res.json({ disputes: disputesRes.rows });
  } catch (err) {
    console.error('Get disputes error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch disputes.' });
  }
}

/**
 * PUT /api/governance/disputes/:id/resolve
 */
async function resolveDispute(req, res) {
  try {
    const { resolutionNotes } = req.body;
    const disputeId = req.params.id;
    const arbitratorName = req.user.name || 'Federation Arbitrator';

    const updateRes = await query(`
      UPDATE dispute_tickets
      SET status = 'RESOLVED', resolution_notes = $1, arbitrator_name = $2, resolved_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [resolutionNotes || 'Arbitration complete and agreement reached.', arbitratorName, disputeId]);

    res.json({
      message: 'Dispute resolved successfully by human arbitrator.',
      ticket: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Resolve dispute error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to resolve dispute.' });
  }
}

/**
 * GET /api/governance/appliance-lineage/:customerId
 * Phase 6: Permanent Appliance Service Lineage History with IDOR Guard.
 */
async function getApplianceLineage(req, res) {
  try {
    const requestedId = req.params.customerId ? parseInt(req.params.customerId, 10) : req.user.id;

    // IDOR Guard: Citizens can only inspect their own home appliance lineage
    if (req.user.role !== 'COOPERATIVE_ADMIN' && req.user.id !== requestedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: You can only view appliance lineage records for your own registered residence.',
      });
    }

    const lineageRes = await query(`
      SELECT l.*, b.booking_code
      FROM appliance_lineage l
      LEFT JOIN bookings b ON l.booking_id = b.id
      WHERE l.customer_id = $1
      ORDER BY l.id DESC
    `, [requestedId]);

    res.json({ lineage: lineageRes.rows });
  } catch (err) {
    console.error('Get lineage error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch appliance lineage.' });
  }
}

/**
 * GET /api/governance/parts-catalog
 * Phase 2 & 4: Standard Locked Parts Price Matrix.
 */
async function getPartsCatalog(req, res) {
  try {
    const { tradeCategory } = req.query;

    let q = 'SELECT * FROM parts_catalog';
    const params = [];
    if (tradeCategory) {
      q += ' WHERE trade_category = $1';
      params.push(tradeCategory);
    }
    q += ' ORDER BY trade_category, part_name';

    const partsRes = await query(q, params);
    res.json({ parts: partsRes.rows });
  } catch (err) {
    console.error('Get parts catalog error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch parts catalog.' });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEDERATION HEAD TARIFF ADMINISTRATION — Services & Parts Catalog
// Only admin_type === 'FEDERATION_HEAD' may modify these tables.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function requireFederationHead(req, res) {
  if (req.user?.admin_type !== 'FEDERATION_HEAD') {
    res.status(403).json({ error: 'Forbidden', message: 'Only the State Apex Federation Head may modify the statutory tariff matrix.' });
    return false;
  }
  return true;
}

/** POST /api/governance/admin/services — Create a new service */
async function createService(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { name, category, description, base_price, price_unit, icon, is_complex } = req.body;
    if (!name || !category || base_price === undefined) {
      return res.status(400).json({ error: 'Validation Error', message: 'name, category, and base_price are required.' });
    }
    const result = await query(
      `INSERT INTO services (name, category, description, base_price, price_unit, icon, is_complex, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1) RETURNING *`,
      [name, category, description || '', parseFloat(base_price), price_unit || 'per_visit', icon || '🔧', is_complex ? 1 : 0]
    );
    res.status(201).json({ success: true, service: result.rows[0], message: `Service "${name}" added to the statutory tariff matrix.` });
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create service.' });
  }
}

/** PUT /api/governance/admin/services/:id — Update a service */
async function updateService(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { id } = req.params;
    const { name, category, description, base_price, price_unit, icon, is_complex, is_active } = req.body;
    const result = await query(
      `UPDATE services SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        base_price = COALESCE($4, base_price),
        price_unit = COALESCE($5, price_unit),
        icon = COALESCE($6, icon),
        is_complex = COALESCE($7, is_complex),
        is_active = COALESCE($8, is_active)
       WHERE id = $9 RETURNING *`,
      [name, category, description, base_price !== undefined ? parseFloat(base_price) : null, price_unit, icon,
       is_complex !== undefined ? (is_complex ? 1 : 0) : null,
       is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not Found', message: 'Service not found.' });
    res.json({ success: true, service: result.rows[0], message: 'Service tariff updated in the statutory matrix.' });
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update service.' });
  }
}

/** DELETE /api/governance/admin/services/:id — Deactivate (soft-delete) a service */
async function deleteService(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { id } = req.params;
    await query('UPDATE services SET is_active = 0 WHERE id = $1', [id]);
    res.json({ success: true, message: 'Service deactivated from the statutory tariff matrix.' });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to deactivate service.' });
  }
}

/** POST /api/governance/admin/parts-catalog — Add a part to the locked price matrix */
async function createPart(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { trade_category, part_name, standard_price, unit, warranty_months } = req.body;
    if (!trade_category || !part_name || standard_price === undefined) {
      return res.status(400).json({ error: 'Validation Error', message: 'trade_category, part_name, and standard_price are required.' });
    }
    const result = await query(
      `INSERT INTO parts_catalog (trade_category, part_name, standard_price, unit, warranty_months)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [trade_category, part_name, parseFloat(standard_price), unit || 'piece', parseInt(warranty_months) || 6]
    );
    res.status(201).json({ success: true, part: result.rows[0], message: `Part "${part_name}" added to the locked price matrix.` });
  } catch (err) {
    console.error('Create part error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create part entry.' });
  }
}

/** PUT /api/governance/admin/parts-catalog/:id — Update a part's regulated price */
async function updatePart(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { id } = req.params;
    const { trade_category, part_name, standard_price, unit, warranty_months } = req.body;
    const result = await query(
      `UPDATE parts_catalog SET
        trade_category = COALESCE($1, trade_category),
        part_name = COALESCE($2, part_name),
        standard_price = COALESCE($3, standard_price),
        unit = COALESCE($4, unit),
        warranty_months = COALESCE($5, warranty_months)
       WHERE id = $6 RETURNING *`,
      [trade_category, part_name, standard_price !== undefined ? parseFloat(standard_price) : null,
       unit, warranty_months !== undefined ? parseInt(warranty_months) : null, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not Found', message: 'Part not found.' });
    res.json({ success: true, part: result.rows[0], message: 'Part price updated in the locked matrix.' });
  } catch (err) {
    console.error('Update part error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update part.' });
  }
}

/** DELETE /api/governance/admin/parts-catalog/:id — Remove a part from the catalog */
async function deletePart(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const { id } = req.params;
    await query('DELETE FROM parts_catalog WHERE id = $1', [id]);
    res.json({ success: true, message: 'Part removed from the locked price matrix.' });
  } catch (err) {
    console.error('Delete part error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete part.' });
  }
}

/** GET /api/governance/admin/services — All services including inactive (for admin management) */
async function getAllServicesAdmin(req, res) {
  if (!requireFederationHead(req, res)) return;
  try {
    const result = await query('SELECT * FROM services ORDER BY category, name');
    res.json({ services: result.rows });
  } catch (err) {
    console.error('Get all services admin error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch services.' });
  }
}

module.exports = {
  triggerSos,
  getSosAlerts,
  getLiveMap,
  createDispute,
  getDisputes,
  resolveDispute,
  getApplianceLineage,
  getPartsCatalog,
  // Tariff Administration (FEDERATION_HEAD only)
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  createPart,
  updatePart,
  deletePart,
};
