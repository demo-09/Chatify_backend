import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Validate env variables early (prevents runtime 500 crashes)
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
}

// ✅ Create transporter safely
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
  },
});

// Optional: verify connection at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter config error:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

export const sendEmail = async (to, subject, text, html) => {
  if (!to) throw new Error("Recipient email is missing");

  try {
    const mailOptions = {
      from: `"Chatify" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };
console.log( process.env.EMAIL_USER+process.env.EMAIL_PASS);
    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.log( process.env.EMAIL_USER+process.env.EMAIL_PASS);
    console.error("❌ Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
};

export const sendOtpEmail = async (email, otp) => {
  if (!email) throw new Error("Email is required");
  if (!otp) throw new Error("OTP is required");

  const subject = "Your Chatify Verification Code";

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0A0A0B; color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #CCFF00;">
      <h1 style="color: #CCFF00; text-align: center;">CHATIFY</h1>

      <p style="font-size: 18px; text-align: center;">
        Your verification code is:
      </p>

      <div style="background-color: #1F1F23; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <span style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #CCFF00;">
          ${otp}
        </span>
      </div>

      <p style="text-align: center; color: #a1a1aa;">
        This code will expire in 10 minutes.
      </p>

      <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 40px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail(email, subject, `Your OTP is ${otp}`, html);
};
