import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Story from "../models/story.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalStories = await Story.countDocuments();

    // Get messages from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({ createdAt: { $gte: yesterday } });

    // Activity trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityData = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent activity list
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentMsgs = await Message.find().populate("senderId", "fullName").sort({ createdAt: -1 }).limit(5);

    const recentActivity = [
      ...recentUsers.map(u => ({
        user: u.fullName,
        action: "joined ChatFy",
        time: u.createdAt,
        type: "user"
      })),
      ...recentMsgs.map(m => ({
        user: m.senderId?.fullName || "Unknown",
        action: "sent a message",
        time: m.createdAt,
        type: "message"
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 5);

    res.status(200).json({
      totalUsers,
      totalMessages,
      totalStories,
      recentMessages,
      activityData,
      recentActivity
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersList = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersList:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
