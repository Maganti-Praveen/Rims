const School = require('../models/School');
const Department = require('../models/Department');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

// @desc    Get all schools
// @route   GET /api/schools
exports.getSchools = async (req, res, next) => {
    try {
        const schools = await School.find()
            .populate('deanId', 'name email employeeId designation profilePicture')
            .lean();

        // Attach departments to each school
        const schoolsWithDepts = await Promise.all(
            schools.map(async (school) => {
                const departments = await Department.find({ schoolId: school._id })
                    .populate('hodId', 'name email employeeId')
                    .lean();
                return { ...school, departments };
            })
        );

        res.json({ success: true, count: schoolsWithDepts.length, data: schoolsWithDepts });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single school
// @route   GET /api/schools/:id
exports.getSchool = async (req, res, next) => {
    try {
        const school = await School.findById(req.params.id)
            .populate('deanId', 'name email employeeId designation profilePicture')
            .lean();

        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        const departments = await Department.find({ schoolId: school._id })
            .populate('hodId', 'name email employeeId')
            .lean();

        res.json({ success: true, data: { ...school, departments } });
    } catch (error) {
        next(error);
    }
};

// @desc    Create school (Super Admin / Admin)
// @route   POST /api/schools
exports.createSchool = async (req, res, next) => {
    try {
        const { name, code, deanId } = req.body;

        const school = await School.create({ name, code, deanId });

        if (deanId) {
            await User.findByIdAndUpdate(deanId, { role: 'dean', schoolId: school._id });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'School',
            targetId: school._id,
            details: `Created School ${name} (${code})`,
        });

        res.status(201).json({ success: true, data: school });
    } catch (error) {
        next(error);
    }
};

// @desc    Update school
// @route   PUT /api/schools/:id
exports.updateSchool = async (req, res, next) => {
    try {
        const { name, code, deanId, isActive, departmentIds } = req.body;

        let school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        // Handle department checkbox mappings
        if (departmentIds !== undefined && Array.isArray(departmentIds)) {
            // Unassign departments previously mapped to this school
            await Department.updateMany({ schoolId: school._id }, { schoolId: null });
            // Map selected department IDs to this school
            if (departmentIds.length > 0) {
                await Department.updateMany({ _id: { $in: departmentIds } }, { schoolId: school._id });
            }
        }

        // If dean changed, update old & new dean roles
        if (deanId !== undefined && String(school.deanId) !== String(deanId)) {
            if (school.deanId) {
                // Check if old dean is dean of any other school
                const otherSchool = await School.findOne({ deanId: school.deanId, _id: { $ne: school._id } });
                if (!otherSchool) {
                    await User.findByIdAndUpdate(school.deanId, { role: 'faculty', schoolId: null });
                }
            }
            if (deanId) {
                await User.findByIdAndUpdate(deanId, { role: 'dean', schoolId: school._id });
            }
        }

        school = await School.findByIdAndUpdate(
            req.params.id,
            { name, code, deanId, isActive },
            { new: true, runValidators: true }
        );

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'School',
            targetId: school._id,
            details: `Updated School ${school.name}`,
        });

        res.json({ success: true, data: school });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete school
// @route   DELETE /api/schools/:id
exports.deleteSchool = async (req, res, next) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        // Unlink departments
        await Department.updateMany({ schoolId: school._id }, { schoolId: null });

        if (school.deanId) {
            await User.findByIdAndUpdate(school.deanId, { role: 'faculty', schoolId: null });
        }

        await School.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        next(error);
    }
};
