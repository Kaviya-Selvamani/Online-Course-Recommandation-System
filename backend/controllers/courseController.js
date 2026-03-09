import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export async function getCourses(req, res) {
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const filter = { ...keyword };

  if (req.query.level && req.query.level !== "All") {
    filter.$or = [{ level: req.query.level }, { difficulty: req.query.level }];
  }

  if (req.query.topics) {
    const topics = req.query.topics.split(",");
    filter.$and = [...(filter.$and || []), { $or: [{ topics: { $in: topics } }, { tags: { $in: topics } }] }];
  }

  const courses = await Course.find(filter);
  return res.json(courses);
}

export async function createCourse(req, res) {
  const {
    title,
    description,
    provider,
    platform,
    url,
    courseUrl,
    level,
    difficulty,
    topics,
    tags,
    category,
    price,
    isFree,
    thumbnailUrl,
  } = req.body;

  const course = new Course({
    title,
    description,
    provider,
    platform: platform || provider,
    courseUrl: courseUrl || url,
    difficulty: difficulty || level,
    tags: tags || topics || [],
    category: category || "General",
    price: typeof price === "number" ? price : 0,
    isFree: typeof isFree === "boolean" ? isFree : true,
    thumbnailUrl: thumbnailUrl || undefined,
  });

  const createdCourse = await course.save();
  return res.status(201).json(createdCourse);
}

export async function getBasicRecommendations(req, res) {
  const { interests, skill } = req.body || {};
  const filter = {};

  if (skill) {
    filter.$or = [{ level: skill }, { difficulty: skill }];
  }
  if (interests?.length) {
    filter.$and = [...(filter.$and || []), { $or: [{ topics: { $in: interests } }, { tags: { $in: interests } }] }];
  }

  const courses = await Course.find(filter).limit(10);
  return res.json(courses);
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

    if (user.enrolledCourses.some((id) => String(id) === normalizedCourseId)) {
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
