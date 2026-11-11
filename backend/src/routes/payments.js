const express = require('express');
const router = express.Router();
const { processPayment, getInvoiceByBookingId } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/process', processPayment);
router.get('/invoice/:bookingId', getInvoiceByBookingId);

module.exports = router;
