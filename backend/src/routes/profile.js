const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  updateProfile,
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
} = require('../controllers/profileController');

// All profile routes require authentication
router.put('/', authenticate, updateProfile);
router.get('/addresses', authenticate, getSavedAddresses);
router.post('/addresses', authenticate, createSavedAddress);
router.put('/addresses/:id', authenticate, updateSavedAddress);
router.delete('/addresses/:id', authenticate, deleteSavedAddress);

module.exports = router;
