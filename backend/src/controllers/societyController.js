const bcrypt = require('bcryptjs');
const { query } = require('../db/connection');
const { generateToken } = require('../utils/jwt');

/**
 * Generate random formatted tracking ID
 */
function generateTrackingId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SS-SOC-${year}-${rand}`;
}

/**
 * POST /api/societies/register
 * 9-Step Legal Formation Workflow for Newly Formed Societies (Page 1)
 */
async function registerSociety(req, res) {
  try {
    const {
      name,
      registered_email,
      registered_phone,
      district,
      city,
      address,
      pincode,
      objectives,
      initial_capital_balance = 10000,
      bank_account_no,
      cooperative_bank_name,
      bank_ifsc,
      founding_members = [],
      documents = [],
      admin_name,
      password = 'demo123',
      federation_id,
    } = req.body;

    // 1. Validation: Name & Email
    if (!name || !registered_email || !district) {
      return res.status(400).json({ error: 'Society Name, Email, and District are required.' });
    }

    // 2. Minimum 10 Founding Members Validation (Statutory Requirement - Page 1)
    if (!Array.isArray(founding_members) || founding_members.length < 10) {
      return res.status(400).json({
        error: 'Statutory Formation Requirement: At least 10 founding members are required to form and register a new cooperative society.',
        receivedMembersCount: founding_members ? founding_members.length : 0,
      });
    }

    // 3. Minimum Capital Balance Validation (Min ₹10,000 - Page 1)
    const capital = parseFloat(initial_capital_balance) || 0;
    if (capital < 10000) {
      return res.status(400).json({
        error: 'Statutory Capital Requirement: Proof of minimum ₹10,000 initial capital contribution deposited in a cooperative bank is required.',
      });
    }

    // Check if society email already exists
    const existingSoc = await query('SELECT id FROM societies WHERE registered_email = $1', [registered_email]);
    if (existingSoc.rows.length > 0) {
      return res.status(400).json({ error: 'A cooperative society with this registered official email already exists.' });
    }

    // Create or Link Applicant User Account (Page 1)
    const applicantName = admin_name || `Chief Promoter, ${name}`;
    let userRecord;
    const userExists = await query('SELECT id FROM users WHERE email = $1', [registered_email]);
    if (userExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRes = await query(
        `INSERT INTO users (name, email, phone, role, password_hash, designation, district, city, address, pincode)
         VALUES ($1, $2, $3, 'COOPERATIVE_ADMIN', $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email, phone, role`,
        [
          applicantName,
          registered_email,
          registered_phone || '9876543000',
          hashedPassword,
          `Chief Promoter, ${name}`,
          district,
          city || district,
          address || `${district} Main Road`,
          pincode || '751001',
        ]
      );
      userRecord = userRes.rows[0];
    } else {
      userRecord = userExists.rows[0];
    }

    const trackingId = generateTrackingId();
    const societyCode = `SOC-${district.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Affiliation with Federation: Optional during initial formation
    let federationId = null;
    if (federation_id && federation_id !== 'STANDALONE' && federation_id !== 'NONE' && federation_id !== '') {
      const parsedId = parseInt(federation_id, 10);
      if (!isNaN(parsedId)) {
        const fedCheck = await query('SELECT id FROM cooperatives WHERE id = $1', [parsedId]);
        if (fedCheck.rows.length > 0) {
          federationId = fedCheck.rows[0].id;
        }
      }
    }

    // Insert Society
    const societyResult = await query(
      `INSERT INTO societies (
        society_code, name, status, registered_email, registered_phone,
        district, city, address, pincode, objectives, initial_capital_balance,
        bank_account_no, cooperative_bank_name, bank_ifsc, timeline_stage, tracking_id,
        created_by_user_id, federation_id
      ) VALUES ($1, $2, 'SUBMITTED', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 7, $14, $15, $16)
      RETURNING *`,
      [
        societyCode,
        name,
        registered_email,
        registered_phone || '0674-2500000',
        district,
        city || district,
        address || `${district} Main Road`,
        pincode || '751001',
        objectives || 'Labour & artisan welfare cooperative federation',
        capital,
        bank_account_no || 'COOP-ACC-DEFAULT',
        cooperative_bank_name || 'District Central Cooperative Bank',
        bank_ifsc || 'DCCB0001001',
        trackingId,
        userRecord.id,
        federationId,
      ]
    );

    const createdSociety = societyResult.rows[0];

    // Link user to the newly registered society
    await query('UPDATE users SET society_id = $1 WHERE id = $2', [createdSociety.id, userRecord.id]);

    // Insert 10+ Founding Members
    for (const member of founding_members) {
      await query(
        `INSERT INTO society_founding_members (
          society_id, full_name, occupation, address, phone, aadhaar_number, role_in_society, is_signatory
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          createdSociety.id,
          member.full_name || 'Founding Member',
          member.occupation || 'Skilled Artisan',
          member.address || createdSociety.address,
          member.phone || '9800000000',
          member.aadhaar_number || '****-****-0000',
          member.role_in_society || 'MEMBER',
          member.is_signatory !== undefined ? (member.is_signatory ? 1 : 0) : 1,
        ]
      );
    }

    // Insert Statutory Documents (Bylaws, Resolution, Bank Cert, Affidavit)
    const defaultDocs = [
      { doc_type: 'APPLICATION_FORM', document_name: 'Form-1 Formation Application (Signed by 10 Members)' },
      { doc_type: 'MEMBER_LIST', document_name: 'Official Founding Member Roster & Identity Proofs' },
      { doc_type: 'BYLAWS', document_name: 'Model Cooperative Bylaws Document' },
      { doc_type: 'RESOLUTION_OF_FORMATION', document_name: 'General Meeting Resolution & Minutes of Formation' },
      { doc_type: 'BANK_CERTIFICATE', document_name: `Cooperative Bank Capital Certificate (₹${capital.toLocaleString()})` },
      { doc_type: 'AFFIDAVIT', document_name: 'Non-Profit Cooperative Compliance Affidavit' },
    ];

    for (const d of defaultDocs) {
      await query(
        `INSERT INTO society_statutory_documents (
          society_id, doc_type, document_name, document_url, verification_status
        ) VALUES ($1, $2, $3, $4, 'PENDING')`,
        [createdSociety.id, d.doc_type, d.document_name, `https://gov.in/docs/${createdSociety.id}_${d.doc_type.toLowerCase()}.pdf`]
      );
    }

    // Record Initial Treasury Deposit
    await query(
      `INSERT INTO society_treasury_ledger (
        society_id, transaction_code, transaction_type, amount, description, balance_after
      ) VALUES ($1, $2, 'TREASURY_DEPOSIT', $3, 'Initial Member Capital Contribution Deposited in Cooperative Bank', $3)`,
      [createdSociety.id, `TXN-INIT-${createdSociety.id}`, capital]
    );

    const token = generateToken(userRecord);

    return res.status(201).json({
      success: true,
      message: 'Society formation application submitted successfully. Applicant account created and unique tracking ID generated.',
      data: {
        society: createdSociety,
        tracking_id: trackingId,
        members_count: founding_members.length,
        timeline_stage: 7,
        next_step: 'Verification of documents and meeting with District Registrar of Cooperatives.',
        user: userRecord,
        token,
      },
    });
  } catch (err) {
    console.error('Register Society Error:', err);
    return res.status(500).json({ error: 'Failed to register society.', details: err.message });
  }
}

