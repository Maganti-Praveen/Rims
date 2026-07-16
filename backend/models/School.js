const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a school name'],
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: [true, 'Please add a school code'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    deanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('School', schoolSchema);
