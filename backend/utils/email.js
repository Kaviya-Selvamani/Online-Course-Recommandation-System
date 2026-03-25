import nodemailer from "nodemailer";

let cachedTransporter = null;

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (!host || !user || !pass) {
    throw new Error("Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, text, html }) {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("EMAIL_FROM is not set.");
  }

  return cachedTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
