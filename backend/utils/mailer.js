const nodemailer = require('nodemailer');
const os   = require('os');
const path = require('path');
const fs   = require('fs');

// Auto-detect local network IP
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
};
const getFrontendUrl = () => {
    const port = process.env.VITE_FRONTEND_PORT || 5173;
    return `http://${getLocalIP()}:${port}`;
};

// Logo
const logoPath       = path.join(__dirname, '../logo/rcee.png');
const hasLogo        = fs.existsSync(logoPath);
const logoAttachment = hasLogo ? [{
    filename: 'rcee.png', path: logoPath,
    cid: 'rceelogo', contentDisposition: 'inline',
}] : [];

/* ── Shared pieces with Dynamic Color Support ─────────────────── */

const buildHeader = (primaryColor = '#c2410c', secondaryColor = '#ea580c') => `
  <div style="background:linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);padding:24px 32px;">
    ${hasLogo
        ? `<img src="cid:rceelogo" alt="RCEE RIMS" style="height:48px;object-fit:contain;display:block;margin-bottom:10px;" />`
        : `<p style="margin:0 0 4px;font-size:11px;color:#ffffff;opacity:0.85;letter-spacing:0.08em;text-transform:uppercase;">Ramachandra College of Engineering</p>`
    }
    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">RCEE RIMS</p>
    <p style="margin:4px 0 0;font-size:11px;color:#ffffff;opacity:0.85;">Research Information Management System</p>
  </div>`;

const emailFooter = `
  <div style="background:#fff7ed;border-top:2px solid #fed7aa;padding:14px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#a8a29e;">
      © ${new Date().getFullYear()} <strong style="color:#ea580c;">Ramachandra College of Engineering &amp; Technology</strong><br>
      Support: <a href="mailto:rcee.rims@gmail.com" style="color:#ea580c;text-decoration:none;">rcee.rims@gmail.com</a>
    </p>
  </div>`;

const wrapWithColors = (body, primaryColor = '#c2410c', secondaryColor = '#ea580c') => `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f4;padding:30px 16px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    ${buildHeader(primaryColor, secondaryColor)}
    <div style="padding:28px 32px;color:#292524;line-height:1.6;">
      ${body}
    </div>
    ${emailFooter}
  </div>
</div>`;

const btnWithColor = (href, label, color = '#ea580c') =>
    `<div style="text-align:center;margin:28px 0;">
       <a href="${href}" style="background:${color};color:#ffffff;padding:13px 32px;
          text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;display:inline-block;
          box-shadow:0 4px 12px rgba(0,0,0,0.15);">${label}</a>
     </div>`;

const infoTable = (rows, primaryColor = '#9a3412') =>
    `<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
       ${rows.map(([k, v]) => `
       <tr>
         <td style="padding:8px 12px;font-weight:600;color:${primaryColor};background:#fff7ed;
                    border:1px solid #fed7aa;width:35%;">${k}</td>
         <td style="padding:8px 12px;border:1px solid #fed7aa;">${v}</td>
       </tr>`).join('')}
     </table>`;

const EmailTemplate = require('../models/EmailTemplate');

/* Helper to render custom DB template or fallback */
const renderTemplate = async (key, variables, fallbackSubject, fallbackBody) => {
    let subject = fallbackSubject;
    let body = fallbackBody;
    let primaryColor = '#c2410c';
    let secondaryColor = '#ea580c';
    let buttonColor = '#ea580c';

    try {
        const tpl = await EmailTemplate.findOne({ key });
        if (tpl) {
            subject = tpl.subject;
            primaryColor = tpl.primaryColor || '#c2410c';
            secondaryColor = tpl.secondaryColor || '#ea580c';
            buttonColor = tpl.buttonColor || '#ea580c';

            if (tpl.headlineText || tpl.messageText) {
                let constructedBody = `<p style="margin:0 0 4px;font-size:16px;font-weight:700;color:${primaryColor};">${tpl.headlineText}</p>`;
                constructedBody += `<p style="color:#57534e;margin:8px 0 16px;">${tpl.messageText}</p>`;

                if (key === 'welcome') {
                    constructedBody += infoTable([
                        ['Name', '{name}'],
                        ['Email', '{email}'],
                        ['Department', '{department}'],
                        ['Role', '{role}'],
                        ['Password', `<code style="background:#fff7ed;padding:2px 8px;border-radius:4px;color:${primaryColor};font-weight:700;">{password}</code>`],
                    ], primaryColor);
                    if (tpl.buttonText && variables.loginUrl) {
                        constructedBody += btnWithColor(variables.loginUrl, tpl.buttonText, buttonColor);
                    }
                } else if (key === 'passwordReset') {
                    if (tpl.buttonText && variables.resetUrl) {
                        constructedBody += btnWithColor(variables.resetUrl, tpl.buttonText, buttonColor);
                    }
                } else if (key === 'broadcast') {
                    if (tpl.buttonText && variables.actionUrl) {
                        constructedBody += btnWithColor(variables.actionUrl, tpl.buttonText, buttonColor);
                    }
                }

                if (tpl.footerNotice) {
                    constructedBody += `<div style="background:#fff7ed;border-left:3px solid ${primaryColor};padding:10px 14px;margin-top:16px;font-size:12px;color:#78716c;">${tpl.footerNotice}</div>`;
                }

                body = constructedBody;
            } else if (tpl.body) {
                body = tpl.body;
            }
        }
    } catch (err) {
        console.error(`[Mailer] Warning: Failed to load template '${key}':`, err.message);
    }

    Object.keys(variables).forEach((v) => {
        const val = variables[v] !== undefined ? variables[v] : '';
        const regex = new RegExp(`\\{${v}\\}`, 'g');
        subject = subject.replace(regex, val);
        body = body.replace(regex, val);
    });

    return { subject, html: wrapWithColors(body, primaryColor, secondaryColor) };
};

