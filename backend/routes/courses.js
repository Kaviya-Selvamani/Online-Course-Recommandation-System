import express from 'express';
import {
  createCourse,
  enrollInCourse,
  getBasicRecommendations,
  getCourseById,
  getCourses,
  getRecommendationsForUser,
} from "../controllers/courseController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/recommendations/:userId", getRecommendationsForUser);
router.get("/:id", getCourseById);
router.post("/", protect, adminOnly, createCourse);
router.post("/recommendations", protect, getBasicRecommendations);
router.post("/enroll", protect, enrollInCourse);

export default router;
