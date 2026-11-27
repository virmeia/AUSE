// backend/src/utils/mailer.js
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

/**
 * Send a transactional email to a customer or admin.
 * Fails gracefully if SMTP is not configured in .env.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return false;
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`📧 [Email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"AUSE Appliance Care" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    return true;
  } catch (err) {
    console.error('📧 Email send error:', err.message);
    return false;
  }
};

const sendUserEmail = async (pool, userId, subject, message) => {
  try {
    const [[user]] = await pool.query(
      'SELECT email, full_name FROM users WHERE user_id = ?',
      [userId]
    );
    if (!user?.email) return false;
    return sendEmail({
      to: user.email,
      subject,
      text: `Hi ${user.full_name || 'Customer'},\n\n${message}\n\n— AUSE Appliance Care`,
      html: `<div style="font-family:sans-serif;color:#0f172a;line-height:1.6">
        <p>Hi <strong>${user.full_name || 'Customer'}</strong>,</p>
        <p>${message}</p>
        <p style="margin-top:20px;color:#64748b;font-size:12px;">AUSE Appliance Care • Metro Manila Home Service</p>
      </div>`,
    });
  } catch (err) {
    console.error('📧 sendUserEmail error:', err.message);
    return false;
  }
};

module.exports = { sendEmail, sendUserEmail };
