import Call from "../models/call.model.js";

export const logCall = async (req, res) => {
  try {
    const { receiverId, type, status, duration, startedAt, endedAt } = req.body;
    const callerId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const newCall = new Call({
      caller: callerId,
      receiver: receiverId,
      type: type || "video",
      status: status || "completed",
      duration: duration || 0,
      startedAt: startedAt || Date.now(),
      endedAt: endedAt || Date.now(),
    });

    await newCall.save();

    const populatedCall = await Call.findById(newCall._id)
      .populate("caller", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    res.status(201).json(populatedCall);
  } catch (error) {
    console.error("Error in logCall controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "fullName profilePic")
      .populate("receiver", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    console.error("Error in getCallHistory controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
