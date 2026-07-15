const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
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
    issuedBy: {
        type: String,
        required: [true, 'Please add issuing organization'],
        trim: true,
    },
    date: {
        type: Date,
    },
    enrollDate: {
        type: Date,
    },
    issuedDate: {
        type: Date,
    },
    certificateType: {
        type: String,
        enum: ['NPTEL', 'SWAYAM', 'Coursera', 'Udemy', 'edX', 'AWS', 'Oracle', 'Cisco', 'Google', 'Other'],
    },
    credentialId: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
