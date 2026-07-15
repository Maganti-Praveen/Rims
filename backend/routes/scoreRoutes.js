const express = require('express');
const router = express.Router();
const { getFacultyScore, getRankings, getConfigs, updateConfig } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/rankings', protect, getRankings);
router.get('/faculty/:facultyId', protect, getFacultyScore);
router.get('/config', protect, authorize('admin'), getConfigs);
router.put('/config/:id', protect, authorize('admin'), updateConfig);

module.exports = router;
