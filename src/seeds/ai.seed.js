import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedAI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const aiUser = await User.findOne({ email: "ai@chatify.com" });

    if (!aiUser) {
      const newAI = new User({
        fullName: "AI Assistant",
        email: "ai@chatify.com",
        password: "ai-assistant-secret-password", // Not really used
        profilePic: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
        isVerified: true,
      });
      await newAI.save();
      console.log("AI Assistant user seeded successfully");
    } else {
      console.log("AI Assistant user already exists");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding AI Assistant:", error);
    process.exit(1);
  }
};

seedAI();
