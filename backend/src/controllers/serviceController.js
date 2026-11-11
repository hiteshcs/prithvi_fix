const { query } = require('../db/connection');

// Statutory Local Area Cooperative Tariff Multipliers
// Allows subtle, transparent location-based pricing variations across districts & municipal wards
const AREA_TARIFF_CONFIG = [
  // Khordha District
  { id: 1, society_id: 1, name: 'Saheed Nagar / Master Canteen', district: 'Khordha', city: 'Bhubaneswar', pincode: '751001', multiplier: 1.04, label: 'Central Urban (+4%)', tag: 'High Commercial Traffic' },
  { id: 2, society_id: 2, name: 'Khandagiri / Aiginia', district: 'Khordha', city: 'Bhubaneswar', pincode: '751030', multiplier: 1.00, label: 'Standard Base Rate (0%)', tag: 'Suburban Residential' },
  { id: 3, society_id: 3, name: 'Old Town / Lingaraj Heritage', district: 'Khordha', city: 'Bhubaneswar', pincode: '751002', multiplier: 1.03, label: 'Heritage Conservation (+3%)', tag: 'Narrow Lane & Heritage Restorations' },
  { id: 4, society_id: 4, name: 'Patia / Infocity IT Corridor', district: 'Khordha', city: 'Bhubaneswar', pincode: '751024', multiplier: 1.06, label: 'IT High-Rise Corridor (+6%)', tag: 'Multi-Story & Modern Gadgets' },

  // Cuttack District
  { id: 5, society_id: 5, name: 'Badambadi / Ranihat', district: 'Cuttack', city: 'Cuttack', pincode: '753012', multiplier: 1.00, label: 'Commercial Base Rate (0%)', tag: 'Trade & Wholesale Zone' },
  { id: 6, society_id: 6, name: 'Madhupatna / OMP / Jagatpur', district: 'Cuttack', city: 'Cuttack', pincode: '753010', multiplier: 0.98, label: 'Industrial Artisan (-2%)', tag: 'High-Volume Fabrication Hub' },
  { id: 7, society_id: 7, name: 'CDA Sectors 1-14 / Cantonment', district: 'Cuttack', city: 'Cuttack', pincode: '753014', multiplier: 1.04, label: 'Planned Urban (+4%)', tag: 'Gated Societies & High-Rises' },
  { id: 8, society_id: 8, name: 'Silver City / Buxi Bazar', district: 'Cuttack', city: 'Cuttack', pincode: '753001', multiplier: 1.02, label: 'Heritage Artisan Guild (+2%)', tag: 'Traditional Craft Precinct' },

  // Puri District
  { id: 9, society_id: 9, name: 'Grand Road / VIP Road', district: 'Puri', city: 'Puri', pincode: '752002', multiplier: 1.02, label: 'Pilgrim Corridor (+2%)', tag: 'High Pilgrim Density' },
  { id: 10, society_id: 10, name: 'Konark Sun Coast / Marine Drive', district: 'Puri', city: 'Konark', pincode: '752111', multiplier: 1.03, label: 'Eco-Tourism Coast (+3%)', tag: 'Resort & Solar Maintenance' },
  { id: 11, society_id: 11, name: 'Sea Beach Road / Baliapanda', district: 'Puri', city: 'Puri', pincode: '752001', multiplier: 1.05, label: 'Coastal Anti-Corrosive (+5%)', tag: 'High Saline & Rust Mitigation' },
  { id: 12, society_id: 12, name: 'Brahmagiri / Satapada / Chilika', district: 'Puri', city: 'Brahmagiri', pincode: '752001', multiplier: 0.96, label: 'Grassroots Subsidized (-4%)', tag: 'Rural Agro-Maritime Subsidy' },
];

function calculateAreaPrice(basePrice, priceUnit, multiplier) {
  if (priceUnit === 'per_sqft') {
    return Math.max(1, Math.round(basePrice * multiplier));
  }
  // Round fixed services to nearest ₹5 for clean currency amounts
  return Math.round((basePrice * multiplier) / 5) * 5;
}

/**
 * GET /api/services/locations
 * Returns list of supported local areas and their cooperative tariff multipliers
 */
async function getServiceLocations(req, res) {
  try {
    const { district } = req.query;
    let locations = AREA_TARIFF_CONFIG;
    if (district && district !== 'ALL') {
      locations = locations.filter((loc) => loc.district.toLowerCase() === district.toLowerCase());
    }
    res.json({ locations });
  } catch (err) {
    console.error('Get service locations error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch service locations.' });
  }
}

/**
 * GET /api/services
 * List all active services, grouped by category, with dynamic area-specific pricing.
 */
