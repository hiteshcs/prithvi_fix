const express = require('express');
const router = express.Router();
const {
  triggerSos,
  getSosAlerts,
  getLiveMap,
  createDispute,
  getDisputes,
  resolveDispute,
  getApplianceLineage,
  getPartsCatalog,
  // Tariff Administration (FEDERATION_HEAD only)
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  createPart,
  updatePart,
  deletePart,
} = require('../controllers/governanceController');
const { authenticate, authorize } = require('../middleware/auth');

// Public or Customer & Worker accessible
router.get('/parts-catalog', getPartsCatalog);

router.use(authenticate);

router.post('/sos', triggerSos);
router.get('/sos-alerts', authorize('COOPERATIVE_ADMIN'), getSosAlerts);
router.get('/live-map', getLiveMap);

router.post('/disputes', createDispute);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', authorize('COOPERATIVE_ADMIN'), resolveDispute);

// Appliance Lineage routes
router.get('/appliance-lineage', getApplianceLineage);
router.get('/appliance-lineage/:customerId', getApplianceLineage);

// ─────────────────────────────────────────────────────────────────────
// FEDERATION HEAD TARIFF ADMINISTRATION (COOPERATIVE_ADMIN role required)
// Internal FEDERATION_HEAD check is enforced inside each controller fn.
// ─────────────────────────────────────────────────────────────────────
router.get('/admin/services', authorize('COOPERATIVE_ADMIN'), getAllServicesAdmin);
router.post('/admin/services', authorize('COOPERATIVE_ADMIN'), createService);
router.put('/admin/services/:id', authorize('COOPERATIVE_ADMIN'), updateService);
router.delete('/admin/services/:id', authorize('COOPERATIVE_ADMIN'), deleteService);

router.post('/admin/parts-catalog', authorize('COOPERATIVE_ADMIN'), createPart);
router.put('/admin/parts-catalog/:id', authorize('COOPERATIVE_ADMIN'), updatePart);
router.delete('/admin/parts-catalog/:id', authorize('COOPERATIVE_ADMIN'), deletePart);

module.exports = router;
