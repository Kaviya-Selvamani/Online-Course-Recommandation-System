import express from 'express';
import {
  clearLearningHistory,
  enrollInCourse,
  getHealth,
  getMe,
  login,
  recalcRecommendations,
  resetRecommendationProfile,
  signup,
  unenrollInCourse,
  updateEmail,
  updateNotificationSettings,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile/update", protect, updateProfile);
router.patch("/email", protect, updateEmail);
router.patch("/password", protect, updatePassword);
router.patch("/notifications", protect, updateNotificationSettings);
router.post("/recommendations/recalculate", protect, recalcRecommendations);
router.post("/recommendations/reset", protect, resetRecommendationProfile);
router.delete("/history", protect, clearLearningHistory);
router.get("/health", getHealth);
router.post("/enroll", protect, enrollInCourse);
router.post("/unenroll", protect, unenrollInCourse);

export default router;