/**
 * GET /api/societies/track/:trackingId
 * Fetch full dossier, founding member list, and timeline progress
 */
async function getSocietyByTrackingId(req, res) {
  try {
    const { trackingId } = req.params;
    const socRes = await query('SELECT * FROM societies WHERE tracking_id = $1 OR society_code = $1', [trackingId]);

    if (socRes.rows.length === 0) {
      return res.status(404).json({ error: 'Society tracking record not found.' });
    }

    const society = socRes.rows[0];
    const membersRes = await query('SELECT * FROM society_founding_members WHERE society_id = $1 ORDER BY id ASC', [society.id]);
    const docsRes = await query('SELECT * FROM society_statutory_documents WHERE society_id = $1 ORDER BY id ASC', [society.id]);

    return res.json({
      success: true,
      data: {
        society,
        founding_members: membersRes.rows,
        statutory_documents: docsRes.rows,
      },
    });
  } catch (err) {
    console.error('Track Society Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve society tracking details.' });
  }
}

/**
 * GET /api/societies
 * Get list of all societies with filter options
 */
async function getSocietiesList(req, res) {
  try {
    let { district, status, nlcf, federation_id } = req.query;
    if (req.user?.admin_type === 'DCO_REGISTRAR' && req.user?.district) {
      district = req.user.district;
    }
    let sql = `
      SELECT s.*,
             c.name as federation_name,
             c.registration_number as federation_reg_no,
             (SELECT COUNT(*) FROM society_founding_members WHERE society_id = s.id) as founding_members_count,
             (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id) as total_docs_count,
             (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id AND verification_status = 'VERIFIED') as verified_docs_count
      FROM societies s
      LEFT JOIN cooperatives c ON s.federation_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (district && district !== 'ALL') {
      params.push(district);
      sql += ` AND LOWER(s.district) = LOWER($${params.length})`;
    }
    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND UPPER(s.status) = UPPER($${params.length})`;
    }
    if (federation_id) {
      params.push(parseInt(federation_id, 10));
      sql += ` AND s.federation_id = $${params.length}`;
    }
    if (nlcf !== undefined) {
      params.push(parseInt(nlcf, 10));
      sql += ` AND s.is_nlcf_affiliated = $${params.length}`;
    }

    sql += ' ORDER BY s.id ASC';
    const result = await query(sql, params);
    return res.json({ success: true, societies: result.rows });
  } catch (err) {
    console.error('Get Societies Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve societies.' });
  }
}

