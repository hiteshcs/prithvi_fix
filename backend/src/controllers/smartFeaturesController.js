const { query } = require('../db/connection');

/**
 * GET /api/smart-features/forecast
 * Community Demand Forecasting based on historical bookings, trade categories, and regional seasonal factors.
 */
async function getDemandForecast(req, res) {
  try {
    // 1. Current trade category baseline
    const categoryStatsRes = await query(`
      SELECT 
        s.category,
        CAST(COUNT(b.id) AS INTEGER) as past_bookings,
        CAST(COUNT(DISTINCT ws.worker_id) AS INTEGER) as current_workers
      FROM services s
      LEFT JOIN bookings b ON b.service_id = s.id
      LEFT JOIN skills sk ON sk.category = s.category
      LEFT JOIN worker_skills ws ON ws.skill_id = sk.id
      GROUP BY s.category
    `);

    const categoryStats = categoryStatsRes.rows;

    // 2. Seasonal factors simulation (Regional context: Monsoon, Summer, Festive)
    const seasonalPredictions = [
      {
        season: 'Pre-Monsoon & Rainy Season',
        period: 'Next 30 Days (Sep - Oct)',
        tag: 'High Alert',
        highDemandTrades: ['Plumbing', 'Electrical', 'Cleaning'],
        surgeFactor: '+45%',
        rationale: 'Heavy rainfall increases roof leakages, drainage blockages, and short circuit incidents across coastal Odisha (Bhubaneswar & Cuttack).',
        recommendedAction: 'Mobilize 15 additional certified plumbers & electricians. Conduct safety briefing on high-moisture electrical repairs.',
      },
      {
        season: 'Durga Puja & Festival Season',
        period: 'October - November',
        tag: 'Festival Surge',
        highDemandTrades: ['Painting', 'Deep Cleaning', 'Carpentry', 'Domestic Services'],
        surgeFactor: '+60%',
        rationale: 'Pre-festival household renovation, wall repainting, deep sanitation, and event carpentry demand surge across urban residential clusters.',
        recommendedAction: 'Organize express painting contractor squads and inter-cooperative temporary workforce pooling from Puri to Bhubaneswar.',
      },
      {
        season: 'Summer Peak Prep',
        period: 'Upcoming Quarter',
        tag: 'Seasonal Prep',
        highDemandTrades: ['Appliance Repair', 'Driving', 'Caregiving'],
        surgeFactor: '+35%',
        rationale: 'AC maintenance and refrigerator gas refill surge. Increased tourism transit in Puri corridor.',
        recommendedAction: 'Schedule NSDC certified AC technician refresher training across District Cooperative training centers.',
      },
    ];

    // 3. 4-Week Predictive Demand Projection by Category
    const categoryForecasts = categoryStats.map((item) => {
      const past = parseInt(item.past_bookings, 10) || 1;
      let multiplier = 1.35; // Standard growth
      let trend = 'RISING';

      if (['Plumbing', 'Electrical', 'Painting', 'Cleaning'].includes(item.category)) {
        multiplier = 1.65;
        trend = 'SURGE';
      } else if (['Gardening'].includes(item.category)) {
        multiplier = 1.1;
        trend = 'STABLE';
      }

      const projectedWeek1 = Math.round(past * 0.4 * multiplier) + 4;
      const projectedWeek2 = Math.round(past * 0.6 * multiplier) + 6;
      const projectedWeek3 = Math.round(past * 0.9 * multiplier) + 8;
      const projectedWeek4 = Math.round(past * 1.2 * multiplier) + 12;
      const totalProjected = projectedWeek1 + projectedWeek2 + projectedWeek3 + projectedWeek4;

      return {
        category: item.category,
        currentWorkers: parseInt(item.current_workers, 10) || 4,
        pastVolume: past,
        projectedMonthVolume: totalProjected,
        growthPercentage: Math.round((multiplier - 1) * 100),
        trend,
        weeklyProjection: [projectedWeek1, projectedWeek2, projectedWeek3, projectedWeek4],
      };
    });

    // Sort by projected volume
    categoryForecasts.sort((a, b) => b.projectedMonthVolume - a.projectedMonthVolume);

    res.json({
      seasonalPredictions,
      categoryForecasts,
      pocDisclaimer: 'POC Notice: Demand forecasting uses rule-based predictive extrapolation from regional historical booking frequency and seasonal weather calendars. Production implementation connects time-series ML models with IMD weather APIs.',
    });
  } catch (err) {
    console.error('Demand forecast error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to generate demand forecasts.' });
  }
}

