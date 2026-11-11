const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminWorkers,
  verifyWorker,
  getAdminBookings,
  getAdminAuditLogs,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication as COOPERATIVE_ADMIN
router.use(authenticate);
router.use(authorize('COOPERATIVE_ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/workers', getAdminWorkers);
router.put('/workers/:id/verify', verifyWorker);
router.get('/bookings', getAdminBookings);
router.get('/audit-logs', getAdminAuditLogs);

module.exports = router;