/**
 * GET /api/societies/federation-overview
 * Returns cooperative federations grouped by district, with their societies and worker statistics
 */
async function getFederationsOverview(req, res) {
  try {
    let { district } = req.query;
    if (req.user?.admin_type === 'DCO_REGISTRAR' && req.user?.district) {
      district = req.user.district;
    }
    let sql = 'SELECT * FROM cooperatives WHERE 1=1';
    const params = [];
    if (district && district !== 'ALL') {
      params.push(district);
      sql += ` AND district = $${params.length}`;
    }
    sql += ' ORDER BY id ASC';

    const fedResult = await query(sql, params);

    const federations = await Promise.all(
      fedResult.rows.map(async (fed) => {
        // Societies linked to this federation or district
        const socRes = await query(
          `SELECT s.*,
                  u.name as applicant_name, u.phone as applicant_phone, u.email as applicant_email,
                  (SELECT COUNT(*) FROM society_founding_members WHERE society_id = s.id) as founding_members_count,
                  (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id AND verification_status = 'VERIFIED') as verified_docs_count,
                  (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id) as total_docs_count
           FROM societies s
           LEFT JOIN users u ON s.created_by_user_id = u.id
           WHERE s.federation_id = $1 OR (s.federation_id IS NULL AND s.district = $2)
           ORDER BY s.id ASC`,
          [fed.id, fed.district]
        );

        // Fetch founding members & docs for full inspection in UI
        const societiesWithDetails = await Promise.all(
          socRes.rows.map(async (soc) => {
            const [membersRes, docsRes] = await Promise.all([
              query('SELECT * FROM society_founding_members WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
              query('SELECT * FROM society_statutory_documents WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
            ]);
            return {
              ...soc,
              founding_members: membersRes.rows || [],
              statutory_documents: docsRes.rows || [],
            };
          })
        );

        // Workers in this cooperative/federation
        const workersCountRes = await query(
          'SELECT COUNT(*) as count FROM workers WHERE cooperative_id = $1',
          [fed.id]
        );

        // DCO in charge of this district
        const dcoRes = await query(
          `SELECT id, name, email, phone, designation, district
           FROM users
           WHERE role = 'COOPERATIVE_ADMIN' AND admin_type = 'DCO_REGISTRAR' AND district = $1
           LIMIT 1`,
          [fed.district]
        );

        const societies = societiesWithDetails;
        const totalSocieties = societies.length;
        const activeSocieties = societies.filter((s) => s.status === 'ACTIVE').length;
        const pendingSocieties = societies.filter((s) => s.status === 'DCO_REVIEW' || s.status === 'SUBMITTED').length;
        const totalWorkers = parseInt(workersCountRes.rows[0]?.count || 0, 10);

        return {
          ...fed,
          dco: dcoRes.rows[0] || null,
          societies,
          stats: {
            totalSocieties,
            activeSocieties,
            pendingSocieties,
            totalWorkers,
          },
        };
      })
    );

    const totalFederations = federations.length;
    const totalSocietiesAll = federations.reduce((acc, f) => acc + f.stats.totalSocieties, 0);
    const activeSocietiesAll = federations.reduce((acc, f) => acc + f.stats.activeSocieties, 0);
    const pendingSocietiesAll = federations.reduce((acc, f) => acc + f.stats.pendingSocieties, 0);
    const totalWorkersAll = federations.reduce((acc, f) => acc + f.stats.totalWorkers, 0);

    return res.json({
      success: true,
      federations,
      summary: {
        totalFederations,
        totalSocieties: totalSocietiesAll,
        activeSocieties: activeSocietiesAll,
        pendingSocieties: pendingSocietiesAll,
        totalWorkers: totalWorkersAll,
      },
    });
  } catch (err) {
    console.error('Get Federations Overview Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve federations overview.' });
  }
}

/**
 * GET /api/societies/federations
 * Public endpoint to list regional federations (optionally filtered by district)
 */
async function getFederationsList(req, res) {
  try {
    const { district } = req.query;
    let sql = 'SELECT id, name, district, registration_number, contact_email, contact_phone, status FROM cooperatives WHERE 1=1';
    const params = [];

    if (district && district !== 'ALL') {
      params.push(district);
      sql += ` AND LOWER(district) = LOWER($${params.length})`;
    }

    sql += ' ORDER BY id ASC';
    const result = await query(sql, params);
    return res.json({ success: true, federations: result.rows });
  } catch (err) {
    console.error('Get Federations List Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve federations list.' });
  }
}

