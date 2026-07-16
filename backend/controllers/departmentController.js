const Department = require('../models/Department');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

// @desc    Get all departments
// @route   GET /api/departments
exports.getDepartments = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'dean' && req.user.schoolId) {
            query.schoolId = req.user.schoolId;
        }

        const departments = await Department.find(query)
            .populate('schoolId', 'name code')
            .populate('hodId', 'name email employeeId designation')
            .sort({ code: 1 });

        res.json({ success: true, count: departments.length, data: departments });
    } catch (error) {
        next(error);
    }
};

// @desc    Create department
// @route   POST /api/departments
exports.createDepartment = async (req, res, next) => {
    try {
        const { name, code, schoolId, hodId } = req.body;

        const department = await Department.create({ name, code, schoolId, hodId });

        if (hodId) {
            await User.findByIdAndUpdate(hodId, { role: 'hod', department: code, departmentId: department._id });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'Department',
            targetId: department._id,
            details: `Created Department ${code}`,
        });

        res.status(201).json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
exports.updateDepartment = async (req, res, next) => {
    try {
        const { name, code, schoolId, hodId, isActive } = req.body;

        let dept = await Department.findById(req.params.id);
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        if (hodId !== undefined && String(dept.hodId) !== String(hodId)) {
            if (dept.hodId) {
                await User.findByIdAndUpdate(dept.hodId, { role: 'faculty' });
            }
            if (hodId) {
                await User.findByIdAndUpdate(hodId, { role: 'hod', department: dept.code, departmentId: dept._id });
            }
        }

        dept = await Department.findByIdAndUpdate(
            req.params.id,
            { name, code, schoolId, hodId, isActive },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: dept });
    } catch (error) {
        next(error);
    }
};

// @desc    Map department to school
// @route   PUT /api/departments/:id/map-school
exports.mapDepartmentToSchool = async (req, res, next) => {
    try {
        const { schoolId } = req.body;

        const dept = await Department.findByIdAndUpdate(
            req.params.id,
            { schoolId: schoolId || null },
            { new: true }
        ).populate('schoolId', 'name code');

        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Department',
            targetId: dept._id,
            details: `Mapped department ${dept.code} to school ${dept.schoolId ? dept.schoolId.code : 'None'}`,
        });

        res.json({ success: true, data: dept });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
exports.deleteDepartment = async (req, res, next) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        await Department.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        next(error);
    }
};
