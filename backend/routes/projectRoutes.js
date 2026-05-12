import express from "express";
import { getProjectByUser, updateProgress, undoProgress } from "../controllers/projectController.js";

const router = express.Router();

router.get("/user/:userId", getProjectByUser);
router.patch("/:id/progress", updateProgress);
router.patch("/:id/undo", undoProgress);

export default router;
