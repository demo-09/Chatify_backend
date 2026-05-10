import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendSnap, getSnaps, openSnap } from "../controllers/snap.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendSnap);
router.get("/", protectRoute, getSnaps);
router.put("/open/:id", protectRoute, openSnap);

export default router;
