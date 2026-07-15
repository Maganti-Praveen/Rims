const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
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
    journalName: {
        type: String,
        trim: true,
    },
    issn: {
        type: String,
        trim: true,
    },
    volume: {
        type: String,
        trim: true,
    },
    doi: {
        type: String,
        trim: true,
    },
    publicationType: {
        type: String,
        enum: ['Book', 'Chapter'],
        required: true,
    },
    indexedType: {
        type: String,
        enum: ['SCI', 'Scopus', 'SEI', 'UGC', 'IEEE Conference', 'Other'],
    },
    academicYear: {
        type: String,
        trim: true,
    },
    researchDomain: {
        type: String,
        trim: true,
    },
    publicationDate: {
        type: Date,
    },
    fileUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
}, { timestamps: true });

bookSchema.index({ facultyId: 1 });
bookSchema.index({ academicYear: 1 });
bookSchema.index({ publicationType: 1 });
bookSchema.index({ indexedType: 1 });
bookSchema.index({ researchDomain: 1 });
bookSchema.index({ facultyId: 1, academicYear: 1 });
bookSchema.index({ title: 'text', journalName: 'text', doi: 'text' });

module.exports = mongoose.model('Book', bookSchema);
