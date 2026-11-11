const express = require('express');
const router = express.Router();
const { getWorkers, getWorkerById } = require('../controllers/workerController');

router.get('/', getWorkers);
router.get('/:id', getWorkerById);

module.exports = router;
