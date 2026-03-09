import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function buildUserPayload(user, includeToken = false) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillLevel: user.skillLevel,
    interests: user.interests,
    careerGoal: user.careerGoal,
    weeklyLearningHours: user.weeklyLearningHours,
    preferredPlatforms: user.preferredPlatforms,
    learningPreference: user.learningPreference,
    educationLevel: user.educationLevel,
    learningFormat: user.learningFormat,
    enrolledCourses: user.enrolledCourses || [],
    ...(includeToken ? { token: generateToken(user._id, user.role) } : {}),
  };
}

function getWeeklyHoursFromPace(pace) {
  if (pace === "Casual") return 2;
  if (pace === "Steady") return 4;
  if (pace === "Intensive") return 8;
  if (pace === "Full-time") return 15;
  return 4;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim();
}

function isValidRole(role) {
  return role === "student" || role === "admin";
}

export async function signup(req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      adminId,
      skill,
      goal,
      pace,
      interests,
      preferredPlatforms,
      learningPreference,
      educationLevel,
      learningFormat,
    } = req.body || {};

    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName || !normalizedEmail || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required." });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({ error: "Role must be student or admin." });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    if (role === "admin" && (!adminId || adminId !== process.env.ADMIN_SECRET_ID)) {
      return res.status(401).json({ error: "Invalid admin ID." });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res
        .status(409)
        .json({ error: "An account already exists with this email." });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role,
      skillLevel: skill || "Beginner",
      interests: interests || [],
      careerGoal: goal || "",
      weeklyLearningHours: getWeeklyHoursFromPace(pace),
      preferredPlatforms: preferredPlatforms || [],
      learningPreference: learningPreference || "Paid Allowed",
      educationLevel: educationLevel || "",
      learningFormat: learningFormat || "",
    });

    return res.status(201).json(buildUserPayload(user, true));
  } catch (error) {
    console.error("Signup error:", error);
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ error: "An account already exists with this email." });
    }
    return res.status(500).json({ error: "Unable to create account right now." });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role, adminId } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }
    if (!isValidRole(role)) {
      return res.status(400).json({ error: "Role must be student or admin." });
    }
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (role === "admin" && (!adminId || adminId !== process.env.ADMIN_SECRET_ID)) {
      return res.status(401).json({ error: "Invalid admin ID." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    let isPasswordValid = false;
    if (typeof user.password === "string" && BCRYPT_HASH_REGEX.test(user.password)) {
      isPasswordValid = await user.matchPassword(password);
    } else if (typeof user.password === "string" && password === user.password) {
      // Migrate legacy plaintext password records to bcrypt on successful login.
      user.password = password;
      user.markModified("password");
      await user.save();
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: `This account is not registered as ${role}.` });
    }

    return res.json(buildUserPayload(user, true));
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Unable to log in right now." });
  }
}

export async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(buildUserPayload(user));
}

export async function updateProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const {
    name,
    skillLevel,
    interests,
    careerGoal,
    weeklyLearningHours,
    preferredPlatforms,
    learningPreference,
    educationLevel,
    learningFormat,
  } = req.body || {};

  if (name) user.name = name;
  if (skillLevel) user.skillLevel = skillLevel;
  if (interests) user.interests = interests;
  if (careerGoal) user.careerGoal = careerGoal;
  if (weeklyLearningHours) user.weeklyLearningHours = weeklyLearningHours;
  if (preferredPlatforms) user.preferredPlatforms = preferredPlatforms;
  if (learningPreference) user.learningPreference = learningPreference;
  if (educationLevel !== undefined) user.educationLevel = educationLevel;
  if (learningFormat !== undefined) user.learningFormat = learningFormat;

  const updatedUser = await user.save();
  return res.json(buildUserPayload(updatedUser));
}

export function getHealth(req, res) {
  return res.json({ status: "ok", uptime: process.uptime() });
}

export async function enrollInCourse(req, res) {
  try {
    const { courseId } = req.body || {};
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required." });
    }

    const normalizedCourseId = String(courseId).trim();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.enrolledCourses) user.enrolledCourses = [];

    const alreadyEnrolled = user.enrolledCourses.some(
      (id) => String(id) === normalizedCourseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    user.enrolledCourses.push(normalizedCourseId);
    await user.save();

    if (mongoose.Types.ObjectId.isValid(normalizedCourseId)) {
      const course = await Course.findById(normalizedCourseId);
      if (course) {
        course.enrollments = (course.enrollments || 0) + 1;
        await course.save();
      }
    }

    return res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("Enroll error:", error);
    return res.status(500).json({ error: "Unable to enroll right now." });
  }
}
