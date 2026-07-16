const EmailTemplate = require('../models/EmailTemplate');

const defaultTemplates = [
    {
        key: 'welcome',
        name: 'Welcome Email',
        description: 'Sent automatically when a new faculty or user account is created by Admin/HOD.',
        subject: 'Welcome to RCEE RIMS – Your Account Details',
        headlineText: 'Welcome, {name}! 🎉',
        messageText: 'Your account has been successfully created in the RCEE Research Information Management System (RIMS). Please find your login credentials below:',
        buttonText: 'Login to RIMS →',
        footerNotice: 'After logging in, please update your profile and add your research details such as publications, patents, workshops, and seminars.',
        primaryColor: '#c2410c',
        secondaryColor: '#ea580c',
        buttonColor: '#ea580c',
        availablePlaceholders: [
            { variable: '{name}', description: 'Full name of the recipient' },
            { variable: '{email}', description: 'Login email address' },
            { variable: '{department}', description: 'Assigned department' },
            { variable: '{role}', description: 'User role (Faculty/HOD/Dean)' },
            { variable: '{password}', description: 'Plain text temporary password' },
            { variable: '{loginUrl}', description: 'URL link to the login page' },
        ],
    },
    {
        key: 'passwordReset',
        name: 'Password Reset Email',
        description: 'Sent when a user requests a password reset token link.',
        subject: 'RCEE RIMS – Password Reset Request',
        headlineText: 'Hello, {name}',
        messageText: 'A request has been received to reset the password for your account in the RCEE Research Information Management System. Click the button below to set a new password:',
        buttonText: 'Reset Password →',
        footerNotice: '⏰ This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.',
        primaryColor: '#c2410c',
        secondaryColor: '#ea580c',
        buttonColor: '#ea580c',
        availablePlaceholders: [
            { variable: '{name}', description: 'Name of the user requesting password reset' },
            { variable: '{resetUrl}', description: 'Unique, 15-minute expiring password reset link' },
        ],
    },
    {
        key: 'broadcast',
        name: 'Broadcast Announcement Email',
        description: 'Sent when Admin or HOD broadcasts an in-app notification with email enabled.',
        subject: 'RCEE RIMS – {title}',
        headlineText: '{title}',
        messageText: '{message}',
        buttonText: 'View Announcement →',
        footerNotice: 'Sent via RCEE RIMS Notification System',
        primaryColor: '#c2410c',
        secondaryColor: '#ea580c',
        buttonColor: '#ea580c',
        availablePlaceholders: [
            { variable: '{title}', description: 'Title of the announcement' },
            { variable: '{message}', description: 'Main notification message text' },
        ],
    },
];

const seedEmailTemplates = async () => {
    try {
        for (const tpl of defaultTemplates) {
            const exists = await EmailTemplate.findOne({ key: tpl.key });
            if (!exists) {
                await EmailTemplate.create(tpl);
                console.log(`[AutoSeed] Seeded default email template: ${tpl.name}`);
            }
        }
    } catch (err) {
        console.error('[AutoSeed] Error seeding email templates:', err.message);
    }
};

module.exports = { seedEmailTemplates, defaultTemplates };
