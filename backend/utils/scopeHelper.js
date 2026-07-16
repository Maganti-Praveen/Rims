const Department = require('../models/Department');

/**
 * Builds scope-based query filter according to user role
 * @param {Object} user - Authenticated user object from req.user
 * @param {Object} options - Additional options (e.g. key name 'department' vs 'departmentId')
 */
const buildScopeQuery = async (user, options = {}) => {
    const fieldName = options.deptField || 'department';

    if (!user) return {};

    switch (user.role) {
        case 'super_admin':
        case 'admin':
            return {}; // Unrestricted access

        case 'dean': {
            let deptCodes = [];
            if (user.schoolId) {
                const depts = await Department.find({ schoolId: user.schoolId, isActive: true }).select('code');
                deptCodes = depts.map(d => d.code);
            }
            if (deptCodes.length === 0 && user.department) {
                deptCodes = [user.department];
            }
            return deptCodes.length > 0 ? { [fieldName]: { $in: deptCodes } } : {};
        }

        case 'hod':
            return user.department ? { [fieldName]: user.department } : {};

        case 'faculty':
            return { facultyId: user._id };

        default:
            return {};
    }
};

/**
 * Returns list of accessible department codes for a user
 */
const getAccessibleDepartments = async (user) => {
    if (!user) return [];

    if (user.role === 'super_admin' || user.role === 'admin') {
        const depts = await Department.find({ isActive: true }).select('code');
        return depts.map(d => d.code);
    }

    if (user.role === 'dean') {
        if (user.schoolId) {
            const depts = await Department.find({ schoolId: user.schoolId, isActive: true }).select('code');
            return depts.map(d => d.code);
        }
    }

    if (user.role === 'hod' && user.department) {
        return [user.department];
    }

    return user.department ? [user.department] : [];
};

module.exports = { buildScopeQuery, getAccessibleDepartments };