/**
 * POST /api/societies/federations
 * Apex Federation Head / State Body registers a new Regional Cooperative Federation
 */
async function createFederation(req, res) {
  try {
    const {
      name,
      district,
      city,
      address,
      contact_phone,
      contact_email,
      description,
      local_area,
      jurisdiction_zone,
      capital_reserve = 500000.0,
      cooperative_bank_name = 'District Central Cooperative Bank',
      bank_account_no,
      bank_ifsc,
    } = req.body;

    if (!name || !district) {
      return res.status(400).json({ error: 'Federation Name and District are required.' });
    }

    const year = new Date().getFullYear();
    const districtCode = district.toUpperCase().slice(0, 3);
    const randCode = Math.floor(100 + Math.random() * 900);
    const registrationNumber = `FED-${districtCode}-${year}-${randCode}`;

    const insertSql = `
      INSERT INTO cooperatives (
        name, registration_number, district, city, address,
        contact_phone, contact_email, description, local_area,
        jurisdiction_zone, status, dco_approval_status,
        capital_reserve, cooperative_bank_name, bank_account_no, bank_ifsc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE', 'APPROVED', $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await query(insertSql, [
      name,
      registrationNumber,
      district,
      city || district,
      address || `${district} Regional Cooperative Complex`,
      contact_phone || '0674-2540000',
      contact_email || `contact@${district.toLowerCase()}.coop.od.in`,
      description || `Regional Labour Cooperative Federation for ${district} district.`,
      local_area || `${district} Municipal & Rural Wards`,
      jurisdiction_zone || `${district} Zonal Jurisdiction`,
      parseFloat(capital_reserve) || 500000.0,
      cooperative_bank_name,
      bank_account_no || `COOP-${districtCode}-${randCode}001`,
      bank_ifsc || 'OSCB0001001',
    ]);

    return res.status(201).json({
      success: true,
      message: `Regional Cooperative Federation "${name}" registered successfully by the Apex Body! Registration No: ${registrationNumber}`,
      federation: result.rows[0],
    });
  } catch (err) {
    console.error('Create Federation Error:', err);
    return res.status(500).json({ error: 'Failed to create regional federation.' });
  }
}

/**
 * GET /api/societies/districts
 * List all operational districts (Public & Apex)
 */
async function getDistrictsList(req, res) {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM districts WHERE 1=1';
    const params = [];
    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND UPPER(status) = UPPER($${params.length})`;
    }
    sql += ' ORDER BY id ASC';
    const result = await query(sql, params);
    return res.json({ success: true, districts: result.rows });
  } catch (err) {
    console.error('Get Districts Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve operational districts.' });
  }
}

/**
 * POST /api/societies/districts
 * Apex Federation Head registers a new district where the portal is made operational
 */
