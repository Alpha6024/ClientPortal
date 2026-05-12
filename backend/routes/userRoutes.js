import express from "express";
import { upsertUser, getUsers, getUserById, updateUserStatus, getStats, getUserBySupabaseId } from "../controllers/userController.js";

const router = express.Router();

router.post("/upsert", upsertUser);
router.get("/", getUsers);
router.get("/stats", getStats);
router.get("/supabase/:supabaseId", getUserBySupabaseId);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);

export default router;
