const EmailTemplate = require('../models/EmailTemplate');
const { defaultTemplates } = require('../utils/autoSeedEmailTemplates');
const logActivity = require('../utils/logActivity');

// @desc    Get all email templates
// @route   GET /api/email-templates
exports.getEmailTemplates = async (req, res, next) => {
    try {
        const templates = await EmailTemplate.find().sort({ key: 1 });
        res.json({ success: true, data: templates });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single email template by key
// @route   GET /api/email-templates/:key
exports.getEmailTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findOne({ key: req.params.key });
        if (!template) {
            return res.status(404).json({ success: false, message: 'Email template not found' });
        }
        res.json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};

// @desc    Update email template
// @route   PUT /api/email-templates/:key
exports.updateEmailTemplate = async (req, res, next) => {
    try {
        const {
            subject,
            headlineText,
            messageText,
            buttonText,
            footerNotice,
            primaryColor,
            secondaryColor,
            buttonColor,
            body,
        } = req.body;

        if (!subject) {
            return res.status(400).json({ success: false, message: 'Subject line is required' });
        }

        const template = await EmailTemplate.findOneAndUpdate(
            { key: req.params.key },
            {
                subject,
                headlineText: headlineText || '',
                messageText: messageText || '',
                buttonText: buttonText || '',
                footerNotice: footerNotice || '',
                primaryColor: primaryColor || '#c2410c',
                secondaryColor: secondaryColor || '#ea580c',
                buttonColor: buttonColor || '#ea580c',
                body: body || '',
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({ success: false, message: 'Email template not found' });
        }

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Setting',
            targetId: template._id,
            details: `Customized email template for ${template.name}`,
        });

        res.json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset email template to factory default
// @route   POST /api/email-templates/:key/reset
exports.resetEmailTemplate = async (req, res, next) => {
    try {
        const defaultTpl = defaultTemplates.find(t => t.key === req.params.key);
        if (!defaultTpl) {
            return res.status(404).json({ success: false, message: 'Default template not found for key' });
        }

        const template = await EmailTemplate.findOneAndUpdate(
            { key: req.params.key },
            {
                subject: defaultTpl.subject,
                headlineText: defaultTpl.headlineText || '',
                messageText: defaultTpl.messageText || '',
                buttonText: defaultTpl.buttonText || '',
                footerNotice: defaultTpl.footerNotice || '',
                primaryColor: defaultTpl.primaryColor || '#c2410c',
                secondaryColor: defaultTpl.secondaryColor || '#ea580c',
                buttonColor: defaultTpl.buttonColor || '#ea580c',
                body: defaultTpl.body || '',
                updatedAt: Date.now(),
            },
            { new: true }
        );

        await logActivity({
            userId: req.user._id,
            role: req.user.role,
            action: 'Update',
            category: 'Setting',
            targetId: template._id,
            details: `Reset email template for ${template.name} to default`,
        });

        res.json({ success: true, data: template, message: 'Email template reset to default' });
    } catch (error) {
        next(error);
    }
};
