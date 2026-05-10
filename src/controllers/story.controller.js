import Story from "../models/story.model.js";
import cloudinary from "../lib/cloudinary.js";

export const uploadStory = async (req, res) => {
  try {
    const { mediaUrl, type } = req.body;
    const userId = req.user._id;

    if (!mediaUrl) {
      return res.status(400).json({ message: "Media URL (image/video) is required" });
    }

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(mediaUrl, {
      resource_type: type === "video" ? "video" : "image",
    });

    // Calculate expiration date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStory = new Story({
      user: userId,
      mediaUrl: uploadResponse.secure_url,
      type: type || "image",
      expiresAt,
    });

    await newStory.save();

    // Populate user info before sending response
    const populatedStory = await Story.findById(newStory._id).populate("user", "fullName profilePic");

    res.status(201).json(populatedStory);
  } catch (error) {
    console.error("Error in uploadStory controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveStories = async (req, res) => {
  try {
    // Find all stories that haven't expired
    // The TTL index will auto-delete them eventually, but we also filter here just in case the job hasn't run
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getActiveStories controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Add user to views array if not already there
    if (!story.views.includes(userId)) {
      story.views.push(userId);
      await story.save();
    }

    res.status(200).json({ message: "Story viewed" });
  } catch (error) {
    console.error("Error in viewStory controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