async function createDistrict(req, res) {
  try {
    const {
      name,
      state = 'Odisha',
      headquarters,
      regional_zone,
      dco_office_name,
      dco_officer_name,
      nodal_phone,
      nodal_email,
      is_portal_active = 1,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'District name is required.' });
    }

    const trimmedName = name.trim();

    // Check if district already registered
    const existing = await query('SELECT id, name FROM districts WHERE LOWER(name) = LOWER($1)', [trimmedName]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `District "${trimmedName}" is already registered in the operational directory.` });
    }

    const insertSql = `
      INSERT INTO districts (
        name, state, headquarters, regional_zone, status,
        dco_office_name, dco_officer_name, nodal_phone, nodal_email, is_portal_active
      ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(insertSql, [
      trimmedName,
      state || 'Odisha',
      headquarters || trimmedName,
      regional_zone || `${trimmedName} Regional Zone`,
      dco_office_name || `${trimmedName} District Cooperative Office`,
      dco_officer_name || `District Cooperative Officer (${trimmedName})`,
      nodal_phone || '0674-2540000',
      nodal_email || `dco.${trimmedName.toLowerCase()}@coop.od.in`,
      is_portal_active ? 1 : 0,
    ]);

    // Also auto-create a default primary society & regional federation so workers & citizens can immediately book
    const districtCode = trimmedName.toUpperCase().slice(0, 3);
    const year = new Date().getFullYear();
    const fedName = `${trimmedName} District Labour Cooperative Federation`;
    const fedRegNo = `FED-${districtCode}-${year}-001`;

    await query(`
      INSERT INTO cooperatives (
        name, registration_number, district, city, address,
        status, dco_approval_status, capital_reserve, cooperative_bank_name
      ) VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'APPROVED', 500000.0, 'District Central Cooperative Bank')
      ON CONFLICT (registration_number) DO NOTHING;
    `, [fedName, fedRegNo, trimmedName, headquarters || trimmedName, `${trimmedName} Main Cooperative Bhavan`]);

    const fedRes = await query('SELECT id FROM cooperatives WHERE registration_number = $1', [fedRegNo]);
    const fedId = fedRes.rows[0]?.id || null;

    const socName = `${trimmedName} Shramik Seva Sahakari Samiti`;
    const socCode = `SOC-${districtCode}-${year}-001`;
    const trackId = `SS-SOC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    await query(`
      INSERT INTO societies (
        name, society_code, tracking_id, registered_email, district, city, address,
        status, timeline_stage, federation_id, is_nlcf_affiliated, initial_capital_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 9, $8, 1, 25000.0)
      ON CONFLICT DO NOTHING;
    `, [socName, socCode, trackId, `contact@${trimmedName.toLowerCase()}.coop.od.in`, trimmedName, headquarters || trimmedName, `Cooperative Bhavan, ${trimmedName}`, fedId]);

    return res.status(201).json({
      success: true,
      message: `District "${trimmedName}" successfully registered & enabled for online portal services! Primary cooperative and federation infrastructure initialized.`,
      district: result.rows[0],
    });
  } catch (err) {
    console.error('Create District Error:', err);
    return res.status(500).json({ error: 'Failed to register operational district.' });
  }
}

/**
 * PATCH /api/societies/districts/:id/toggle
 * Toggle portal availability for a district
 */
