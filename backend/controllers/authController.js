import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { sendEmail } from "../utils/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;
const VALID_DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const VALID_PLATFORMS = [
  "Coursera",
  "edX",
  "Udacity",
  "NPTEL",
  // Backward-compatible options used by older signup flows.
  "Udemy",
  "LinkedIn Learning",
];
const VALID_LEARNING_FORMATS = [
  "Video Courses",
  "Reading Material",
  "Projects",
  "Interactive Labs",
  // Backward-compatible options used by older signup flows.
  "Video Lectures",
  "Interactive Coding",
  "Reading Materials",
  "Project-Based",
  "Mixed Format",
];
const VALID_CAREER_TARGETS = [
  "Machine Learning Engineer",
  "Data Scientist",
  "Backend Developer",
  "Cloud Engineer",
  "AI Researcher",
  // Backward-compatible legacy targets already used in the app.
  "ML Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "UX Designer",
  "Cloud Architect",
  "Data Analyst",
];
const DEFAULT_SKILLS = {
  python: 0,
  machineLearning: 0,
  statistics: 0,
  algorithms: 0,
  dataScience: 0,
};
const APP_NAME = process.env.APP_NAME || "CourseIQ";

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function normalizeStringArray(value) {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

function normalizeEnumList(value, allowed) {
  const allowedSet = new Set(allowed);
  return normalizeStringArray(value).filter((item) => allowedSet.has(item));
}

function normalizeDifficulty(value, fallback = "Intermediate") {
  return VALID_DIFFICULTY_LEVELS.includes(value) ? value : fallback;
}

function normalizeCareerTarget(value, fallback = "") {
  const normalized = String(value || "").trim();
  return VALID_CAREER_TARGETS.includes(normalized) ? normalized : fallback;
}

function toSkillNumber(value, fallback = 0) {
  const raw = Number(value);
  if (Number.isNaN(raw)) return fallback;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function normalizeSkills(skills = {}) {
  return {
    python: toSkillNumber(skills.python, 0),
    machineLearning: toSkillNumber(skills.machineLearning, 0),
    statistics: toSkillNumber(skills.statistics, 0),
    algorithms: toSkillNumber(skills.algorithms, 0),
    dataScience: toSkillNumber(skills.dataScience, 0),
  };
}

function normalizeLearningPreferences(input = {}, fallback = {}) {
  const preferredDifficultyLevel = normalizeDifficulty(
    input.preferredDifficultyLevel,
    fallback.preferredDifficultyLevel || "Intermediate"
  );

  const normalizedPlatforms = normalizeEnumList(
    input.preferredPlatforms ?? fallback.preferredPlatforms ?? [],
    VALID_PLATFORMS
  );
  const normalizedFormats = normalizeEnumList(
    input.learningFormat ?? fallback.learningFormat ?? [],
    VALID_LEARNING_FORMATS
  );

  return {
    preferredDifficultyLevel,
    preferredPlatforms: normalizedPlatforms,
    learningFormat: normalizedFormats,
  };
}

function buildUserPayload(user, includeToken = false) {
  const preferredDifficultyLevel = normalizeDifficulty(
    user?.learningPreferences?.preferredDifficultyLevel || user?.skillLevel,
    "Intermediate"
  );
  const platforms = normalizeEnumList(
    user?.preferredPlatforms?.length
      ? user.preferredPlatforms
      : user?.learningPreferences?.preferredPlatforms || [],
    VALID_PLATFORMS
  );
  const formats = normalizeEnumList(
    user?.learningFormat?.length
      ? user.learningFormat
      : user?.learningPreferences?.learningFormat || [],
    VALID_LEARNING_FORMATS
  );
  const skills = normalizeSkills({
    ...DEFAULT_SKILLS,
    ...(user?.skills || {}),
  });
  const careerTarget = normalizeCareerTarget(user?.careerTarget || user?.careerGoal, "");

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || "",
    skillLevel: normalizeDifficulty(user.skillLevel, preferredDifficultyLevel),
    interests: user.interests,
    careerGoal: user.careerGoal || careerTarget,
    careerTarget,
    learningGoal: user.learningGoal || "",
    weeklyLearningHours: user.weeklyLearningHours,
    preferredPlatforms: platforms,
    learningPreferences: {
      preferredDifficultyLevel,
      preferredPlatforms: platforms,
      learningFormat: formats,
    },
    skills,
    learningPreference: user.learningPreference,
    educationLevel: user.educationLevel,
    learningFormat: formats,
    enrolledCourses: user.enrolledCourses || [],
    completedCourses: user.completedCourses || [],
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

// Email verification and password reset flows removed.

async function sendEnrollmentEmail(user, course) {
  if (!user?.email || !course) return null;
  const subject = `${APP_NAME} enrollment confirmed`;
  const text = `You are enrolled in ${course.title} (${course.platform}).`;
  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2>Enrollment confirmed</h2>
      <p>You're now enrolled in:</p>
      <p style="font-size:16px;font-weight:700">${course.title}</p>
      <p>Provider: ${course.provider || course.platform}</p>
      <p>Platform: ${course.platform}</p>
      <p>Course link: <a href="${course.courseUrl}">${course.courseUrl}</a></p>
      <p style="margin-top:16px">Happy learning!</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
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
      careerTarget,
      pace,
      interests,
      preferredPlatforms,
      learningPreference,
      educationLevel,
      learningFormat,
      learningPreferences,
      skills,
      skillLevel,
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

    const requestedDifficulty =
      skillLevel || skill || learningPreferences?.preferredDifficultyLevel || "Intermediate";
    if (requestedDifficulty && !VALID_DIFFICULTY_LEVELS.includes(requestedDifficulty)) {
      return res.status(400).json({
        error: `Preferred difficulty must be one of: ${VALID_DIFFICULTY_LEVELS.join(", ")}.`,
      });
    }

    const requestedPlatforms = normalizeStringArray(
      preferredPlatforms ?? learningPreferences?.preferredPlatforms
    );
    const invalidPlatforms = requestedPlatforms.filter(
      (platform) => !VALID_PLATFORMS.includes(platform)
    );
    if (invalidPlatforms.length) {
      return res.status(400).json({
        error: `Unsupported platforms: ${invalidPlatforms.join(", ")}.`,
      });
    }

    const requestedFormats = normalizeStringArray(
      learningFormat ?? learningPreferences?.learningFormat
    );
    const invalidFormats = requestedFormats.filter(
      (format) => !VALID_LEARNING_FORMATS.includes(format)
    );
    if (invalidFormats.length) {
      return res.status(400).json({
        error: `Unsupported learning format options: ${invalidFormats.join(", ")}.`,
      });
    }

    const requestedCareerTarget = normalizeName(careerTarget || goal);
    if (requestedCareerTarget && !VALID_CAREER_TARGETS.includes(requestedCareerTarget)) {
      return res.status(400).json({
        error: `Career target must be one of: ${VALID_CAREER_TARGETS
          .slice(0, 5)
          .join(", ")}.`,
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res
        .status(409)
        .json({ error: "An account already exists with this email." });
    }

    const normalizedDifficulty = normalizeDifficulty(requestedDifficulty, "Intermediate");
    const normalizedPlatforms = normalizeEnumList(requestedPlatforms, VALID_PLATFORMS);
    const normalizedFormats = normalizeEnumList(requestedFormats, VALID_LEARNING_FORMATS);
    const normalizedCareerTarget = normalizeCareerTarget(requestedCareerTarget, "");
    const normalizedSkills = normalizeSkills({ ...DEFAULT_SKILLS, ...(skills || {}) });
    const normalizedInterests = normalizeStringArray(interests);
    const normalizedLearningGoal = normalizeName(goal || careerTarget || "");

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role,
      emailVerified: true,
      skillLevel: normalizedDifficulty,
      interests: normalizedInterests,
      careerGoal: normalizedCareerTarget || "",
      careerTarget: normalizedCareerTarget,
      learningGoal: normalizedLearningGoal || normalizedCareerTarget || "",
      weeklyLearningHours: getWeeklyHoursFromPace(pace),
      preferredPlatforms: normalizedPlatforms,
      learningPreference: learningPreference || "Paid Allowed",
      educationLevel: educationLevel || "",
      learningFormat: normalizedFormats,
      learningPreferences: {
        preferredDifficultyLevel: normalizedDifficulty,
        preferredPlatforms: normalizedPlatforms,
        learningFormat: normalizedFormats,
      },
      skills: normalizedSkills,
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
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      name,
      skillLevel,
      interests,
      careerGoal,
      careerTarget,
      learningGoal,
      avatarUrl,
      weeklyLearningHours,
      completedCourses,
      preferredPlatforms,
      learningPreference,
      educationLevel,
      learningFormat,
      learningPreferences,
      skills,
    } = req.body || {};

    if (name !== undefined) {
      const normalizedName = normalizeName(name);
      if (!normalizedName) {
        return res.status(400).json({ error: "Name cannot be empty." });
      }
      user.name = normalizedName;
    }

    if (skillLevel !== undefined) {
      if (!VALID_DIFFICULTY_LEVELS.includes(skillLevel)) {
        return res.status(400).json({
          error: `Preferred difficulty must be one of: ${VALID_DIFFICULTY_LEVELS.join(", ")}.`,
        });
      }
      user.skillLevel = skillLevel;
    }

    if (interests !== undefined) {
      user.interests = normalizeStringArray(interests);
    }

    if (weeklyLearningHours !== undefined) {
      const normalizedHours = Number(weeklyLearningHours);
      if (Number.isNaN(normalizedHours) || normalizedHours < 0 || normalizedHours > 168) {
        return res.status(400).json({
          error: "weeklyLearningHours must be a number between 0 and 168.",
        });
      }
      user.weeklyLearningHours = normalizedHours;
    }

    if (learningPreference !== undefined) {
      user.learningPreference = learningPreference;
    }

    if (educationLevel !== undefined) {
      user.educationLevel = String(educationLevel || "").trim();
    }

    if (learningGoal !== undefined) {
      user.learningGoal = normalizeName(learningGoal);
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = String(avatarUrl || "").trim();
    }

    if (completedCourses !== undefined) {
      user.completedCourses = normalizeStringArray(completedCourses);
    }

    const nextPlatformsInput =
      preferredPlatforms !== undefined
        ? preferredPlatforms
        : learningPreferences?.preferredPlatforms;
    if (nextPlatformsInput !== undefined) {
      const requestedPlatforms = normalizeStringArray(nextPlatformsInput);
      const invalidPlatforms = requestedPlatforms.filter(
        (platform) => !VALID_PLATFORMS.includes(platform)
      );
      if (invalidPlatforms.length) {
        return res.status(400).json({
          error: `Unsupported platforms: ${invalidPlatforms.join(", ")}.`,
        });
      }
      user.preferredPlatforms = requestedPlatforms;
    }

    const nextLearningFormatInput =
      learningFormat !== undefined ? learningFormat : learningPreferences?.learningFormat;
    if (nextLearningFormatInput !== undefined) {
      const requestedFormats = normalizeStringArray(nextLearningFormatInput);
      const invalidFormats = requestedFormats.filter(
        (format) => !VALID_LEARNING_FORMATS.includes(format)
      );
      if (invalidFormats.length) {
        return res.status(400).json({
          error: `Unsupported learning format options: ${invalidFormats.join(", ")}.`,
        });
      }
      user.learningFormat = requestedFormats;
    }

    const nextCareerTargetInput = careerTarget !== undefined ? careerTarget : careerGoal;
    if (nextCareerTargetInput !== undefined) {
      const normalizedCareerTarget = normalizeName(nextCareerTargetInput);
      if (
        normalizedCareerTarget &&
        !VALID_CAREER_TARGETS.includes(normalizedCareerTarget)
      ) {
        return res.status(400).json({
          error: `Career target must be one of: ${VALID_CAREER_TARGETS
            .slice(0, 5)
            .join(", ")}.`,
        });
      }
      user.careerTarget = normalizedCareerTarget;
      user.careerGoal = normalizedCareerTarget;
    }

    if (skills !== undefined) {
      if (typeof skills !== "object" || Array.isArray(skills)) {
        return res.status(400).json({
          error: "skills must be an object with 0-100 values.",
        });
      }
      user.skills = normalizeSkills({
        ...DEFAULT_SKILLS,
        ...(user.skills?.toObject ? user.skills.toObject() : user.skills || {}),
        ...skills,
      });
    }

    const nextLearningPreferences = normalizeLearningPreferences(
      learningPreferences || {},
      {
        preferredDifficultyLevel: user.skillLevel || "Intermediate",
        preferredPlatforms: user.preferredPlatforms || [],
        learningFormat: user.learningFormat || [],
      }
    );
    user.learningPreferences = nextLearningPreferences;
    user.skillLevel = nextLearningPreferences.preferredDifficultyLevel;
    user.preferredPlatforms = nextLearningPreferences.preferredPlatforms;
    user.learningFormat = nextLearningPreferences.learningFormat;

    const updatedUser = await user.save();
    return res.json(buildUserPayload(updatedUser));
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Unable to update profile right now." });
  }
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

    let enrolledCourse = null;
    if (mongoose.Types.ObjectId.isValid(normalizedCourseId)) {
      await Enrollment.findOneAndUpdate(
        { user: user._id, course: normalizedCourseId },
        {
          $setOnInsert: { startedAt: new Date() },
          $set: { status: "enrolled", lastActivityAt: new Date() },
        },
        { upsert: true }
      );

      const course = await Course.findById(normalizedCourseId);
      if (course) {
        course.enrollments = (course.enrollments || 0) + 1;
        await course.save();
        enrolledCourse = course;
      }
    }

    try {
      await sendEnrollmentEmail(user, enrolledCourse);
    } catch (error) {
      console.warn("Enrollment email failed:", error?.message || error);
    }

    return res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("Enroll error:", error);
    return res.status(500).json({ error: "Unable to enroll right now." });
  }
}

export async function unenrollInCourse(req, res) {
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

    const wasEnrolled = user.enrolledCourses.some(
      (id) => String(id) === normalizedCourseId
    );
    if (!wasEnrolled) {
      return res.status(400).json({ error: "Course is not in enrolled list." });
    }

    user.enrolledCourses = user.enrolledCourses.filter(
      (id) => String(id) !== normalizedCourseId
    );
    await user.save();

    if (mongoose.Types.ObjectId.isValid(normalizedCourseId)) {
      await Enrollment.findOneAndUpdate(
        { user: user._id, course: normalizedCourseId },
        { $set: { status: "dropped", lastActivityAt: new Date() } }
      );

      const course = await Course.findById(normalizedCourseId);
      if (course) {
        course.enrollments = Math.max(0, (course.enrollments || 0) - 1);
        await course.save();
      }
    }

    return res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("Unenroll error:", error);
    return res.status(500).json({ error: "Unable to unenroll right now." });
  }
}