/* Transporter */
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/* ── Welcome Email ─────────────────────────────────────────── */
exports.sendWelcomeEmail = async (user, plainPassword) => {
    const loginUrl = getFrontendUrl();
    const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const defaultBody = `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#9a3412;">Welcome, {name}! 🎉</p>
<p style="color:#57534e;margin:8px 0 16px;">
  Your account has been successfully created in the
  <strong style="color:#9a3412;">RCEE Research Information Management System (RIMS)</strong>.
  Please find your login details below:
</p>
${infoTable([
    ['Name',       '{name}'],
    ['Email',      '{email}'],
    ['Department', '{department}'],
    ['Role',       '{role}'],
    ['Password',   `<code style="background:#fff7ed;padding:2px 8px;border-radius:4px;color:#ea580c;font-weight:700;">{password}</code>`],
])}
${btnWithColor(loginUrl, 'Login to RIMS →', '#ea580c')}
<p style="font-size:12px;color:#a8a29e;border-left:3px solid #fed7aa;padding-left:10px;margin-top:8px;">
  After logging in, please update your profile and add your research details such as publications, patents, workshops, and seminars.
</p>`;

    const { subject, html } = await renderTemplate(
        'welcome',
        {
            name: user.name,
            email: user.email,
            department: user.department,
            role: roleCapitalized,
            password: plainPassword,
            loginUrl,
        },
        'Welcome to RCEE RIMS – Your Account Details',
        defaultBody
    );

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html,
        attachments: logoAttachment,
    });
};

/* ── Password Reset Email ──────────────────────────────────── */
exports.sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    const defaultBody = `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#9a3412;">Hello, {name}</p>
<p style="color:#57534e;margin:8px 0 16px;">
  A request has been received to reset the password for your account in the
  <strong style="color:#9a3412;">RCEE Research Information Management System</strong>.
</p>
<p style="color:#57534e;">Click the button below to set a new password:</p>
${btnWithColor(resetUrl, 'Reset Password →', '#ea580c')}
<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-top:4px;">
  <p style="margin:0;font-size:12px;color:#78716c;">
    ⏰ This link will expire in <strong>15 minutes</strong>.<br>
    If you did not request a password reset, you can safely ignore this email.
  </p>
</div>`;

    const { subject, html } = await renderTemplate(
        'passwordReset',
        {
            name: user.name,
            resetUrl,
        },
        'RCEE RIMS – Password Reset Request',
        defaultBody
    );

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html,
        attachments: logoAttachment,
    });
};

/* ── Broadcast Email ───────────────────────────────────────── */
exports.sendBroadcastEmail = async (recipients, title, message) => {
    const formattedMessage = message ? message.replace(/\n/g, '<br>') : '';
    const displayTitle = title || 'Announcement';

    const defaultBody = `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#9a3412;">{title}</p>
<p style="font-size:14px;color:#44403c;line-height:1.8;margin-top:10px;">
  {message}
</p>`;

    const { subject, html } = await renderTemplate(
        'broadcast',
        {
            title: displayTitle,
            message: formattedMessage,
        },
        `RCEE RIMS – ${displayTitle}`,
        defaultBody
    );

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        bcc: recipients.map(r => r.email),
        subject,
        html,
        attachments: logoAttachment,
    });
};
