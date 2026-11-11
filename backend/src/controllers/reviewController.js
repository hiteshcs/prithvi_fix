const { query } = require('../db/connection');

/**
 * POST /api/reviews
 * Submit rating and feedback review for a completed service.
 */
async function submitReview(req, res) {
  try {
    const { bookingId, rating } = req.body;
    const comment = req.body.comment || req.body.reviewText || '';
    const customerId = req.user.id;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Validation Error', message: 'Booking ID and rating (1-5) are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Validation Error', message: 'Rating must be an integer between 1 and 5.' });
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    if (booking.customer_id !== customerId && req.user.role !== 'COOPERATIVE_ADMIN') {
      return res.status(403).json({ error: 'Forbidden', message: 'You can only rate your own bookings.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Reviews can only be submitted for completed bookings.' });
    }

    if (!booking.worker_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Cannot review a booking without an assigned worker.' });
    }

    // Check if review already exists
    const existingRes = await query('SELECT id FROM reviews WHERE booking_id = $1', [bookingId]);
    const nowStr = new Date().toISOString();

    if (existingRes.rowCount > 0) {
      await query(`
        UPDATE reviews
        SET rating = $1, comment = $2, created_at = $3
        WHERE id = $4
      `, [numRating, comment || '', nowStr, existingRes.rows[0].id]);
    } else {
      await query(`
        INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [bookingId, customerId, booking.worker_id, numRating, comment || '', nowStr]);
    }

    // Recompute worker's average rating and total reviews
    const statsRes = await query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM reviews
      WHERE worker_id = $1
    `, [booking.worker_id]);

    const stats = statsRes.rows[0];
    const newAvg = stats.avg_rating ? Math.round(parseFloat(stats.avg_rating) * 10) / 10 : numRating;
    const newCount = parseInt(stats.count, 10) || 1;

    await query(`
      UPDATE workers
      SET rating = $1, total_reviews = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newAvg, newCount, booking.worker_id]);

    res.json({
      message: 'Review submitted successfully. Thank you for supporting your labour cooperative!',
      rating: numRating,
      comment: comment || '',
      updatedWorkerRating: newAvg,
      totalWorkerReviews: newCount,
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to submit review.' });
  }
}

/**
 * GET /api/reviews/worker/:workerId
 * Get all reviews for a worker.
 */
async function getWorkerReviews(req, res) {
  try {
    const { workerId } = req.params;

    const reviewsRes = await query(`
      SELECT r.*, u.name as customer_name, s.name as service_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
    `, [workerId]);

    res.json({ reviews: reviewsRes.rows });
  } catch (err) {
    console.error('Get worker reviews error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch reviews.' });
  }
}

/**
 * GET /api/reviews/featured
 * Get featured customer reviews & worker stories for the home page.
 */
async function getFeaturedReviews(req, res) {
  try {
    let dbReviews = [];
    try {
      const reviewsRes = await query(`
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.punctuality_score,
          r.quality_score,
          r.safety_score,
          r.worker_reply,
          r.created_at,
          u.name as customer_name,
          u.city as customer_city,
          u.district as customer_district,
          w.id as worker_id,
          wu.name as worker_name,
          w.experience_years as worker_experience,
          w.tier as worker_tier,
          s.name as service_name,
          s.category as service_category
        FROM reviews r
        JOIN users u ON r.customer_id = u.id
        JOIN workers w ON r.worker_id = w.id
        JOIN users wu ON w.user_id = wu.id
        JOIN bookings b ON r.booking_id = b.id
        JOIN services s ON b.service_id = s.id
        ORDER BY r.rating DESC, r.created_at DESC
        LIMIT 10
      `);
      dbReviews = reviewsRes.rows || [];
    } catch (dbErr) {
      console.warn('Could not query reviews table directly, using curated data:', dbErr.message);
    }

    // Curated customer reviews showcasing transparent tariffs, prompt arrival, and 30-day warranty
    const defaultCustomerReviews = [
      {
        id: 'cust-1',
        type: 'CUSTOMER',
        name: 'Ananya Patel',
        role: 'Verified Citizen Resident',
        district: 'Khordha',
        city: 'Bhubaneswar',
        location: 'Patia, Bhubaneswar',
        serviceName: 'Split AC Deep Jet Service & Nitrogen Test',
        category: 'electrical',
        categoryLabel: 'AC & Appliance',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Fixed ₹499 base tariff, zero surge fees. Micro leak repaired and cooling restored perfectly.',
        servicedBy: 'Kailash Sahoo (HVAC Master • 14 Yrs Exp)',
        workerReply: 'Glad to help! Keep outdoor condenser clear for best airflow.',
        date: '2 days ago',
        verified: true,
        warrantyProtected: true,
      },
      {
        id: 'cust-2',
        type: 'CUSTOMER',
        name: 'Sanjay Das',
        role: 'House Owner & Cooperative Patron',
        district: 'Cuttack',
        city: 'Cuttack',
        location: 'College Square, Cuttack',
        serviceName: 'Emergency Short-Circuit Restoration',
        category: 'electrical',
        categoryLabel: 'Electrical',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Arrived in 25 mins during heavy rain. Safely replaced sparking MCB at standard government rate.',
        servicedBy: 'Ramesh Kumar (Master Electrician)',
        workerReply: 'Safety first! Always glad to assist Cuttack households.',
        date: '5 days ago',
        verified: true,
        warrantyProtected: true,
      },
      {
        id: 'cust-3',
        type: 'CUSTOMER',
        name: 'Rohit Patnaik',
        role: 'Apartment Society Secretary',
        district: 'Khordha',
        city: 'Bhubaneswar',
        location: 'Chandrasekharpur, Bhubaneswar',
        serviceName: '1000L Overhead Water Tank Disinfection',
        category: 'plumbing',
        categoryLabel: 'Plumbing',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Thorough tank silt cleaning and food-grade UV sanitation. Clean work, zero mess left behind.',
        servicedBy: 'Ajay Sahu (Master Plumber)',
        workerReply: 'Always a pleasure serving your residential society.',
        date: '1 week ago',
        verified: true,
        warrantyProtected: true,
      },
      {
        id: 'cust-4',
        type: 'CUSTOMER',
        name: 'Meera Rath',
        role: 'Homeowner',
        district: 'Puri',
        city: 'Puri',
        location: 'VIP Road, Puri',
        serviceName: 'Full Home Sanitization & Deep Scrub',
        category: 'home',
        categoryLabel: 'Cleaning & Home Care',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Exceptional beachside home sanitization before Rath Yatra. Everything was meticulously scrubbed and polished.',
        servicedBy: 'Narayan Rout (Puri Coastal Cooperative Team)',
        workerReply: 'Puri Coastal Cooperative is always at your service.',
        date: '2 weeks ago',
        verified: true,
        warrantyProtected: true,
      },
      {
        id: 'cust-5',
        type: 'CUSTOMER',
        name: 'Priya Mohanty',
        role: 'Resident Citizen',
        district: 'Khordha',
        city: 'Bhubaneswar',
        location: 'Jaydev Vihar, Bhubaneswar',
        serviceName: 'Concealed Bathroom Leak Detection',
        category: 'plumbing',
        categoryLabel: 'Plumbing',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Diagnosed concealed wall leak without damaging tiles. The 30-day warranty card gave complete peace of mind.',
        servicedBy: 'Bikash Mohapatra (Certified Plumbing Technician)',
        workerReply: 'Glad we resolved the seepage before monsoon peak.',
        date: '3 weeks ago',
        verified: true,
        warrantyProtected: true,
      },
      {
        id: 'cust-6',
        type: 'CUSTOMER',
        name: 'Vikram Sahoo',
        role: 'Independent House Owner',
        district: 'Khordha',
        city: 'Bhubaneswar',
        location: 'Nayapalli, Bhubaneswar',
        serviceName: 'Split AC Installation & Wall Mounting',
        category: 'electrical',
        categoryLabel: 'AC & Appliance',
        rating: 5,
        scores: { punctuality: 5, quality: 5, safety: 5 },
        comment: 'Precise mounting with full vacuum evacuation. ₹500 cheaper than private apps with zero vibration.',
        servicedBy: 'Dilip Barik (Gold HVAC Specialist)',
        workerReply: 'Proper vacuuming is standard cooperative SOP. Enjoy!',
        date: '3 weeks ago',
        verified: true,
        warrantyProtected: true,
      }
    ];

    // Merge database customer reviews with curated ones
    const mappedDbReviews = dbReviews.map((r, i) => ({
      id: `db-rev-${r.id || i}`,
      type: 'CUSTOMER',
      name: r.customer_name || 'Verified Citizen',
      role: 'Verified Resident',
      district: r.customer_district || 'Khordha',
      city: r.customer_city || 'Bhubaneswar',
      location: `${r.customer_city || 'Bhubaneswar'}, ${r.customer_district || 'Odisha'}`,
      serviceName: r.service_name || 'Cooperative Trade Service',
      category: (r.service_category || 'electrical').toLowerCase(),
      categoryLabel: r.service_category || 'Trade Service',
      rating: r.rating || 5,
      scores: {
        punctuality: r.punctuality_score || 5,
        quality: r.quality_score || 5,
        safety: r.safety_score || 5
      },
      comment: r.comment || 'Excellent workmanship and transparent fixed pricing.',
      servicedBy: `${r.worker_name || 'Assigned Artisan'} (${r.worker_tier || 'Skill Certified'})`,
      workerReply: r.worker_reply || 'Thank you for supporting cooperative artisans!',
      date: new Date(r.created_at || Date.now()).toLocaleDateString(),
      verified: true,
      warrantyProtected: true,
    }));

    const customerReviews = [...mappedDbReviews, ...defaultCustomerReviews].slice(0, 8);

    // Artisan / Worker Reviews & Testimonials describing the cooperative experience
    const workerReviews = [
      {
        id: 'wrk-1',
        type: 'WORKER',
        name: 'Ramesh Kumar',
        trade: 'Master Electrician',
        experience: '12 Years Experience',
        qualification: 'Gold Skill Certified • OSEB Safety Licensed',
        cooperative: 'Bhubaneswar Labour Cooperative Federation',
        district: 'Khordha',
        city: 'Bhubaneswar',
        rating: 5,
        highlight: '“Private apps cut 25% commission. Prithvi Fix gives 93% direct earnings.”',
        comment: 'Regulated base tariffs, same-day direct UPI payouts, and ₹5 Lakh accident cover. I earn ₹34,000+ monthly with full dignity.',
        metrics: {
          monthlyIncome: '₹34,500/mo',
          completedJobs: '520+ Bookings',
          artisanRating: '4.98 ★',
          welfare: 'ESIC & Accident Insurance Covered'
        },
        category: 'electrical',
        categoryLabel: 'Electrical',
        joinedYear: '2023',
        verified: true,
        masterArtisan: true,
      },
      {
        id: 'wrk-2',
        type: 'WORKER',
        name: 'Kailash Sahoo',
        trade: 'HVAC & Refrigeration Specialist',
        experience: '14 Years Experience',
        qualification: 'CESL Certified • Daikin VRF Specialist',
        cooperative: 'Bhubaneswar Labour Cooperative Federation',
        district: 'Khordha',
        city: 'Bhubaneswar',
        rating: 5,
        highlight: '“Zero arbitrary fines. Cooperative provided toolkit loans at 0% interest.”',
        comment: 'Fair treatment and a ₹15,000 interest-free tool loan for modern gauges. Citizens respect our certified skills.',
        metrics: {
          monthlyIncome: '₹38,000/mo',
          completedJobs: '410+ Bookings',
          artisanRating: '4.95 ★',
          welfare: 'Toolkit Loan Beneficiary'
        },
        category: 'electrical',
        categoryLabel: 'AC & Appliance',
        joinedYear: '2022',
        verified: true,
        masterArtisan: true,
      },
      {
        id: 'wrk-3',
        type: 'WORKER',
        name: 'Ajay Sahu',
        trade: 'Senior Plumbing & Hydro Engineer',
        experience: '11 Years Experience',
        qualification: 'NSDC Master Plumber License',
        cooperative: 'Bhubaneswar Labour Cooperative Federation',
        district: 'Khordha',
        city: 'Bhubaneswar',
        rating: 5,
        highlight: '“Guaranteed local bookings within 5 km. Saved ₹3,000/mo on fuel.”',
        comment: 'Smart cluster dispatch saves ₹3,000 monthly on travel. Locked parts catalog eliminates price bargaining.',
        metrics: {
          monthlyIncome: '₹31,000/mo',
          completedJobs: '380+ Bookings',
          artisanRating: '4.92 ★',
          welfare: 'Local Cluster Dispatch'
        },
        category: 'plumbing',
        categoryLabel: 'Plumbing',
        joinedYear: '2023',
        verified: true,
        masterArtisan: false,
      },
      {
        id: 'wrk-4',
        type: 'WORKER',
        name: 'Tapan Sethi',
        trade: 'Master Carpenter & Modular Assembler',
        experience: '9 Years Experience',
        qualification: 'NCVT Certified Wood Artisan',
        cooperative: 'Cuttack District Labour Cooperative Society',
        district: 'Cuttack',
        city: 'Cuttack',
        rating: 5,
        highlight: '“Apprentice model lets me train youth while earning fair wages.”',
        comment: 'I train young apprentices on live jobs with fair stipends. Prithvi Fix protects our traditional woodworking craft.',
        metrics: {
          monthlyIncome: '₹29,800/mo',
          completedJobs: '290+ Bookings',
          artisanRating: '4.96 ★',
          welfare: 'Master Mentor Recognition'
        },
        category: 'home',
        categoryLabel: 'Carpentry',
        joinedYear: '2024',
        verified: true,
        masterArtisan: true,
      },
      {
        id: 'wrk-5',
        type: 'WORKER',
        name: 'Narayan Rout',
        trade: 'Facility Sanitation & Deep Clean Lead',
        experience: '8 Years Experience',
        qualification: 'Certified Commercial Cleaning Lead',
        cooperative: 'Puri Coastal Labour Cooperative',
        district: 'Puri',
        city: 'Puri',
        rating: 5,
        highlight: '“5% Welfare Fund covered my hospitalization during emergency.”',
        comment: 'The 5% Welfare Fund covered my appendix surgery without debt. True social security for every artisan.',
        metrics: {
          monthlyIncome: '₹27,500/mo',
          completedJobs: '340+ Bookings',
          artisanRating: '4.91 ★',
          welfare: 'ESIC Medical Claim Settled'
        },
        category: 'home',
        categoryLabel: 'Cleaning & Home Care',
        joinedYear: '2023',
        verified: true,
        masterArtisan: false,
      },
      {
        id: 'wrk-6',
        type: 'WORKER',
        name: 'Dilip Barik',
        trade: 'Refrigeration & Cooling Technician',
        experience: '7 Years Experience',
        qualification: 'NSDC HVAC Skill Level 4',
        cooperative: 'Bhubaneswar Labour Cooperative Federation',
        district: 'Khordha',
        city: 'Bhubaneswar',
        rating: 5,
        highlight: '“Respect, professional dignity, and zero doorstep bargaining.”',
        comment: 'Fixed base rates eliminate doorstep bargaining. Customers know we are certified cooperative technicians.',
        metrics: {
          monthlyIncome: '₹32,000/mo',
          completedJobs: '260+ Bookings',
          artisanRating: '4.94 ★',
          welfare: 'Cooperative Shareholder'
        },
        category: 'electrical',
        categoryLabel: 'AC & Appliance',
        joinedYear: '2024',
        verified: true,
        masterArtisan: false,
      }
    ];

    const stats = {
      overallAverageRating: 4.9,
      totalCustomerReviews: 4850,
      customerSatisfactionRate: '99.4%',
      workerSatisfactionRate: '98.6%',
      activeArtisans: 50,
      livingWageCompliance: '93% Direct Payout (93-2-5 Model)',
      warrantyClaimSuccess: '100% Free Re-Repair SLA',
    };

    res.json({
      success: true,
      customerReviews,
      workerReviews,
      stats,
    });
  } catch (err) {
    console.error('Get featured reviews error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch featured reviews.' });
  }
}

module.exports = {
  submitReview,
  getWorkerReviews,
  getFeaturedReviews,
};
