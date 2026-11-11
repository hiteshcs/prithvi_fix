const express = require('express');
const router = express.Router();
const { getServices, getServiceById, getRateCard, getServiceLocations } = require('../controllers/serviceController');

router.get('/', getServices);
router.get('/locations', getServiceLocations);
router.get('/rate-card', getRateCard);
router.get('/categories', async (req, res) => {
  try {
    const { query } = require('../db/connection');
    const result = await query('SELECT DISTINCT category FROM services WHERE is_active = true ORDER BY category');
    const categories = result.rows.map(r => r.category);
    res.json({ categories });
  } catch (err) {
    res.json({ categories: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason', 'Mechanic', 'Appliance Repair', 'Gardening', 'Cleaning'] });
  }
});
router.get('/:id', getServiceById);

module.exports = router;
