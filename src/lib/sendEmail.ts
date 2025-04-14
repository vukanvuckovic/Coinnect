import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const EMAIL_TEMPLATES = {
  welcome: `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="margin-bottom: 12px;">Welcome to Coinnect!</h2>
      <p style="margin-bottom: 12px;">Manage your finances effortlessly and securely.</p>
      <a href="${APP_URL}" style="display: inline-block; padding: 10px 20px; background-color: #0179FE; color: #ffffff; text-decoration: none; border-radius: 5px;">
        Get Started
      </a>
    </div>
  `,
  payment: `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="margin-bottom: 12px;">You have received a new payment!</h2>
      <p style="margin-bottom: 12px;">See the details about this latest transaction below.</p>
      <a href="${APP_URL}/accounts" style="display: inline-block; padding: 10px 20px; background-color: #0179FE; color: #ffffff; text-decoration: none; border-radius: 5px;">
        Check Accounts
      </a>
    </div>
  `,
  sent: `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="margin-bottom: 12px;">Your payment was processed successfully!</h2>
      <p style="margin-bottom: 12px;">The payment is confirmed. See the details about this transaction below.</p>
      <a href="${APP_URL}/accounts" style="display: inline-block; padding: 10px 20px; background-color: #0179FE; color: #ffffff; text-decoration: none; border-radius: 5px;">
        Check Accounts
      </a>
    </div>
  `,
};

export const sendEmail = async (
  to: string,
  message: string,
  type: "welcome" | "payment" | "sent"
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Coinnect Mailer <${process.env.EMAIL_USER}>`,
    to,
    subject: "Notification from Coinnect",
    html: EMAIL_TEMPLATES[type],
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch {
    return false;
  }
};
