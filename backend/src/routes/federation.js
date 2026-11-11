const express = require('express');
const router = express.Router();
const {
  getAdminDashboardData,
  getTreasurerDashboardData,
  applyNcctTraining,
  getInstitutionalTenders,
  registerWorkerByFederation,
  resolveDisputeTicket,
} = require('../controllers/federationController');

const { authenticate, authorize } = require('../middleware/auth');

// Public Institutional Tenders catalog
router.get('/tenders', getInstitutionalTenders);

// Federation Admin & Treasurer consoles (Protected: COOPERATIVE_ADMIN only)
router.get('/admin-dashboard', authenticate, authorize('COOPERATIVE_ADMIN'), getAdminDashboardData);
router.get('/treasurer-dashboard', authenticate, authorize('COOPERATIVE_ADMIN'), getTreasurerDashboardData);
router.post('/ncct/apply', authenticate, authorize('COOPERATIVE_ADMIN'), applyNcctTraining);
router.post('/workers/register', authenticate, authorize('COOPERATIVE_ADMIN'), registerWorkerByFederation);
router.post('/disputes/:id/resolve', authenticate, authorize('COOPERATIVE_ADMIN'), resolveDisputeTicket);

module.exports = router;
