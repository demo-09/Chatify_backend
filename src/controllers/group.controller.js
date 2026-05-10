import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, groupIcon } = req.body;
    const admin = req.user._id;

    let iconUrl = "";
    if (groupIcon) {
      const uploadRes = await cloudinary.uploader.upload(groupIcon);
      iconUrl = uploadRes.secure_url;
    }

    const newGroup = new Group({
      name,
      description,
      admin,
      members: [...new Set([...members, admin])], // Ensure admin is in members and no duplicates
      groupIcon: iconUrl,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).populate("members", "fullName profilePic");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getMyGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
