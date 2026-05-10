import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { chatWithAI, analyzeImage } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAI);
router.post("/analyze-image", protectRoute, analyzeImage);

export default router;
