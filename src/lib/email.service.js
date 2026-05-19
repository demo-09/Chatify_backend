import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ==============================
// Validate Environment Variables
// ==============================
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment");

    process.exit(1);
}

// ==============================
// Create Transporter
// ==============================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    },

    tls: {
        rejectUnauthorized: false,
    },

    // Prevent infinite loading
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// ==============================
// Verify SMTP Connection
// ==============================
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Verification Error:");
        console.error(error);
    } else {
        console.log("✅ Email transporter ready");
    }
});

// ==============================
// Send Generic Email
// ==============================
export const sendEmail = async (to, subject, text, html) => {
    try {
        console.log("=================================");
        console.log("📧 STARTING EMAIL SEND");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log(
            "EMAIL_PASS EXISTS:",
            process.env.EMAIL_PASS ? "YES" : "NO"
        );
        console.log("=================================");

        if (!to) {
            throw new Error("Recipient email is missing");
        }

        const mailOptions = {
            from: `"Chatify" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        console.log("⏳ Sending email...");

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully");
        console.log("Message ID:", info.messageId);

        return {
            success: true,
            info,
        };
    } catch (error) {
        console.error("❌ EMAIL SEND ERROR");
        console.error(error);

        return {
            success: false,
            error: error.message,
        };
    }
};

// ==============================
// Send OTP Email
// ==============================
export const sendOtpEmail = async (email, otp) => {
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        if (!otp) {
            throw new Error("OTP is required");
        }

        console.log("🔐 Generating OTP email for:", email);

        const subject = "Your Chatify Verification Code";

        const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0A0A0B; color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #CCFF00;">
        
        <h1 style="color: #CCFF00; text-align: center;">
          CHATIFY
        </h1>

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

        const result = await sendEmail(
            email,
            subject,
            `Your OTP is ${otp}`,
            html
        );

        return result;
    } catch (error) {
        console.error("❌ OTP EMAIL ERROR");
        console.error(error);

        return {
            success: false,
            error: error.message,
        };
    }
};