async function getServices(req, res) {
  try {
    const { district, society_id, area_id } = req.query;
    let workerFilter = '';
    const params = [];

    if (district && district !== 'ALL') {
      params.push(district);
      workerFilter += ` AND (u.district = $${params.length} OR w.service_area ILIKE '%' || $${params.length} || '%')`;
    }

    const selectedSocId = society_id ? parseInt(society_id, 10) : (area_id ? parseInt(area_id, 10) : null);
    if (selectedSocId && !isNaN(selectedSocId)) {
      params.push(selectedSocId);
      workerFilter += ` AND w.society_id = $${params.length}`;
    }

    const sql = `
      SELECT s.*, 
        CAST(
          (SELECT COUNT(DISTINCT ws.worker_id) 
           FROM worker_skills ws 
           JOIN skills sk ON ws.skill_id = sk.id 
           JOIN workers w ON ws.worker_id = w.id
           JOIN users u ON w.user_id = u.id
           WHERE sk.category = s.category 
           AND w.verification_status = 'VERIFIED'
           AND w.availability IN ('AVAILABLE', 'BUSY')
           ${workerFilter}
          ) AS INTEGER
        ) as available_workers
      FROM services s
      WHERE s.is_active = 1
      ORDER BY s.category, s.name
    `;

    const result = await query(sql, params);

    // Resolve location and tariff multiplier
    let activeLocation = null;
    let multiplier = 1.0;
    if (selectedSocId) {
      activeLocation = AREA_TARIFF_CONFIG.find((l) => l.society_id === selectedSocId || l.id === selectedSocId);
      if (activeLocation) multiplier = activeLocation.multiplier;
    } else if (district && district !== 'ALL') {
      // Default district index if no specific local society selected
      if (district.toLowerCase() === 'khordha') multiplier = 1.03;
      else if (district.toLowerCase() === 'cuttack') multiplier = 1.01;
      else if (district.toLowerCase() === 'puri') multiplier = 1.02;
    }

    const formattedServices = result.rows.map((s) => {
      const calculatedPrice = calculateAreaPrice(s.base_price, s.price_unit, multiplier);
      const priceDiff = calculatedPrice - s.base_price;
      const workerWage = Math.round(calculatedPrice * 0.93);
      const welfareFund = Math.round(calculatedPrice * 0.02);
      const societyFund = calculatedPrice - workerWage - welfareFund;

      return {
        ...s,
        base_price: s.base_price,
        price: calculatedPrice,
        price_diff: priceDiff,
        area_multiplier: multiplier,
        area_label: activeLocation?.label || (multiplier !== 1.0 ? `${multiplier > 1 ? '+' : ''}${Math.round((multiplier - 1) * 100)}% District Tariff` : 'Standard Base Tariff'),
        area_tag: activeLocation?.tag || null,
        worker_wage: workerWage,
        welfare_fund: welfareFund,
        society_fund: societyFund,
      };
    });

    res.json({
      services: formattedServices,
      district: district || 'ALL',
      society_id: selectedSocId || null,
      locations: AREA_TARIFF_CONFIG,
      selected_location: activeLocation || null,
    });
  } catch (err) {
    console.error('Get services error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch services.' });
  }
}

/**
 * GET /api/services/:id
 * Get service detail with available workers.
 */
async function getServiceById(req, res) {
  try {
    const serviceRes = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    const service = serviceRes.rows[0];

    if (!service) {
      return res.status(404).json({ error: 'Not Found', message: 'Service not found.' });
    }

    // Get workers who have skills in this service category
    const workersRes = await query(`
      SELECT DISTINCT w.id, w.worker_code, w.experience_years, w.service_area, 
             w.verification_status, w.availability, w.rating, w.total_reviews,
             w.total_jobs_completed, w.bio,
             u.name, u.phone, u.district, u.city,
             c.name as cooperative_name
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN cooperatives c ON w.cooperative_id = c.id
      JOIN worker_skills ws ON ws.worker_id = w.id
      JOIN skills sk ON ws.skill_id = sk.id
      WHERE sk.category = $1
      AND w.verification_status = 'VERIFIED'
      AND u.is_active = 1
      ORDER BY w.rating DESC, w.total_jobs_completed DESC
    `, [service.category]);

    res.json({ service, workers: workersRes.rows });
  } catch (err) {
    console.error('Get service detail error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch service details.' });
  }
}

/**
 * GET /api/services/rate-card
 * Regulated 93-2-5 Rate Card with Spare Parts and Capped Labour.
 */
async function getRateCard(req, res) {
  try {
    const rateCard = {
      model: {
        name: 'Cooperative 93-2-5 Statutory Tariff Model',
        artisanShare: 93,
        platformFee: 2,
        welfareFund: 5,
        labourCapNotice: 'Labour Charges are regulated by the Federation and capped at ₹199–₹399 per appliance (vs ₹499 on commercial apps). All prices include standardized ISI spare parts with zero conveyance surcharge.',
        savingsNotice: 'Cooperative tariffs are 20% to 35% more affordable than private aggregator apps because there is zero middleman agency commission or surge pricing.'
      },
      protectionCover: {
        badge: 'Prithvi Fix Suraksha',
        title: 'End-to-End Service Protection',
        cards: [
          {
            id: 'warranty',
            title: '30-Day Workmanship Warranty',
            subtitle: 'Free repairs if the same issue arises',
            points: [
              'Free re-repairs at ₹0 labour fee if the same issue arises within 30 days',
              'One-click hassle-free dispatch claims directly from your dashboard',
              'Up to ₹10,000 protection cover if anything is damaged during the repair'
            ]
          },
          {
            id: 'verification',
            title: 'Expert Verified Repair Quotes',
            subtitle: 'Pre-validated against statutory locked matrix',
            points: [
              'Every repair quote shared by the professional is strictly verified',
              'Standardized ISI parts price matrix prevents overcharging',
              'If you are still unsure, ask a Senior Master Artisan for a free second opinion'
            ]
          },
          {
            id: 'ratecard',
            title: 'Regulated Fixed Rate Card',
            subtitle: 'Standardized cooperative tariffs with zero surge',
            points: [
              'All tariffs are officially decided based on cooperative statutory standards',
              'Zero surge pricing during rains, emergency hours, or holidays',
              'If you are charged differently from the rate card, reach out to our grievance desk with 1-click refund'
            ]
          }
        ]
      }
    };

    res.json(rateCard);
  } catch (err) {
    console.error('Get rate card error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch rate card.' });
  }
}

module.exports = { getServices, getServiceById, getRateCard, getServiceLocations, AREA_TARIFF_CONFIG };
