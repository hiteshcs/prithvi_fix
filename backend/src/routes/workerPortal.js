const express = require('express');
const router = express.Router();
const {
  getWorkerDashboard,
  updateAvailability,
  handleJobAction,
  getWorkerWelfare,
  enrollWelfare,
  getWorkerToolkits,
  orderWorkerToolkit,
} = require('../controllers/workerPortalController');
const { authenticate, authorize } = require('../middleware/auth');

// All worker portal routes require authentication as WORKER or ADMIN
router.use(authenticate);
router.use(authorize('WORKER', 'COOPERATIVE_ADMIN'));

router.get('/dashboard', getWorkerDashboard);
router.put('/availability', updateAvailability);
router.put('/jobs/:id/action', handleJobAction);
router.get('/welfare', getWorkerWelfare);
router.post('/welfare/enroll', enrollWelfare);
router.get('/toolkits', getWorkerToolkits);
router.post('/toolkits/order', orderWorkerToolkit);

module.exports = router;
