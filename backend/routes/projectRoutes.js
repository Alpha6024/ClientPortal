import express from "express";
import { getProjectByUser, updateProgress, undoProgress, updateProjectDetails, deleteUser } from "../controllers/projectController.js";

const router = express.Router();

router.get("/user/:userId", getProjectByUser);
router.patch("/:id/progress", updateProgress);
router.patch("/:id/undo", undoProgress);
router.patch("/:id/details", updateProjectDetails);
router.delete("/user/:userId", deleteUser);

export default router;
