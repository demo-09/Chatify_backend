import Snap from "../models/snap.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendSnap = async (req, res) => {
  try {
    const { mediaUrl, receiverId, type } = req.body;
    const senderId = req.user._id;

    if (!mediaUrl || !receiverId) {
      return res.status(400).json({ message: "Media URL and receiver ID are required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(mediaUrl, {
      resource_type: type === "video" ? "video" : "image",
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h default expiry

    const newSnap = new Snap({
      sender: senderId,
      receiver: receiverId,
      mediaUrl: uploadResponse.secure_url,
      type: type || "image",
      expiresAt,
    });

    await newSnap.save();

    const populatedSnap = await Snap.findById(newSnap._id)
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    // Realtime notification
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newSnap", populatedSnap);
    }

    res.status(201).json(populatedSnap);
  } catch (error) {
    console.error("Error in sendSnap controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSnaps = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get snaps sent to the user, and snaps sent by the user
    const snaps = await Snap.find({
      $or: [{ receiver: userId }, { sender: userId }],
    })
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(snaps);
  } catch (error) {
    console.error("Error in getSnaps controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const openSnap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const snap = await Snap.findById(id);

    if (!snap) {
      return res.status(404).json({ message: "Snap not found" });
    }

    if (snap.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to open this snap" });
    }

    if (snap.status === "opened") {
      return res.status(400).json({ message: "Snap already opened" });
    }

    // Capture media URL before destroying
    const mediaToView = snap.mediaUrl;

    // Mark as opened
    snap.status = "opened";
    
    // We intentionally do NOT delete the mediaUrl immediately because the client needs it to display the snap for X seconds.
    // However, if we wanted strict security, we could generate a signed URL that expires in 10 seconds.
    // For now, we rely on the frontend to hide it after viewing.
    
    await snap.save();

    // Notify sender that their snap was opened
    const senderSocketId = getReceiverSocketId(snap.sender);
    if (senderSocketId) {
      io.to(senderSocketId).emit("snapOpened", { snapId: snap._id });
    }

    res.status(200).json({ message: "Snap opened", mediaUrl: mediaToView });
  } catch (error) {
    console.error("Error in openSnap controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
