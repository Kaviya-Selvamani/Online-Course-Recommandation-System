import express from "express";
import { getCourseFeedback, submitFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/course/:courseId", getCourseFeedback);
router.post("/", protect, submitFeedback);

export default router;
