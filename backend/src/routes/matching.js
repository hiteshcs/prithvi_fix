const express = require('express');
const router = express.Router();
const { recommendWorkers } = require('../controllers/matchingController');

// Public / Authenticated matching recommendation endpoint
router.post('/recommend', recommendWorkers);

module.exports = router;
