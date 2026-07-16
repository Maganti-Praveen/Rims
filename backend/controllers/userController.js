const User = require('../models/User');
const Publication = require('../models/Publication');
const Patent = require('../models/Patent');
const Workshop = require('../models/Workshop');
const Seminar = require('../models/Seminar');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const logActivity = require('../utils/logActivity');
const { saveToMemory, deleteFromMemory } = require('../middleware/upload');
const { getAccessibleDepartments } = require('../utils/scopeHelper');

// @desc    Get all users (filtered by role/dept)
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
    try {
        let query = {};
        const { department, role, search } = req.query;

        // HOD can only see their department, Dean sees departments in their school
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        } else if (req.user.role === 'dean') {
            const accessibleDepts = await getAccessibleDepartments(req.user);
            query.department = { $in: accessibleDepts };
        } else if (department) {
            query.department = department;
        }

        if (role) {
            if (role.includes(',')) {
                query.role = { $in: role.split(',').map(r => r.trim()) };
            } else {
                query.role = role;
            }
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Faculty can only view their own full profile
        if (req.user.role === 'faculty' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view other faculty profiles' });
        }

        // HOD can only view users in their department
        if (req.user.role === 'hod' && user.department !== req.user.department) {
            return res.status(403).json({ success: false, message: 'Not authorized to view users outside your department' });
        }

        // Dean can only view users in their school
        if (req.user.role === 'dean') {
            const accessibleDepts = await getAccessibleDepartments(req.user);
            if (!accessibleDepts.includes(user.department)) {
                return res.status(403).json({ success: false, message: 'Not authorized to view users outside your school' });
            }
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only the user themselves can update their own profile
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'You can only update your own profile' });
        }

        // Remove fields that shouldn't be updated by non-admin
        if (req.user.role !== 'admin') {
            delete req.body.role;
            delete req.body.password;
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'User',
            targetId: user._id,
            details: `Updated profile for ${user.name}`,
        });

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Helper to clean up all uploaded files associated with faculty IDs
const cleanupUserFiles = async (facultyIds) => {
    try {
        const ids = Array.isArray(facultyIds) ? facultyIds : [facultyIds];
        const [users, pubs, pats, works, certs] = await Promise.all([
            User.find({ _id: { $in: ids } }).select('profilePicture').lean(),
            Publication.find({ facultyId: { $in: ids } }).select('fileUrl').lean(),
            Patent.find({ facultyId: { $in: ids } }).select('fileUrl').lean(),
            Workshop.find({ facultyId: { $in: ids } }).select('certificateUrl').lean(),
            Certification.find({ facultyId: { $in: ids } }).select('fileUrl').lean(),
        ]);

        users.forEach(u => u.profilePicture && deleteFromMemory(u.profilePicture));
        pubs.forEach(p => p.fileUrl && deleteFromMemory(p.fileUrl));
        pats.forEach(p => p.fileUrl && deleteFromMemory(p.fileUrl));
        works.forEach(w => w.certificateUrl && deleteFromMemory(w.certificateUrl));
        certs.forEach(c => c.fileUrl && deleteFromMemory(c.fileUrl));
    } catch (err) {
        console.error('Error cleaning up user files:', err.message);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting yourself
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        // HOD can only delete faculty in their own department
        if (req.user.role === 'hod' && (user.department !== req.user.department || user.role !== 'faculty')) {
            return res.status(403).json({ success: false, message: 'HOD can only delete faculty in their own department' });
        }

        // Prevent deleting admin accounts
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted' });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Delete',
            category: 'User',
            targetId: user._id,
            details: `Deleted user ${user.name}`,
        });

        // Clean up files from disk before deleting DB records
        await cleanupUserFiles(req.params.id);

        // Cascade delete all related data
        await Promise.all([
            Publication.deleteMany({ facultyId: req.params.id }),
            Patent.deleteMany({ facultyId: req.params.id }),
            Workshop.deleteMany({ facultyId: req.params.id }),
            Seminar.deleteMany({ facultyId: req.params.id }),
            Education.deleteMany({ facultyId: req.params.id }),
            Certification.deleteMany({ facultyId: req.params.id }),
        ]);

        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'User and all related data deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk delete users
