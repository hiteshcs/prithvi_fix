const express = require('express');
const router = express.Router();
const { submitReview, getWorkerReviews, getFeaturedReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.get('/featured', getFeaturedReviews);
router.get('/worker/:workerId', getWorkerReviews);
router.post('/', authenticate, submitReview);

module.exports = router;

