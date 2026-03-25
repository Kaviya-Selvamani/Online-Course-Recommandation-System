import express from 'express';
import {
  enrollInCourse,
  getHealth,
  getMe,
  login,
  resendVerification,
  resetPassword,
  sendPasswordReset,
  signup,
  unenrollInCourse,
  updateProfile,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", sendPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile/update", protect, updateProfile);
router.get("/health", getHealth);
router.post("/enroll", protect, enrollInCourse);
router.post("/unenroll", protect, unenrollInCourse);

export default router;