// @route   POST /api/users/bulk-delete
exports.bulkDeleteUsers = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of user IDs' });
        }

        // HOD can only delete faculty in their own department
        if (req.user.role === 'hod') {
            const users = await User.find({ _id: { $in: ids } }).lean();
            const unauthorized = users.filter(u => u.department !== req.user.department || u.role !== 'faculty');
            if (unauthorized.length > 0) {
                return res.status(403).json({ success: false, message: 'HOD can only delete faculty in their own department' });
            }
        }

        // Prevent deleting yourself
        if (ids.includes(req.user._id.toString())) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        const users = await User.find({ _id: { $in: ids } }).lean();

        // Prevent deleting admin accounts
        const hasAdmin = users.some(u => u.role === 'admin');
        if (hasAdmin) {
            return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted' });
        }

        for (const u of users) {
            await logActivity({
                userId: req.user._id,
                role: req.user.role,
                action: 'Delete',
                category: 'User',
                targetId: u._id,
                details: `Bulk deleted user ${u.name}`,
            });
        }

        // Clean up files from disk before deleting DB records
        await cleanupUserFiles(ids);

        // Cascade delete all related data for all users
        await Promise.all([
            Publication.deleteMany({ facultyId: { $in: ids } }),
            Patent.deleteMany({ facultyId: { $in: ids } }),
            Workshop.deleteMany({ facultyId: { $in: ids } }),
            Seminar.deleteMany({ facultyId: { $in: ids } }),
            Education.deleteMany({ facultyId: { $in: ids } }),
            Certification.deleteMany({ facultyId: { $in: ids } }),
        ]);

        const result = await User.deleteMany({ _id: { $in: ids } });

        res.json({ success: true, message: `${result.deletedCount} user(s) and all related data deleted` });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all departments
// @route   GET /api/users/departments
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await User.distinct('department');
        res.json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload profile picture (file or base64 from camera)
// @route   PUT /api/users/:id/profile-picture
exports.uploadProfilePicture = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only the user themselves can change their own profile picture
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'You can only update your own profile picture' });
        }

        // Delete old picture if exists
        if (user.profilePicture) {
            deleteFromMemory(user.profilePicture);
        }

        let result;

        if (req.file) {
            // File upload
            result = saveToMemory(req.file.buffer, 'profile-pictures', req.file.originalname, user.employeeId, user.department);
        } else if (req.body.image) {
            // Base64 camera capture — decode and save
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            result = saveToMemory(buffer, 'profile-pictures', `${user.employeeId}_photo.jpg`, user.employeeId, user.department);
        } else {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { profilePicture: result.url, profilePicturePublicId: '' },
            { new: true }
        );

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'User',
            targetId: updated._id,
            details: `Updated profile picture for ${updated.name}`,
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove profile picture
// @route   DELETE /api/users/:id/profile-picture
exports.removeProfilePicture = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only the user themselves can remove their own profile picture
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'You can only remove your own profile picture' });
        }

        if (user.profilePicture) {
            deleteFromMemory(user.profilePicture);
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { profilePicture: '', profilePicturePublicId: '' },
            { new: true }
        );

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin resets password for a faculty/HOD user
// @route   PUT /api/users/:id/reset-password
exports.resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const targetUser = await User.findById(req.params.id).select('+password');
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Admin cannot reset another admin's password (security guard)
        if (targetUser.role === 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Cannot reset another admin\'s password' });
        }

        // HOD can only reset faculty passwords in their own department
        if (req.user.role === 'hod') {
            if (targetUser.role !== 'faculty' || targetUser.department !== req.user.department) {
                return res.status(403).json({ success: false, message: 'HODs can only reset faculty passwords in their own department' });
            }
        }

        // Hash and save the new password (triggers pre-save hook)
        targetUser.password = newPassword;
        await targetUser.save();

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'User',
            targetId: targetUser._id,
            details: `Reset password for ${targetUser.name}`,
        });

        res.json({ success: true, message: `Password reset successfully for ${targetUser.name}` });
    } catch (error) {
        next(error);
    }
};

