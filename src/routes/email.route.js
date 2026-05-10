import express from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { sendCampaign } from "../controllers/email.controller.js";

const router = express.Router();

router.post("/send-campaign", protectRoute, requireAdmin, sendCampaign);

export default router;