async function toggleDistrictPortal(req, res) {
  try {
    const { id } = req.params;
    const { is_portal_active, status } = req.body;
    const updates = [];
    const params = [id];

    if (is_portal_active !== undefined) {
      params.push(is_portal_active ? 1 : 0);
      updates.push(`is_portal_active = $${params.length}`);
    }
    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await query(
      `UPDATE districts SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'District not found.' });
    }

    return res.json({
      success: true,
      message: `District "${result.rows[0].name}" portal availability updated.`,
      district: result.rows[0],
    });
  } catch (err) {
    console.error('Toggle District Error:', err);
    return res.status(500).json({ error: 'Failed to update district status.' });
  }
}

/**
 * PATCH /api/societies/:id/timeline
 * Advance timeline stage for recognized / formed society (Page 1)
 */
async function updateSocietyTimelineStage(req, res) {
  try {
    const { id } = req.params;
    const { stage, is_nlcf_affiliated, dco_linked, ncct_training_completed, ministry_recognized } = req.body;

    const updates = [];
    const params = [id];

    if (stage !== undefined) {
      params.push(stage);
      updates.push(`timeline_stage = $${params.length}`);
      if (stage === 9) {
        updates.push("status = 'ACTIVE'");
      }
    }
    if (is_nlcf_affiliated !== undefined) {
      params.push(is_nlcf_affiliated ? 1 : 0);
      updates.push(`is_nlcf_affiliated = $${params.length}`);
      if (is_nlcf_affiliated) {
        updates.push("audit_frequency = 'HALF_YEARLY'");
        updates.push("nlcf_certificate_no = 'LCF-CERT-2026-" + Math.floor(1000 + Math.random() * 9000) + "'");
        updates.push("nlcf_affiliation_date = CURRENT_DATE::text");
      }
    }
    if (dco_linked !== undefined) {
      params.push(dco_linked ? 1 : 0);
      updates.push(`dco_linked = $${params.length}`);
    }
    if (ncct_training_completed !== undefined) {
      params.push(ncct_training_completed ? 1 : 0);
      updates.push(`ncct_training_completed = $${params.length}`);
    }
    if (ministry_recognized !== undefined) {
      params.push(ministry_recognized ? 1 : 0);
      updates.push(`ministry_recognized = $${params.length}`);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE societies SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await query(sql, params);

    return res.json({
      success: true,
      message: 'Society statutory timeline updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Update Society Timeline Error:', err);
    return res.status(500).json({ error: 'Failed to update society timeline.' });
  }
}

/**
 * GET /api/societies/pending/dco
 * List pending society registrations for the logged-in DCO / Registrar
 */
async function getPendingSocietiesForDco(req, res) {
  try {
    const userDistrict = req.user.district;
    const isStatewide = req.user.admin_type === 'FEDERATION_HEAD';

    let sql = `
      SELECT s.*, 
             u.name as applicant_name, u.phone as applicant_phone, u.email as applicant_email,
             (SELECT COUNT(*) FROM society_founding_members WHERE society_id = s.id) as founding_members_count,
             (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id AND verification_status = 'VERIFIED') as verified_docs_count,
             (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id) as total_docs_count
      FROM societies s
      LEFT JOIN users u ON s.created_by_user_id = u.id
      WHERE s.status IN ('SUBMITTED', 'DCO_REVIEW')
    `;
    const params = [];

    if (!isStatewide && userDistrict) {
      params.push(userDistrict);
      sql += ` AND s.district = $${params.length}`;
    }

    sql += ' ORDER BY s.id DESC';
    const result = await query(sql, params);

    // Eagerly attach 10 founding members and 6 statutory documents for comprehensive audit
    const societiesWithDetails = await Promise.all(
      result.rows.map(async (soc) => {
        const [membersRes, docsRes] = await Promise.all([
          query('SELECT * FROM society_founding_members WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
          query('SELECT * FROM society_statutory_documents WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
        ]);
        return {
          ...soc,
          founding_members: membersRes.rows || [],
          statutory_documents: docsRes.rows || [],
        };
      })
    );

    // Also fetch approved / registered societies in this district (or statewide) for directory & certificate view
    let approvedSql = `
      SELECT s.*,
             u.name as applicant_name, u.phone as applicant_phone, u.email as applicant_email,
             (SELECT COUNT(*) FROM society_founding_members WHERE society_id = s.id) as founding_members_count,
             (SELECT COUNT(*) FROM society_statutory_documents WHERE society_id = s.id) as total_docs_count
      FROM societies s
      LEFT JOIN users u ON s.created_by_user_id = u.id
      WHERE s.status = 'ACTIVE'
    `;
    const approvedParams = [];
    if (!isStatewide && userDistrict) {
      approvedParams.push(userDistrict);
      approvedSql += ` AND s.district = $${approvedParams.length}`;
    }
    approvedSql += ' ORDER BY s.id DESC';
    const approvedResult = await query(approvedSql, approvedParams);

    const approvedSocietiesWithDetails = await Promise.all(
      approvedResult.rows.map(async (soc) => {
        const [membersRes, docsRes] = await Promise.all([
          query('SELECT * FROM society_founding_members WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
          query('SELECT * FROM society_statutory_documents WHERE society_id = $1 ORDER BY id ASC', [soc.id]),
        ]);
        return {
          ...soc,
          founding_members: membersRes.rows || [],
          statutory_documents: docsRes.rows || [],
        };
      })
    );

    // Fetch regulatory inquiries for this district
    let inqSql = 'SELECT * FROM society_regulatory_inquiries WHERE 1=1';
    const inqParams = [];
    if (!isStatewide && userDistrict) {
      inqParams.push(userDistrict);
      inqSql += ` AND district = $${inqParams.length}`;
    }
    inqSql += ' ORDER BY id DESC';
    const inqResult = await query(inqSql, inqParams);

    // Calculate DCO stats
    const totalCapitalAudited = [...societiesWithDetails, ...approvedSocietiesWithDetails].reduce(
      (acc, s) => acc + (parseFloat(s.initial_capital_balance) || 10000),
      0
    );

    const totalReserveFundAudited = [...societiesWithDetails, ...approvedSocietiesWithDetails].reduce(
      (acc, s) => acc + (parseFloat(s.reserve_fund_balance) || 0),
      0
    );

    const totalMembersAudited = [...societiesWithDetails, ...approvedSocietiesWithDetails].reduce(
      (acc, s) => acc + (parseInt(s.founding_members_count, 10) || 10),
      0
    );

    return res.json({
      success: true,
      societies: societiesWithDetails,
      approvedSocieties: approvedSocietiesWithDetails,
      regulatoryInquiries: inqResult.rows || [],
      stats: {
        pendingCount: societiesWithDetails.length,
        approvedCount: approvedSocietiesWithDetails.length,
        totalMembersAudited,
        totalCapitalAudited,
        totalReserveFundAudited,
      },
      dcoDistrict: userDistrict,
      isStatewide,
    });
  } catch (err) {
    console.error('Get Pending DCO Societies Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve pending societies.' });
  }
}

/**
 * POST /api/societies/:id/dco-review
 * DCO Registrar conducts review and approves / certifies society
 */
async function dcoReviewSociety(req, res) {
  try {
    const { id } = req.params;
    const { action, review_notes } = req.body; // action: 'APPROVE' | 'REQUEST_CLARIFICATION' | 'REJECT'

    const socRes = await query('SELECT * FROM societies WHERE id = $1', [id]);
    if (socRes.rows.length === 0) {
      return res.status(404).json({ error: 'Society not found.' });
    }

    const society = socRes.rows[0];
    const isStatewide = req.user.admin_type === 'FEDERATION_HEAD';
    const userDistrict = req.user.district;

    // Statutory Jurisdiction Guard: DCO can only approve/review societies in their own district
    if (!isStatewide && userDistrict && society.district !== userDistrict) {
      return res.status(403).json({
        error: 'Jurisdiction Restriction',
        message: `You are the DCO for ${userDistrict} and can only review societies within your statutory district jurisdiction. This society belongs to ${society.district}.`,
      });
    }

    const officerName = req.user.name || 'District Cooperative Officer & Registrar';
    const dcoOffice = `${society.district} District Cooperative Office`;

    if (action === 'APPROVE') {
      const regYear = new Date().getFullYear();
      const regRand = Math.floor(1000 + Math.random() * 9000);
      const registrationNumber = `REG-OD-${regYear}-${regRand}`;

      // Update Society to ACTIVE, Stage 9, dco_linked = 1, approved
      const updated = await query(
        `UPDATE societies SET
          status = 'ACTIVE',
          timeline_stage = 9,
          registration_number = $1,
          dco_linked = 1,
          dco_officer_name = $2,
          dco_office_name = $3,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [registrationNumber, officerName, dcoOffice, id]
      );

      // Synchronize Federation/Society row in cooperatives table (Federation and Society are the same entity)
      const dcoOrderNo = `DCO/${society.district.toUpperCase().slice(0, 3)}/REG-${regYear}/${regRand}`;
      if (society.federation_id) {
        await query(
          `UPDATE cooperatives SET
            status = 'ACTIVE',
            dco_approval_status = 'APPROVED',
            dco_approved_at = CURRENT_TIMESTAMP,
            dco_order_number = $1,
            dco_officer_name = $2,
            dco_office_name = $3,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [dcoOrderNo, officerName, dcoOffice, society.federation_id]
        );
      }

      // Verify all statutory documents
      await query(
        `UPDATE society_statutory_documents 
         SET verification_status = 'VERIFIED', verified_by_officer = $1, verified_at = CURRENT_TIMESTAMP 
         WHERE society_id = $2`,
        [officerName, id]
      );

      return res.json({
        success: true,
        message: `Society "${society.name}" verified and legally certified by District Registrar! Registration Number: ${registrationNumber}. Society is now Eligible on Sevasetu.`,
        data: updated.rows[0],
      });
    } else if (action === 'NLCF_AFFILIATE') {
      const regYear = new Date().getFullYear();
      const certRand = Math.floor(1000 + Math.random() * 9000);
      const certCode = `LCF-CERT-${regYear}-${certRand}`;

      const updated = await query(
        `UPDATE societies SET
          is_nlcf_affiliated = 1,
          nlcf_certificate_no = $1,
          nlcf_affiliation_date = CURRENT_TIMESTAMP,
          ministry_recognized = 1,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [certCode, id]
      );

      return res.json({
        success: true,
        message: `Society "${society.name}" formally affiliated with National Labour Cooperative Federation! State Certificate: ${certCode}.`,
        data: updated.rows[0],
      });
    } else if (action === 'REQUEST_CLARIFICATION') {
      const updated = await query(
        `UPDATE societies SET
          status = 'DCO_REVIEW',
          timeline_stage = 7,
          dco_officer_name = $1,
          dco_office_name = $2,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [officerName, dcoOffice, id]
      );

      return res.json({
        success: true,
        message: 'Clarification requested from applicant. Case placed under DCO Review.',
        data: updated.rows[0],
      });
    } else {
      const updated = await query(
        `UPDATE societies SET
          status = 'REJECTED',
          dco_officer_name = $1,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [officerName, id]
      );

      return res.json({
        success: true,
        message: 'Application rejected by District Registrar.',
        data: updated.rows[0],
      });
    }
  } catch (err) {
    console.error('DCO Review Society Error:', err);
    return res.status(500).json({ error: 'Failed to process DCO review.' });
  }
}

