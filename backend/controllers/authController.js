const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/mailer');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register user (Admin only)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, employeeId, email, password, role, department, joiningDate, mobileNumber, domain, officialEmail, address, designation } = req.body;

        // HOD can only create faculty in their own department
        if (req.user.role === 'hod') {
            if (role !== 'faculty') {
                return res.status(403).json({ success: false, message: 'HOD can only create faculty accounts' });
            }
            if (department !== req.user.department) {
                return res.status(403).json({ success: false, message: 'HOD can only create faculty in their own department' });
            }
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or employee ID already exists' });
        }

        const user = await User.create({
            name, employeeId, email, password, role, department, joiningDate, mobileNumber, domain, officialEmail, address, designation,
        });

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'User',
            targetId: user._id,
            details: `Created ${role} account for ${name}`,
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });

        // Send welcome email (fire-and-forget — does not block response)
        sendWelcomeEmail(user, password).catch((err) =>
            console.error('[Mailer] Welcome email failed:', err.message)
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk register users from Excel file
// @route   POST /api/auth/bulk-register
exports.bulkRegister = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
        }

        const XLSX = require('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (!rows.length) {
            return res.status(400).json({ success: false, message: 'Excel file is empty' });
        }

        // Helper: convert any date representation to a JS Date (or undefined)
        const parseDate = (val) => {
            if (!val || val === '') return undefined;
            // xlsx with cellDates:true returns Date objects directly
            if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
            const str = String(val).trim();
            if (!str || str === '0') return undefined;
            // Standard ISO / DD-MM-YYYY / MM/DD/YYYY strings
            const d = new Date(str);
            if (!isNaN(d.getTime())) return d;
            // Excel serial number fallback:  days since 1900-01-00
            const serial = parseFloat(str);
            if (!isNaN(serial) && serial > 1) {
                // Excel epoch is Dec 30, 1899 (accounting for the leap-year bug)
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const ms = Math.round((serial - Math.floor(serial)) * 86400000);
                const d2 = new Date(excelEpoch.getTime() + Math.floor(serial) * 86400000 + ms);
                if (!isNaN(d2.getTime())) return d2;
            }
            return undefined;
        };

        const results = { created: [], skipped: [], errors: [] };
        const requiredFields = ['name', 'employeeId', 'email', 'password', 'department'];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;

            // Normalize column names (case-insensitive, trim spaces)
            const data = {};
            Object.keys(row).forEach(key => {
                const k = key.trim().toLowerCase().replace(/\s+/g, '');
                const v = row[key];
                if (k === 'name' || k === 'fullname') data.name = String(v).trim();
                else if (k === 'employeeid' || k === 'empid') data.employeeId = String(v).trim();
                else if (k === 'email') data.email = String(v).trim().toLowerCase();
                else if (k === 'password') data.password = String(v).trim();
                else if (k === 'role') data.role = String(v).trim().toLowerCase();
                else if (k === 'department' || k === 'dept') data.department = String(v).trim();
                else if (k === 'mobilenumber' || k === 'mobile' || k === 'phone') data.mobileNumber = String(v).trim();
                else if (k === 'domain' || k === 'specialization') data.domain = String(v).trim();
                else if (k === 'officialemail') data.officialEmail = String(v).trim();
                else if (k === 'joiningdate') data.joiningDate = parseDate(v);
                else if (k === 'address') data.address = String(v).trim();
                else if (k === 'designation') data.designation = String(v).trim();
            });

            const validRoles = ['faculty', 'hod', 'dean', 'super_admin', 'admin'];
            if (!data.role || !validRoles.includes(data.role)) data.role = 'faculty';

            if (req.user.role === 'hod') {
                data.role = 'faculty';
                data.department = req.user.department;
            }

            const missing = requiredFields.filter(f => !data[f]);
            if (missing.length > 0) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: `Missing: ${missing.join(', ')}` });
                continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (data.email && !emailRegex.test(data.email)) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: 'Invalid email address format' });
                continue;
            }

            const exists = await User.findOne({ $or: [{ email: data.email }, { employeeId: data.employeeId }] });
            if (exists) {
                results.skipped.push({ row: rowNum, name: data.name, reason: 'Email or Employee ID already exists' });
                continue;
            }

            try {
                const user = await User.create(data);
                results.created.push({ row: rowNum, name: user.name, email: user.email, department: user.department });
            } catch (err) {
                results.errors.push({ row: rowNum, name: data.name || '—', reason: err.message });
            }
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Add',
            category: 'User',
            details: `Bulk upload: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`,
        });

        res.json({
            success: true,
            data: results,
            summary: {
                total: rows.length,
                created: results.created.length,
                skipped: results.skipped.length,
                errors: results.errors.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide your email / Employee ID and password' });
        }

        // Auto-detect: if input contains '@' treat as email, otherwise as employeeId
        const isEmail = email.includes('@');
        const query = isEmail ? { email: email.toLowerCase().trim() } : { employeeId: email.trim() };

        const user = await User.findOne(query).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: isEmail
                    ? 'No account found with this email address.'
                    : 'No account found with this Employee ID.',
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password — send reset link
// @route   POST /api/auth/forgot-password  (public)
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Please provide your college email' });

        const user = await User.findOne({ email });
        if (!user) {
            // Generic message for security — don't reveal whether email exists
            return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        const rawToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user, rawToken);
            res.json({ success: true, message: 'Password reset email sent. Check your inbox.' });
        } catch (emailErr) {
            // Rollback token on email failure
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('[Mailer] Reset email failed:', emailErr.message);
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password using token from email
// @route   PUT /api/auth/reset-password  (public)
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Hash the raw token and find matching user
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired (15-minute limit).' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        next(error);
    }
};
