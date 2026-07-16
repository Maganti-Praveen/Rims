const express = require('express');
const router = express.Router();
const { getSchools, getSchool, createSchool, updateSchool, deleteSchool } = require('../controllers/schoolController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getSchools);
router.get('/:id', getSchool);
router.post('/', authorize('super_admin', 'admin'), createSchool);
router.put('/:id', authorize('super_admin', 'admin'), updateSchool);
router.delete('/:id', authorize('super_admin', 'admin'), deleteSchool);

module.exports = router;
