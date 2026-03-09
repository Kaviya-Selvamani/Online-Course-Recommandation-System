import express from 'express';
import {
  createCourse,
  enrollInCourse,
  getBasicRecommendations,
  getCourses,
} from "../controllers/courseController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.post("/", protect, adminOnly, createCourse);
router.post("/recommendations", protect, getBasicRecommendations);
router.post("/enroll", protect, enrollInCourse);

export default router;
