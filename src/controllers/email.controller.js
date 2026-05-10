import nodemailer from "nodemailer";
import User from "../models/user.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendCampaign = async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required" });
    }

    const users = await User.find({}, "email");
    const emailList = users.map((u) => u.email);

    if (emailList.length === 0) {
      return res.status(400).json({ message: "No users found to send emails to" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailList,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h1 style="color: #7c6ff7;">ChatFy Announcement</h1>
          <div style="font-size: 16px; line-height: 1.5; color: #333;">
            ${body}
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">You received this because you are a registered user of ChatFy.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Campaign sent successfully to ${emailList.length} users.` });
  } catch (error) {
    console.error("Error sending campaign:", error);
    res.status(500).json({ message: "Failed to send campaign" });
  }
};
