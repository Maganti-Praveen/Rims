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

/* ── Shared pieces ──────────────────────────────────────────── */

const emailHeader = `
  <div style="background:linear-gradient(135deg,#9a3412 0%,#c2410c 45%,#ea580c 80%,#fb923c 100%);padding:24px 32px;">
    ${hasLogo
        ? `<img src="cid:rceelogo" alt="RCEE RIMS" style="height:48px;object-fit:contain;display:block;margin-bottom:10px;" />`
        : `<p style="margin:0 0 4px;font-size:11px;color:#fed7aa;letter-spacing:0.08em;text-transform:uppercase;">Ramachandra College of Engineering</p>`
    }
    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">RCEE RIMS</p>
    <p style="margin:4px 0 0;font-size:11px;color:#fed7aa;">Research Information Management System</p>
  </div>`;

const emailFooter = `
  <div style="background:#fff7ed;border-top:2px solid #fed7aa;padding:14px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#a8a29e;">
      © ${new Date().getFullYear()} <strong style="color:#ea580c;">Ramachandra College of Engineering &amp; Technology</strong><br>
      Support: <a href="mailto:rcee.rims@gmail.com" style="color:#ea580c;text-decoration:none;">rcee.rims@gmail.com</a>
    </p>
  </div>`;

/* Wrapper keeps max width and rounded card */
const wrap = (body) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f4;padding:30px 16px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    ${emailHeader}
    <div style="padding:28px 32px;color:#292524;line-height:1.6;">
      ${body}
    </div>
    ${emailFooter}
  </div>
</div>`;

/* Orange CTA button */
const btn = (href, label) =>
    `<div style="text-align:center;margin:28px 0;">
       <a href="${href}" style="background:linear-gradient(135deg,#c2410c,#ea580c);color:#ffffff;padding:13px 32px;
          text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;display:inline-block;
          box-shadow:0 4px 12px rgba(234,88,12,0.35);">${label}</a>
     </div>`;

/* Info table rows */
const infoTable = (rows) =>
    `<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
       ${rows.map(([k, v]) => `
       <tr>
         <td style="padding:8px 12px;font-weight:600;color:#9a3412;background:#fff7ed;
                    border:1px solid #fed7aa;width:35%;">${k}</td>
         <td style="padding:8px 12px;border:1px solid #fed7aa;">${v}</td>
       </tr>`).join('')}
     </table>`;

/* Section heading */
const h3 = (text) =>
    `<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#9a3412;">${text}</p>`;

/* Transporter */
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/* ── Welcome Email ─────────────────────────────────────────── */
exports.sendWelcomeEmail = async (user, plainPassword) => {
    const loginUrl = getFrontendUrl();
    const html = wrap(`
      ${h3(`Welcome, ${user.name}! 🎉`)}
      <p style="color:#57534e;margin:8px 0 16px;">
        Your account has been successfully created in the
        <strong style="color:#9a3412;">RCEE Research Information Management System (RIMS)</strong>.
        Please find your login details below:
      </p>
      ${infoTable([
          ['Name',       user.name],
          ['Email',      user.email],
          ['Department', user.department],
          ['Role',       user.role.charAt(0).toUpperCase() + user.role.slice(1)],
          ['Password',   `<code style="background:#fff7ed;padding:2px 8px;border-radius:4px;color:#ea580c;font-weight:700;">${plainPassword}</code>`],
      ])}
      ${btn(loginUrl, 'Login to RIMS →')}
      <p style="font-size:12px;color:#a8a29e;border-left:3px solid #fed7aa;padding-left:10px;margin-top:8px;">
        After logging in, please update your profile and add your research details such as publications, patents, workshops, and seminars.
      </p>
      <p style="margin-top:20px;color:#57534e;">
        Regards,<br><strong style="color:#9a3412;">RCEE RIMS Administration</strong><br>
        Ramachandra College of Engineering
      </p>`);

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to RCEE RIMS – Your Account Details',
        html, attachments: logoAttachment,
    });
};

/* ── Password Reset Email ──────────────────────────────────── */
exports.sendPasswordResetEmail = async (user, resetToken) => {
    const resetLink = `${getFrontendUrl()}/reset-password?token=${resetToken}`;
    const html = wrap(`
      ${h3(`Hello, ${user.name}`)}
      <p style="color:#57534e;margin:8px 0 16px;">
        A request has been received to reset the password for your account in the
        <strong style="color:#9a3412;">RCEE Research Information Management System</strong>.
      </p>
      <p style="color:#57534e;">Click the button below to set a new password:</p>
      ${btn(resetLink, 'Reset Password →')}
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-top:4px;">
        <p style="margin:0;font-size:12px;color:#78716c;">
          ⏰ This link will expire in <strong>15 minutes</strong>.<br>
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
      <p style="margin-top:20px;color:#57534e;">
        Regards,<br><strong style="color:#9a3412;">RCEE RIMS Support Team</strong><br>
        Ramachandra College of Engineering
      </p>`);

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'RCEE RIMS – Password Reset Request',
        html, attachments: logoAttachment,
    });
};

/* ── Broadcast Email ───────────────────────────────────────── */
exports.sendBroadcastEmail = async (recipients, title, message) => {
    const html = wrap(`
      ${title ? h3(title) : ''}
      <p style="font-size:14px;color:#44403c;line-height:1.8;margin-top:10px;">
        ${message.replace(/\n/g, '<br>')}
      </p>
      <p style="margin-top:24px;color:#57534e;">
        Regards,<br><strong style="color:#9a3412;">RCEE RIMS Administration</strong><br>
        Ramachandra College of Engineering
      </p>`);

    await transporter.sendMail({
        from: `"RCEE RIMS" <${process.env.EMAIL_USER}>`,
        to:  process.env.EMAIL_USER,
        bcc: recipients.map(r => r.email),
        subject: title ? `RCEE RIMS – ${title}` : 'RCEE RIMS – Announcement',
        html, attachments: logoAttachment,
    });
};