/**
 * GET /api/smart-features/allocation
 * Cooperative Workforce Allocation and Supply vs Demand Gap Matrix with Inter-District Mutual Aid recommendations.
 */
async function getWorkforceAllocation(req, res) {
  try {
    // Regional supply & demand matrix
    const districts = [
      {
        district: 'Khordha (Bhubaneswar)',
        cooperative: 'Bhubaneswar Labour Cooperative Federation',
        activeWorkers: 12,
        activeBookings: 14,
        demandStatus: 'HIGH_DEMAND',
        capacityUtilization: '88%',
        criticalTrades: [
          { trade: 'Electrical', supply: 4, demand: 8, gap: -4, status: 'SHORTAGE' },
          { trade: 'Plumbing', supply: 3, demand: 5, gap: -2, status: 'SHORTAGE' },
          { trade: 'Painting', supply: 2, demand: 2, gap: 0, status: 'BALANCED' },
          { trade: 'Cleaning', supply: 3, demand: 2, gap: 1, status: 'OPTIMAL' },
        ],
        actionSuggestion: 'Trigger inter-district mutual aid dispatch for 4 Electricians from Cuttack.',
      },
      {
        district: 'Cuttack',
        cooperative: 'Cuttack District Labour Cooperative Society',
        activeWorkers: 8,
        activeBookings: 6,
        demandStatus: 'MODERATE',
        capacityUtilization: '65%',
        criticalTrades: [
          { trade: 'Electrical', supply: 4, demand: 2, gap: +2, status: 'SURPLUS' },
          { trade: 'Plumbing', supply: 3, demand: 2, gap: +1, status: 'SURPLUS' },
          { trade: 'Carpentry', supply: 3, demand: 3, gap: 0, status: 'BALANCED' },
        ],
        actionSuggestion: 'Surplus capacity available. Ready for temporary deployment to Khordha metro cluster.',
      },
      {
        district: 'Puri',
        cooperative: 'Puri Coastal Labour Cooperative',
        activeWorkers: 6,
        activeBookings: 4,
        demandStatus: 'SEASONAL',
        capacityUtilization: '55%',
        criticalTrades: [
          { trade: 'Caregiving', supply: 2, demand: 2, gap: 0, status: 'BALANCED' },
          { trade: 'Driving', supply: 2, demand: 2, gap: 0, status: 'BALANCED' },
          { trade: 'Painting', supply: 2, demand: 1, gap: +1, status: 'SURPLUS' },
        ],
        actionSuggestion: 'Hospitality and transit services steady. Pre-festival painting squads available for dispatch.',
      },
    ];

    // Inter-Cooperative Mutual Aid Recommendations
    const mutualAidProposals = [
      {
        id: 'AID-2026-01',
        fromCoop: 'Cuttack District Labour Cooperative Society',
        toCoop: 'Bhubaneswar Labour Cooperative Federation',
        trade: 'Electrical & AC Technicians',
        workersCount: 3,
        duration: '7 Days (Pre-Monsoon Surge)',
        status: 'PENDING_APPROVAL',
        estimatedImpact: 'Reduces Bhubaneswar customer dispatch wait times from 45 mins to 18 mins.',
      },
      {
        id: 'AID-2026-02',
        fromCoop: 'Puri Coastal Labour Cooperative',
        toCoop: 'Bhubaneswar Labour Cooperative Federation',
        trade: 'Certified Painters',
        workersCount: 2,
        duration: '14 Days (Pre-Puja Renovation)',
        status: 'APPROVED',
        estimatedImpact: 'Fulfills high-value residential society painting tenders in Patia & Jaydev Vihar.',
      },
    ];

    res.json({
      districts,
      mutualAidProposals,
      pocDisclaimer: 'POC Notice: Workforce allocation and mutual aid suggestions are generated through cooperative federation capacity rules. In production, automated multi-district dispatch agreements operate under state cooperative bylaws.',
    });
  } catch (err) {
    console.error('Workforce allocation error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to generate workforce allocation matrix.' });
  }
}

/**
 * POST /api/smart-features/mutual-aid/:id/approve
 * Approve an inter-cooperative mutual aid dispatch recommendation.
 */
function approveMutualAid(req, res) {
  try {
    const proposalId = req.params.id;
    res.json({
      message: `Mutual Aid proposal ${proposalId} approved by Cooperative Federation Administrator`,
      proposalId,
      status: 'APPROVED',
    });
  } catch (err) {
    console.error('Approve mutual aid error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to approve mutual aid.' });
  }
}

module.exports = {
  getDemandForecast,
  getWorkforceAllocation,
  approveMutualAid,
};
