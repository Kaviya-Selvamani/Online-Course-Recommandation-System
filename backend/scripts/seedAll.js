import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Feedback from "../models/Feedback.js";
import Recommendation from "../models/Recommendation.js";

dotenv.config();

export async function seedAll({ clear = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (clear) {
    await Promise.all([
      User.deleteMany(),
      Course.deleteMany(),
      Enrollment.deleteMany(),
      Feedback.deleteMany(),
      Recommendation.deleteMany(),
    ]);
  }

  const admin = await User.create({
    name: "Admin",
    email: "admin@courseiq.ai",
    password: "admin123",
    role: "admin",
  });

  const [user1, user2] = await User.create([
    {
      name: "Asha Student",
      email: "asha@example.com",
      password: "password123",
      role: "student",
      skillLevel: "Beginner",
      interests: ["Python", "Data Science"],
      careerGoal: "Data Scientist",
      weeklyLearningHours: 5,
    },
    {
      name: "Ravi Learner",
      email: "ravi@example.com",
      password: "password123",
      role: "student",
      skillLevel: "Intermediate",
      interests: ["Cloud", "AWS"],
      careerGoal: "Cloud Engineer",
      weeklyLearningHours: 6,
    },
  ]);

  const courses = await Course.create([
    {
      title: "Intro to Python",
      description: "Learn Python basics for data analysis.",
      provider: "Coursera",
      platform: "Coursera",
      courseUrl: "https://www.coursera.org/learn/python",
      category: "Data Science",
      difficulty: "Beginner",
      tags: ["Python", "Programming"],
      price: 0,
      isFree: true,
      rating: 4.6,
      ratingCount: 1200,
    },
    {
      title: "Machine Learning Foundations",
      description: "Supervised and unsupervised learning basics.",
      provider: "Stanford",
      platform: "Coursera",
      courseUrl: "https://www.coursera.org/learn/machine-learning",
      category: "AI/ML",
      difficulty: "Intermediate",
      tags: ["Machine Learning", "AI"],
      price: 49,
      isFree: false,
      rating: 4.8,
      ratingCount: 890,
    },
    {
      title: "AWS Cloud Practitioner",
      description: "Build cloud fundamentals with AWS.",
      provider: "AWS",
      platform: "Coursera",
      courseUrl: "https://www.coursera.org/learn/aws-cloud-practitioner",
      category: "Cloud",
      difficulty: "Beginner",
      tags: ["AWS", "Cloud"],
      price: 0,
      isFree: true,
      rating: 4.5,
      ratingCount: 640,
    },
  ]);

  const [course1, course2, course3] = courses;

  await Enrollment.create([
    { user: user1._id, course: course1._id, status: "completed", progress: 100 },
    { user: user1._id, course: course2._id, status: "enrolled", progress: 40 },
    { user: user2._id, course: course3._id, status: "enrolled", progress: 10 },
  ]);

  const feedbackEntries = await Feedback.create([
    { userId: user1._id, courseId: course1._id, rating: 5, comment: "Great intro course!" },
    { userId: user2._id, courseId: course3._id, rating: 4, comment: "Good basics but a bit slow" },
  ]);

  const averageRating = feedbackEntries.reduce((sum, entry) => sum + entry.rating, 0) / feedbackEntries.length;
  await Course.findByIdAndUpdate(course1._id, { rating: 5, ratingCount: 1 });
  await Course.findByIdAndUpdate(course3._id, { rating: 4, ratingCount: 1 });

  await Recommendation.create({
    userId: user1._id,
    weights: { interest: 0.3, skill: 0.25, career: 0.2, rating: 0.1, popularity: 0.1, recency: 0.05 },
    items: [
      { courseId: course2._id, score: 89, rank: 1, reasons: ["Skill stretch", "Career fit"] },
    ],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  console.log("Seed completed.");
  console.log(`Admin user: ${admin.email} / admin123`);
  console.log(`Student user: ${user1.email} / password123`);
  console.log(`Student user: ${user2.email} / password123`);

  await mongoose.disconnect();
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const shouldClear = process.env.SEED_CLEAR === "true";
  seedAll({ clear: shouldClear }).catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
