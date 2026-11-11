const { query } = require('../db/connection');

// Standard Haversine Distance Calculation (km)
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Estimated Transit Time in Minutes (average urban dispatch speed 25 km/h + 4 min prep)
function calculateEtaMinutes(distanceKm) {
  if (distanceKm == null) return 15;
  const travelMins = Math.round((distanceKm / 25) * 60) + 4;
  return Math.max(8, travelMins);
}

// Generate realistic simulated road route waypoints between worker & customer
function generateRouteWaypoints(startLat, startLng, endLat, endLng) {
  if (!startLat || !startLng || !endLat || !endLng) return [];
  const points = [];
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const factor = i / steps;
    const curveOffset = Math.sin(factor * Math.PI) * 0.0035 * (i % 2 === 0 ? 1 : -0.8);
    const lat = startLat + (endLat - startLat) * factor + curveOffset;
    const lng = startLng + (endLng - startLng) * factor + curveOffset * 0.7;
    points.push({ lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 });
  }
  return points;
}

// Locality Reference Coordinates in India
const ODISHA_LOCALITY_COORDS = {
  patia: { lat: 20.3540, lng: 85.8170, name: 'Patia / KIIT Corridor' },
  'jaydev vihar': { lat: 20.2961, lng: 85.8245, name: 'Jaydev Vihar' },
  nayapalli: { lat: 20.2850, lng: 85.8020, name: 'Nayapalli' },
  'saheed nagar': { lat: 20.2870, lng: 85.8450, name: 'Saheed Nagar' },
  rasulgarh: { lat: 20.3095, lng: 85.8530, name: 'Rasulgarh Hub' },
  mancheswar: { lat: 20.3240, lng: 85.8380, name: 'Mancheswar Industrial' },
  chandrasekharpur: { lat: 20.3350, lng: 85.8100, name: 'Chandrasekharpur' },
  infocity: { lat: 20.3470, lng: 85.8200, name: 'Infocity BBSR' },
  baramunda: { lat: 20.2750, lng: 85.8100, name: 'Baramunda Bus Stand' },
  khandagiri: { lat: 20.2570, lng: 85.7750, name: 'Khandagiri' },
  aiginia: { lat: 20.2650, lng: 85.8450, name: 'Aiginia' },
  dumduma: { lat: 20.2730, lng: 85.8380, name: 'Dumduma' },
  'vss nagar': { lat: 20.2920, lng: 85.8350, name: 'VSS Nagar' },
  'college square': { lat: 20.4625, lng: 85.8830, name: 'College Square, Cuttack' },
  bidanasi: { lat: 20.4890, lng: 85.8770, name: 'Bidanasi, Cuttack' },
  tulsipur: { lat: 20.4650, lng: 85.8880, name: 'Tulsipur, Cuttack' },
  'link road': { lat: 20.4700, lng: 85.8800, name: 'Link Road, Cuttack' },
  cuttack: { lat: 20.4625, lng: 85.8830, name: 'Cuttack Metro' },
  puri: { lat: 19.8135, lng: 85.8312, name: 'Puri Coastal' },
  balighai: { lat: 19.8250, lng: 85.8450, name: 'Balighai, Puri' },
  penthakata: { lat: 19.7980, lng: 85.8210, name: 'Penthakata, Puri' },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar Capital Center' },
  khordha: { lat: 20.1810, lng: 85.6170, name: 'Khordha District' },
};

/**
 * POST /api/matching/recommend
 * Phase 3: Smart Geo-Location Matching Engine with Haversine Proximity, Schedule Slot Collision Detection & Live Route Mapping.
 */
