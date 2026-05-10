import express from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getDashboardStats, getUsersList, updateUserRole, deleteUser } from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes are protected by authentication AND admin role check
router.use(protectRoute, requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getUsersList);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