/**
 * PATCH /api/societies/:id/audit
 * DCO updates society statutory audit classification and reserve fund status
 */
async function updateSocietyAudit(req, res) {
  try {
    const { id } = req.params;
    const { audit_grade, annual_return_status, reserve_fund_balance } = req.body;
    const userDistrict = req.user.district;

    const socRes = await query('SELECT * FROM societies WHERE id = $1', [id]);
    if (socRes.rows.length === 0) return res.status(404).json({ error: 'Society not found.' });

    if (req.user.admin_type === 'DCO_REGISTRAR' && socRes.rows[0].district !== userDistrict) {
      return res.status(403).json({ error: 'Unauthorized: Society is outside your district jurisdiction.' });
    }

    const updated = await query(
      `UPDATE societies SET
        audit_grade = COALESCE($1, audit_grade),
        annual_return_status = COALESCE($2, annual_return_status),
        reserve_fund_balance = COALESCE($3, reserve_fund_balance),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [audit_grade, annual_return_status, reserve_fund_balance, id]
    );

    return res.json({
      success: true,
      message: `Audit compliance updated for ${socRes.rows[0].name}.`,
      data: updated.rows[0],
    });
  } catch (err) {
    console.error('Update Society Audit Error:', err);
    return res.status(500).json({ error: 'Failed to update audit compliance.' });
  }
}

/**
 * PATCH /api/societies/:id/governance
 * DCO updates society AGM date, committee term, and election status
 */
async function updateSocietyGovernance(req, res) {
  try {
    const { id } = req.params;
    const { last_agm_date, committee_term_end } = req.body;
    const userDistrict = req.user.district;

    const socRes = await query('SELECT * FROM societies WHERE id = $1', [id]);
    if (socRes.rows.length === 0) return res.status(404).json({ error: 'Society not found.' });

    if (req.user.admin_type === 'DCO_REGISTRAR' && socRes.rows[0].district !== userDistrict) {
      return res.status(403).json({ error: 'Unauthorized: Society is outside your district jurisdiction.' });
    }

    const updated = await query(
      `UPDATE societies SET
        last_agm_date = COALESCE($1, last_agm_date),
        committee_term_end = COALESCE($2, committee_term_end),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [last_agm_date, committee_term_end, id]
    );

    return res.json({
      success: true,
      message: `Governance mandate updated for ${socRes.rows[0].name}.`,
      data: updated.rows[0],
    });
  } catch (err) {
    console.error('Update Society Governance Error:', err);
    return res.status(500).json({ error: 'Failed to update governance mandate.' });
  }
}