async function recommendWorkers(req, res) {
  try {
    const { serviceId, trade, category, district, city, address, scheduledDate, scheduledTime, isEmergency } = req.body;

    let service = null;
    let targetCategory = category || trade || null;

    if (serviceId) {
      const sRes = await query('SELECT * FROM services WHERE id = $1', [serviceId]);
      service = sRes.rows[0] || null;
      if (service && !targetCategory) {
        targetCategory = service.category;
      }
    }

    // Clean up category string (e.g., remove 'cat' prefix if present)
    if (targetCategory && targetCategory.startsWith('cat')) {
      targetCategory = targetCategory.replace(/^cat/, '');
    }

    // 1. Resolve Customer Coordinates
    let customerLat = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let customerLng = req.body.longitude ? parseFloat(req.body.longitude) : null;

    if (!customerLat || !customerLng) {
      const searchStr = `${address || ''} ${city || ''} ${district || ''}`.toLowerCase();
      for (const [key, coords] of Object.entries(ODISHA_LOCALITY_COORDS)) {
        if (searchStr.includes(key)) {
          customerLat = coords.lat;
          customerLng = coords.lng;
          break;
        }
      }
      if (!customerLat) {
        customerLat = 20.2961;
        customerLng = 85.8245; // Default Bhubaneswar
      }
    }

    let workersRes;
    let queryParams = [];

    if (targetCategory && targetCategory !== 'Emergency Services' && targetCategory !== 'ALL') {
      // Strictly query workers possessing skills in this trade / category
      queryParams = [targetCategory, `%${targetCategory}%`];
      workersRes = await query(`
        SELECT w.id, w.worker_code, w.experience_years, w.service_area,
               w.verification_status, w.availability, w.rating, w.total_reviews,
               w.total_jobs_completed, w.bio, w.latitude, w.longitude,
               w.tier, w.merit_points, w.strike_count, w.primary_trade,
               u.name, u.phone, u.district, u.city, u.avatar_url,
               c.name as cooperative_name
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN cooperatives c ON w.cooperative_id = c.id
        WHERE w.verification_status = 'VERIFIED' AND w.toolkit_compliance = 'VERIFIED_EQUIPPED'
        AND (u.is_active = 1 OR u.is_active IS NULL)
        AND EXISTS (
          SELECT 1 FROM worker_skills ws
          JOIN skills s ON ws.skill_id = s.id
          WHERE ws.worker_id = w.id
          AND (s.category ILIKE $1 OR s.name ILIKE $2)
        )
        ORDER BY w.rating DESC, w.experience_years DESC
      `, queryParams);
    } else if (targetCategory === 'Emergency Services') {
      // For emergency, query priority emergency trades (Electrical, Plumbing, Appliance Repair)
      workersRes = await query(`
        SELECT w.id, w.worker_code, w.experience_years, w.service_area,
               w.verification_status, w.availability, w.rating, w.total_reviews,
               w.total_jobs_completed, w.bio, w.latitude, w.longitude,
               w.tier, w.merit_points, w.strike_count, w.primary_trade,
               u.name, u.phone, u.district, u.city, u.avatar_url,
               c.name as cooperative_name
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN cooperatives c ON w.cooperative_id = c.id
        WHERE w.verification_status = 'VERIFIED' AND w.toolkit_compliance = 'VERIFIED_EQUIPPED'
        AND (u.is_active = 1 OR u.is_active IS NULL)
        AND EXISTS (
          SELECT 1 FROM worker_skills ws
          JOIN skills s ON ws.skill_id = s.id
          WHERE ws.worker_id = w.id
          AND (s.category ILIKE 'Electrical' OR s.category ILIKE 'Plumbing' OR s.category ILIKE 'Appliance Repair')
        )
        ORDER BY w.rating DESC, w.experience_years DESC
      `);
    } else {
      // General worker query
      workersRes = await query(`
        SELECT w.id, w.worker_code, w.experience_years, w.service_area,
               w.verification_status, w.availability, w.rating, w.total_reviews,
               w.total_jobs_completed, w.bio, w.latitude, w.longitude,
               w.tier, w.merit_points, w.strike_count, w.primary_trade,
               u.name, u.phone, u.district, u.city, u.avatar_url,
               c.name as cooperative_name
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN cooperatives c ON w.cooperative_id = c.id
        WHERE w.verification_status = 'VERIFIED' AND w.toolkit_compliance = 'VERIFIED_EQUIPPED'
        AND (u.is_active = 1 OR u.is_active IS NULL)
        ORDER BY w.rating DESC, w.experience_years DESC
      `);
    }

    let workers = workersRes.rows;

    // Attach skills and check schedule slot conflict for each worker
    for (const worker of workers) {
      const skillsRes = await query(`
        SELECT s.name, s.category, ws.proficiency_level
        FROM worker_skills ws
        JOIN skills s ON ws.skill_id = s.id
        WHERE ws.worker_id = $1
      `, [worker.id]);
      worker.skills = skillsRes.rows;
      worker.primary_trade = worker.primary_trade || (worker.skills[0] ? worker.skills[0].category : targetCategory || 'General Maintenance');

      // Schedule Slot Collision Check
      let isSlotOccupied = false;
      let slotConflictReason = null;

      if (worker.availability === 'BUSY') {
        isSlotOccupied = true;
        slotConflictReason = 'Artisan currently on active job assignment';
      } else if (worker.availability === 'OFFLINE' || worker.availability === 'ON_LEAVE') {
        isSlotOccupied = true;
        slotConflictReason = `Artisan is currently ${worker.availability}`;
      }

      if (scheduledDate && scheduledTime) {
        const conflictRes = await query(`
          SELECT id, booking_code, scheduled_date, scheduled_time, status
          FROM bookings
          WHERE worker_id = $1
          AND scheduled_date = $2
          AND (scheduled_time = $3 OR $3 = 'Immediate' OR scheduled_time = 'Immediate')
          AND status IN ('MATCHED', 'ACCEPTED', 'IN_PROGRESS')
          LIMIT 1
        `, [worker.id, scheduledDate, scheduledTime]);

        if (conflictRes.rows.length > 0) {
          isSlotOccupied = true;
          slotConflictReason = `Booked for ${conflictRes.rows[0].scheduled_time || scheduledTime} on ${scheduledDate} (${conflictRes.rows[0].booking_code})`;
        }
      }

      worker.isSlotOccupied = isSlotOccupied;
      worker.slotConflictReason = slotConflictReason;
      if (isSlotOccupied && worker.availability === 'AVAILABLE') {
        worker.availability = 'BUSY';
      }
    }

    // Fetch 7-day workload distribution for cooperative rotational fairness
    const recentJobsRes = await query(`
      SELECT worker_id, COUNT(*) as recent_jobs
      FROM bookings
      WHERE status IN ('ACCEPTED', 'IN_PROGRESS', 'COMPLETED')
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY worker_id
    `);
    const recentJobsMap = {};
    let totalRecentJobs = 0;
    for (const row of recentJobsRes.rows) {
      recentJobsMap[row.worker_id] = parseInt(row.recent_jobs, 10);
      totalRecentJobs += parseInt(row.recent_jobs, 10);
    }
    const avgRecentJobs = workers.length > 0 ? (totalRecentJobs / workers.length) : 0;

    // Find top Master/Gold Artisan in the SAME trade for pairing
    let tradeMaster = workers.find(w => w.tier === 'MASTER') || workers.find(w => w.tier === 'GOLD') || null;

    const squadSize = Math.max(1, Math.min(10, parseInt(req.body.squadSize || req.body.numberOfWorkers || 1, 10)));

    // Compute explainable scores & Geo-Location Proximity
    const scoredWorkers = workers.map((worker) => {
      const skills = worker.skills || [];
      const workerRecentJobs = recentJobsMap[worker.id] || 0;

      let skillScore = 0;
      let locationScore = 0;
      let availabilityScore = 0;
      let fairnessScore = 0;
      let trustScore = 0;
      const matchReasons = [];

      // 1. Skill Match (Max 40 points)
      if (targetCategory) {
        const hasDirectCategorySkill = skills.some(
          (s) => s.category.toLowerCase().includes(targetCategory.toLowerCase()) || targetCategory.toLowerCase().includes(s.category.toLowerCase())
        );
        const hasExpertLevel = skills.some(
          (s) => (s.category.toLowerCase().includes(targetCategory.toLowerCase()) || targetCategory.toLowerCase().includes(s.category.toLowerCase())) && s.proficiency_level === 'EXPERT'
        );

        if (hasExpertLevel) {
          skillScore = 40;
          matchReasons.push(`Expert Certified ${targetCategory} Artisan`);
        } else if (hasDirectCategorySkill) {
          skillScore = 35;
          matchReasons.push(`Certified ${targetCategory} Artisan`);
        } else {
          skillScore = 20;
        }
      } else {
        skillScore = 35;
      }

      // 2. Geo-Location & Proximity Match (Max 30 points)
      const distKm = (worker.latitude && worker.longitude)
        ? calculateHaversineDistanceKm(customerLat, customerLng, worker.latitude, worker.longitude)
        : (worker.district === district ? 4.5 : 18.0);

      const etaMins = calculateEtaMinutes(distKm);

      if (distKm <= 2.5) {
        locationScore = 30;
        matchReasons.push(`Immediate Local Sector (${distKm} km • ${etaMins} mins ETA)`);
      } else if (distKm <= 5.5) {
        locationScore = 26;
        matchReasons.push(`Same City Zone (${distKm} km • ${etaMins} mins ETA)`);
      } else if (distKm <= 12.0) {
        locationScore = 20;
        matchReasons.push(`District Fast Transit (${distKm} km • ${etaMins} mins ETA)`);
      } else if (distKm <= 25.0) {
        locationScore = 14;
        matchReasons.push(`Regional Dispatch (${distKm} km • ${etaMins} mins ETA)`);
      } else {
        locationScore = 8;
        matchReasons.push(`Cross-District Transfer (${distKm} km)`);
      }

      // 3. Cooperative Rotational Fairness Match (Max 25 points)
      // Boosts artisans who have had fewer assignments recently to ensure democratic livelihood distribution
      if (workerRecentJobs <= Math.floor(avgRecentJobs)) {
        fairnessScore = 25;
        matchReasons.push(`Fair Guild Rotation: Priority Dispatch (${workerRecentJobs} jobs in 7d)`);
      } else if (workerRecentJobs <= Math.ceil(avgRecentJobs) + 1) {
        fairnessScore = 18;
      } else {
        fairnessScore = 10;
        matchReasons.push(`Workload Balancing (${workerRecentJobs} jobs in 7d)`);
      }

      // 4. Availability & Schedule Slot Match (Max 10 points)
      if (worker.isSlotOccupied) {
        availabilityScore = 0;
        matchReasons.push(`Slot Occupied (${worker.slotConflictReason || 'Busy'})`);
      } else if (worker.availability === 'AVAILABLE') {
        availabilityScore = 10;
        matchReasons.push('Slot Free & Available for Dispatch');
      } else {
        availabilityScore = 4;
      }

      // 5. Tier & Trust Score (Max 10 points)
      const tierBonus = {
        MASTER: 10,
        GOLD: 8,
        SILVER: 5,
        BRONZE: 3,
      }[worker.tier || 'BRONZE'] || 3;

      trustScore = tierBonus + Math.min(2, Math.round(((worker.rating || 4.5) - 3.5) * 2));

      // Skill scaled to 30, Location to 25, Fairness 25, Availability 10, Trust 10 -> Total 100
      const scaledSkill = Math.round(skillScore * 0.75); // 40 -> 30
      const scaledLocation = Math.round(locationScore * 0.83); // 30 -> 25

      let totalScore = scaledSkill + scaledLocation + fairnessScore + availabilityScore + trustScore;
      if (totalScore > 99) totalScore = 99;
      if (totalScore < 30) totalScore = 30;

      // Badges
      const badges = [];
      if (worker.tier === 'MASTER') badges.push('Master Artisan');
      if (worker.tier === 'GOLD') badges.push('Gold Tier');
      if (fairnessScore >= 20) badges.push('Guild Rotation Priority');
      if (!worker.isSlotOccupied && totalScore >= 75) badges.push('Best Match');
      if (distKm <= 4.0) badges.push('Nearby (<4km)');
      if (worker.isSlotOccupied) badges.push('Slot Occupied');

      // Master Artisan Pairing Check (only pair with a Master from the SAME trade)
      let masterPairing = null;
      if (service && service.is_complex && (worker.tier === 'BRONZE' || worker.tier === 'SILVER') && tradeMaster && tradeMaster.id !== worker.id) {
        masterPairing = {
          masterWorkerId: tradeMaster.id,
          masterName: tradeMaster.name,
          masterTier: tradeMaster.tier,
          reason: `Complex ${targetCategory || 'cooperative'} task: paired with senior Master Artisan for on-site quality assurance (zero extra cost to customer).`,
        };
      }

      // Generate Route Waypoints from worker to customer
      const routeWaypoints = generateRouteWaypoints(
        worker.latitude || customerLat + 0.015,
        worker.longitude || customerLng + 0.015,
        customerLat,
        customerLng
      );

      return {
        ...worker,
        distanceKm: distKm,
        etaMinutes: etaMins,
        isNearby: distKm <= 6.0,
        recentJobsCount: workerRecentJobs,
        workerCoords: {
          lat: worker.latitude || customerLat + 0.015,
          lng: worker.longitude || customerLng + 0.015,
        },
        customerCoords: {
          lat: customerLat,
          lng: customerLng,
        },
        routeWaypoints,
        matchScore: Math.round(totalScore),
        scoreBreakdown: {
          skill: scaledSkill,
          location: scaledLocation,
          rotationalFairness: fairnessScore,
          availability: availabilityScore,
          trust: trustScore,
        },
        trustCard: {
          tier: worker.tier || 'BRONZE',
          meritPoints: worker.merit_points || 100,
          verifiedIti: true,
          guaranteeEligible: true,
          onTimeRate: '98%',
          completionRate: '99%',
        },
        masterPairing,
        matchReasons,
        badges,
      };
    });

    // ─────────────────────────────────────────────────────────────
    // ROTATIONAL FAIRNESS & PROXIMITY PREFERENCE SORTING:
    // 1. Available workers come FIRST (isSlotOccupied = false)
    // 2. Score with rotational fairness tiebreaker
    // ─────────────────────────────────────────────────────────────
    scoredWorkers.sort((a, b) => {
      const aOccupied = a.isSlotOccupied ? 1 : 0;
      const bOccupied = b.isSlotOccupied ? 1 : 0;
      if (aOccupied !== bOccupied) {
        return aOccupied - bOccupied;
      }

      // Proximity preference: if distance difference > 1.5 km, closer artisan preferred
      const distDiff = (a.distanceKm || 99) - (b.distanceKm || 99);
      if (Math.abs(distDiff) >= 1.5) {
        return distDiff;
      }

      return b.matchScore - a.matchScore;
    });

    // Resolve squad of N workers if requested
    const availableWorkers = scoredWorkers.filter(w => !w.isSlotOccupied);
    const squadWorkers = (availableWorkers.length >= squadSize ? availableWorkers : scoredWorkers).slice(0, squadSize);

    res.json({
      service,
      customerCoords: { lat: customerLat, lng: customerLng },
      recommendedWorkers: scoredWorkers.slice(0, 8),
      primaryWorker: squadWorkers[0] || scoredWorkers[0] || null,
      squadWorkers,
      squadSize,
      isSquadBooking: squadSize > 1,
      totalMatches: scoredWorkers.length,
      engine: 'Sahakari-FairRotation-Smart-Dispatcher v3.0',
    });
  } catch (err) {
    console.error('Matching engine error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to calculate worker matches.' });
  }
}

module.exports = {
  recommendWorkers,
  calculateHaversineDistanceKm,
  calculateEtaMinutes,
  generateRouteWaypoints,
  ODISHA_LOCALITY_COORDS,
};
