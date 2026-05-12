import express from "express";
import { addFeedback, getFeedbackByProject, markFeedbackRead } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", addFeedback);
router.get("/project/:projectId", getFeedbackByProject);
router.patch("/project/:projectId/read", markFeedbackRead);

export default router;
