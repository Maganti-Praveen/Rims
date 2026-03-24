const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    employeeId: {
        type: String,
        required: [true, 'Please add an employee ID'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'hod', 'faculty'],
        default: 'faculty',
    },
    designation: {
        type: String,
        enum: [
            'Assistant Professor',
            'Associate Professor',
            'Head of the Department',
            'Principal',
            'Dean Planning',
            'Dean Internal Affairs',
            'Dean Placements',
            'Dean Academics',
        ],
        default: 'Assistant Professor',
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
        trim: true,
    },
    joiningDate: {
        type: Date,
    },
    mobileNumber: {
        type: String,
        trim: true,
    },
    domain: {
        type: String,
        trim: true,
    },
    officialEmail: {
        type: String,
        trim: true,
    },
    // Personal email (Gmail, etc.) — stored in profile only, NOT used for login
    personalEmail: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    orcidId: {
        type: String,
        trim: true,
    },
    googleScholarUrl: {
        type: String,
        trim: true,
    },
    scopusAuthorId: {
        type: String,
        trim: true,
    },
    vidhwanId: {
        type: String,
        trim: true,
    },
    researchGateUrl: {
        type: String,
        trim: true,
    },
    linkedinUrl: {
        type: String,
        trim: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    profilePicturePublicId: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token (expires in 15 min)
userSchema.methods.getResetPasswordToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return rawToken; // send raw token in the email link
};

userSchema.index({ name: 'text', email: 'text', employeeId: 'text' });

module.exports = mongoose.model('User', userSchema);
