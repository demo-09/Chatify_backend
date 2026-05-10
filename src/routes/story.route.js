import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadStory, getActiveStories, viewStory } from "../controllers/story.controller.js";

const router = express.Router();

router.post("/upload", protectRoute, uploadStory);
router.get("/", protectRoute, getActiveStories);
router.put("/view/:id", protectRoute, viewStory);

export default router;
