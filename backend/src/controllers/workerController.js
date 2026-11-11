
const { query } = require('../db/connection');
const { maskPhone, sanitizeWorkerProfile } = require('../utils/piiMasker');

/**
 * GET /api/workers
 * List workers with optional filters.
 * Query params: skill, district, city, availability, verified, search, page, limit
 */
async function getWorkers(req, res) {
  try {
    const { skill, district, city, availability, verified, search, page = 1, limit = 20 } = req.query;

    let where = ['u.is_active = 1'];
    let params = [];
    let paramIdx = 1;

    if (skill) {
      const normalizedSkill = skill.startsWith('cat') ? skill.replace(/^cat/, '') : skill;
      where.push(`EXISTS (
        SELECT 1 FROM worker_skills ws 
        JOIN skills s ON ws.skill_id = s.id 
        WHERE ws.worker_id = w.id AND (s.category ILIKE $${paramIdx} OR s.name ILIKE $${paramIdx + 1})
      )`);
      params.push(normalizedSkill, `%${normalizedSkill}%`);
      paramIdx += 2;
    }

    if (district) {
      where.push(`u.district = $${paramIdx}`);
      params.push(district);
      paramIdx += 1;
    }

    if (city) {
      where.push(`u.city = $${paramIdx}`);
      params.push(city);
      paramIdx += 1;
    }

    if (availability) {
      where.push(`w.availability = $${paramIdx}`);
      params.push(availability);
      paramIdx += 1;
    }

    if (verified === 'true') {
      where.push("w.verification_status = 'VERIFIED'");
    }

    if (search) {
      where.push(`(u.name ILIKE $${paramIdx} OR w.worker_code ILIKE $${paramIdx + 1} OR w.bio ILIKE $${paramIdx + 2} OR w.primary_trade ILIKE $${paramIdx + 3})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      paramIdx += 4;
    }

    const limitNum = parseInt(limit, 10);
    const offsetNum = (parseInt(page, 10) - 1) * limitNum;
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countRes = await query(`
      SELECT COUNT(*) as count FROM workers w
      JOIN users u ON w.user_id = u.id
      ${whereClause}
    `, params);

    const total = parseInt(countRes.rows[0].count, 10);

    const queryParams = [...params, limitNum, offsetNum];
    const workersRes = await query(`
      SELECT w.id, w.worker_code, w.experience_years, w.service_area,
             w.verification_status, w.availability, w.rating, w.total_reviews,
             w.total_jobs_completed, w.bio, w.latitude, w.longitude,
             w.tier, w.merit_points, w.strike_count, w.primary_trade,
             w.tools_owned, w.toolkit_compliance, w.society_id,
             u.name, u.phone, u.district, u.city, u.avatar_url,
             c.name as cooperative_name,
             s.name as society_name, s.society_code,
             (w.society_id IS NULL) as is_independent
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN societies s ON w.society_id = s.id
      ${whereClause}
      ORDER BY w.rating DESC, w.total_jobs_completed DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `, queryParams);

    const workers = workersRes.rows;

    // Get skills for all fetched workers and ensure primary_trade is set
    for (const w of workers) {
      const skillsRes = await query(`
        SELECT s.name, s.category, ws.proficiency_level
        FROM worker_skills ws
        JOIN skills s ON ws.skill_id = s.id
        WHERE ws.worker_id = $1
      `, [w.id]);
      w.skills = skillsRes.rows;
      w.primary_trade = w.primary_trade || (w.skills && w.skills[0] ? w.skills[0].category : 'General Artisan');
      // Mask phone numbers in public catalog to prevent automated scraping
      w.phone = maskPhone(w.phone);
    }

    res.json({
      workers,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Get workers error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch workers.' });
  }
}

/**
 * GET /api/workers/:id
 * Get full worker profile with DPDP PII data protection.
 */
async function getWorkerById(req, res) {
  try {
    const workerRes = await query(`
      SELECT w.*, u.name, u.email, u.phone, u.district, u.city, u.address, 
             u.pincode, u.avatar_url,
             c.name as cooperative_name, c.registration_number as cooperative_reg,
             s.name as society_name, s.society_code,
             (w.society_id IS NULL) as is_independent
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN societies s ON w.society_id = s.id
      WHERE w.id = $1
    `, [req.params.id]);

    const rawWorker = workerRes.rows[0];

    if (!rawWorker) {
      return res.status(404).json({ error: 'Not Found', message: 'Worker not found.' });
    }

    // Skills
    const skillsRes = await query(`
      SELECT s.id, s.name, s.category, ws.proficiency_level
      FROM worker_skills ws
      JOIN skills s ON ws.skill_id = s.id
      WHERE ws.worker_id = $1
    `, [rawWorker.id]);
    rawWorker.skills = skillsRes.rows;
    rawWorker.primary_trade = rawWorker.primary_trade || (rawWorker.skills && rawWorker.skills[0] ? rawWorker.skills[0].category : 'General Artisan');

    // Certifications
    const certsRes = await query(`
      SELECT * FROM certifications WHERE worker_id = $1 ORDER BY issue_date DESC
    `, [rawWorker.id]);
    rawWorker.certifications = certsRes.rows;

    // Recent reviews
    const reviewsRes = await query(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [rawWorker.id]);
    rawWorker.reviews = reviewsRes.rows;

    // PII Sanitization Guard: Mask Aadhaar, PAN, Bank details for public visitors
    const worker = sanitizeWorkerProfile(rawWorker, req.user);

    res.json({ worker });
  } catch (err) {
    console.error('Get worker detail error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch worker profile.' });
  }
}

module.exports = { getWorkers, getWorkerById };
