import express from 'express';
import {
  addBookmark,
  createCourse,
  getMyBookmarks,
  enrollInCourse,
  getBasicRecommendations,
  getCourseById,
  getCourses,
  getRecommendationsForUser,
  removeBookmark,
} from "../controllers/courseController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/bookmarks/me", protect, getMyBookmarks);
router.post("/bookmarks/:courseId", protect, addBookmark);
router.delete("/bookmarks/:courseId", protect, removeBookmark);
router.get("/recommendations/:userId", getRecommendationsForUser);
router.get("/:id", getCourseById);
router.post("/", protect, adminOnly, createCourse);
router.post("/recommendations", protect, getBasicRecommendations);
router.post("/enroll", protect, enrollInCourse);

export default router;
