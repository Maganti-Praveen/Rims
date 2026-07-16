const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, mapDepartmentToSchool, deleteDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getDepartments);
router.post('/', authorize('super_admin', 'admin'), createDepartment);
router.put('/:id', authorize('super_admin', 'admin', 'dean'), updateDepartment);
router.put('/:id/map-school', authorize('super_admin', 'admin'), mapDepartmentToSchool);
router.delete('/:id', authorize('super_admin', 'admin'), deleteDepartment);

module.exports = router;
