import express from 'express';
import {
  enrollInCourse,
  getHealth,
  getMe,
  login,
  signup,
  unenrollInCourse,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile/update", protect, updateProfile);
router.get("/health", getHealth);
router.post("/enroll", protect, enrollInCourse);
router.post("/unenroll", protect, unenrollInCourse);

export default router;
