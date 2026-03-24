const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    degree: {
        type: String,
        required: [true, 'Please add a degree'],
        trim: true,
    },
    university: {
        type: String,
        required: [true, 'Please add a university'],
        trim: true,
    },
    specialization: {
        type: String,
        trim: true,
    },
    year: {
        type: String,
        trim: true,
    },
    isHighest: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
