const mongoose = require('mongoose');

const seminarSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: String,
        required: [true, 'Please add a topic'],
        trim: true,
    },
    institution: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
    },
    academicYear: {
        type: String,
        trim: true,
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
    },
}, { timestamps: true });

seminarSchema.index({ facultyId: 1 });
seminarSchema.index({ academicYear: 1 });
seminarSchema.index({ facultyId: 1, academicYear: 1 });
seminarSchema.index({ topic: 'text', institution: 'text' });

module.exports = mongoose.model('Seminar', seminarSchema);
