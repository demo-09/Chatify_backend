import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { logCall, getCallHistory } from "../controllers/call.controller.js";

const router = express.Router();

router.post("/log", protectRoute, logCall);
router.get("/history", protectRoute, getCallHistory);

export default router;
