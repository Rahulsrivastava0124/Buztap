const nodemailer = require("nodemailer");

function firstNonEmpty(...values) {
  for (const value of values) {
    if (String(value || "").trim()) return value;
  }
  return "";
}

function getMailConfig() {
  const provider = String(process.env.MAIL_PROVIDER || "godaddy")
    .trim()
    .toLowerCase();

  const host = firstNonEmpty(
    process.env.MAIL_HOST,
    process.env.SMTP_HOST,
    provider === "godaddy" ? "smtpout.secureserver.net" : "",
  );
  const user = firstNonEmpty(process.env.MAIL_USER, process.env.SMTP_USER);
  const pass = firstNonEmpty(process.env.MAIL_PASS, process.env.SMTP_PASS);
  const from = firstNonEmpty(
    process.env.MAIL_FROM,
    process.env.SMTP_FROM,
    user,
  );
  const senderName = firstNonEmpty(
    process.env.MAIL_SENDER_NAME,
    process.env.SMTP_SENDER_NAME,
    "BuzTap",
  );

  if (provider === "godaddy") {
    return {
      host,
      port: Number(process.env.MAIL_PORT || 465),
      secure: String(process.env.MAIL_SECURE || "true") === "true",
      user,
      pass,
      from,
      senderName,
    };
  }

  return {
    host,
    port: Number(process.env.MAIL_PORT || 587),
    secure: String(process.env.MAIL_SECURE || "false") === "true",
    user,
    pass,
    from,
    senderName,
  };
}

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const cfg = getMailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    throw new Error(
      "Email configuration missing: set MAIL_USER and MAIL_PASS (optional: MAIL_HOST, MAIL_FROM)",
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  return cachedTransporter;
}

async function sendOtpEmail({ to, otp, purpose }) {
  const transporter = getTransporter();
  const cfg = getMailConfig();
  const fixedFrom = `${cfg.senderName} <${cfg.from}>`;
  const subject =
    purpose === "register"
      ? "Your BuzTap registration verification code"
      : purpose === "reset-password"
        ? "Your BuzTap password reset verification code"
        : "Your BuzTap login verification code";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.4;color:#111;max-width:560px">
      <h2 style="margin:0 0 12px">BuzTap Email Verification</h2>
      <p style="margin:0 0 8px">Use the OTP below to continue your ${purpose}:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${otp}</p>
      <p style="margin:0 0 8px">This code expires in 10 minutes.</p>
      <p style="margin:0;color:#666;font-size:12px">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fixedFrom,
    sender: fixedFrom,
    envelope: {
      from: cfg.from,
      to,
    },
    replyTo: cfg.from,
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail };
