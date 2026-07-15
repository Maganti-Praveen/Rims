const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    institution: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['Organized', 'Attended'],
    },
    date: {
        type: Date,
    },
    academicYear: {
        type: String,
        trim: true,
    },
    durationDays: {
        type: String,
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
    },
    certificateUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
}, { timestamps: true });

workshopSchema.index({ facultyId: 1 });
workshopSchema.index({ academicYear: 1 });
workshopSchema.index({ role: 1 });
workshopSchema.index({ facultyId: 1, academicYear: 1 });
workshopSchema.index({ title: 'text', institution: 'text' });

module.exports = mongoose.model('Workshop', workshopSchema);
