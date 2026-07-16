const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['welcome', 'passwordReset', 'broadcast'],
    },
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    headlineText: {
        type: String,
        default: '',
    },
    messageText: {
        type: String,
        default: '',
    },
    buttonText: {
        type: String,
        default: '',
    },
    footerNotice: {
        type: String,
        default: '',
    },
    primaryColor: {
        type: String,
        default: '#c2410c',
    },
    secondaryColor: {
        type: String,
        default: '#ea580c',
    },
    buttonColor: {
        type: String,
        default: '#ea580c',
    },
    body: {
        type: String,
        default: '',
    },
    description: {
        type: String,
    },
    availablePlaceholders: [{
        variable: String,
        description: String,
    }],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
