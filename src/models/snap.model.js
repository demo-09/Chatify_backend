import mongoose from "mongoose";

const snapSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    status: {
      type: String,
      enum: ["new", "opened"],
      default: "new",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto delete after 24h of creation to prevent infinite storage
    },
  },
  { timestamps: true }
);

const Snap = mongoose.model("Snap", snapSchema);

export default Snap;