/**
 * POST /api/societies/inquiries
 * DCO issues statutory inquiry notice or hearing summons under Sec 65/68
 */
async function createOrUpdateInquiry(req, res) {
  try {
    const { society_id, section, title, complainant, respondent, status, next_hearing_date, dco_remarks } = req.body;
    const district = req.user.district || 'Khordha';
    const caseRand = Math.floor(100 + Math.random() * 900);
    const secCode = section === 'SECTION_65' ? 'SEC65' : section === 'SECTION_67' ? 'SEC67' : 'SEC68';
    const case_number = `${secCode}-${district.slice(0, 3).toUpperCase()}-2026-${caseRand}`;

    const inserted = await query(
      `INSERT INTO society_regulatory_inquiries 
       (society_id, district, case_number, section, title, complainant, respondent, status, next_hearing_date, dco_remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [society_id, district, case_number, section || 'SECTION_68', title, complainant, respondent, status || 'HEARING_SCHEDULED', next_hearing_date || null, dco_remarks]
    );

    return res.json({
      success: true,
      message: `Statutory proceeding recorded: ${case_number}`,
      data: inserted.rows[0],
    });
  } catch (err) {
    console.error('Create Regulatory Inquiry Error:', err);
    return res.status(500).json({ error: 'Failed to record statutory proceeding.' });
  }
}

module.exports = {
  registerSociety,
  getSocietyByTrackingId,
  getSocietiesList,
  getFederationsList,
  createFederation,
  getDistrictsList,
  createDistrict,
  toggleDistrictPortal,
  getFederationsOverview,
  updateSocietyTimelineStage,
  getPendingSocietiesForDco,
  dcoReviewSociety,
  updateSocietyAudit,
  updateSocietyGovernance,
  createOrUpdateInquiry,
};


