import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Feedback from "../models/Feedback.js";
import { getMetrics, getLogs, addLog } from "../utils/metricsStore.js";

const FEEDBACK_KEYWORDS = ["bad", "boring", "slow", "outdated", "confusing", "broken"];

function round(value, digits = 1) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function buildDbLoadScore(totalCourses, totalEnrollments) {
  const score = Math.min(100, Math.round(totalCourses * 0.2 + totalEnrollments * 0.05));
  const status = score >= 85 ? "critical" : score >= 65 ? "warning" : "healthy";
  return { score, status };
}

function getCourseCompletionRate(stats = {}) {
  if (!stats.total) return 0;
  return stats.completed / stats.total;
}

function matchFeedbackKeywords(course) {
  const haystack = [
    ...(course.reviewHighlights || []),
    course.description || "",
  ]
    .join(" ")
    .toLowerCase();

  return FEEDBACK_KEYWORDS.filter((keyword) => haystack.includes(keyword));
}

function extractFeedbackKeywords(comment = "") {
  const lower = String(comment || "").toLowerCase();
  return FEEDBACK_KEYWORDS.filter((keyword) => lower.includes(keyword));
}

function buildWeightOptimizationSummary({ avgRating, interestMatchRate, skillMatchRate }) {
  const weights = {
    interest: 0.3,
    skill: 0.25,
    rating: 0.1,
  };

  if (avgRating >= 4.4) weights.rating = 0.16;
  if (interestMatchRate >= 0.6) weights.interest = 0.36;
  if (skillMatchRate >= 0.7) weights.skill = 0.3;

  const total = weights.interest + weights.skill + weights.rating;
  const normalized = {
    interest: round(weights.interest / total, 2),
    skill: round(weights.skill / total, 2),
    rating: round(weights.rating / total, 2),
  };

  const rationale = [];
  if (avgRating >= 4.4) rationale.push("Learners favor higher rated courses → rating weight increased.");
  if (interestMatchRate >= 0.6) rationale.push("Strong interest alignment detected → interest weight increased.");
  if (skillMatchRate >= 0.7) rationale.push("Level match is strong → skill weight increased.");
  if (!rationale.length) rationale.push("Balanced weights based on steady engagement.");

  return {
    weights: normalized,
    signals: {
      avgRating: round(avgRating, 2),
      interestMatchRate: round(interestMatchRate, 2),
      skillMatchRate: round(skillMatchRate, 2),
    },
    rationale,
  };
}

export async function getAdminOverview(req, res) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const todayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalCourses,
      courses,
      students,
      enrollments,
      feedbackSummary,
      recentFeedbackSummary,
      flaggedFeedback,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      Course.countDocuments(),
      Course.find().lean(),
      User.find({ role: "student" })
        .select("name email skillLevel careerGoal careerTarget createdAt lastLoginAt completedCourses failedLoginAttempts lastFailedLoginAt interests")
        .sort({ createdAt: -1 })
        .lean(),
      Enrollment.find().select("course status createdAt user").lean(),
      Feedback.aggregate([
        { $group: { _id: "$courseId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: "$courseId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Feedback.find({ comment: { $regex: new RegExp(FEEDBACK_KEYWORDS.join("|"), "i") } })
        .select("courseId comment")
        .lean(),
    ]);

    const courseMap = new Map(courses.map((course) => [String(course._id), course]));
    const enrollmentStats = new Map();
    const feedbackMap = new Map(
      feedbackSummary.map((entry) => [String(entry._id), { avgRating: entry.avgRating, count: entry.count }])
    );
    const recentFeedbackMap = new Map(
      recentFeedbackSummary.map((entry) => [String(entry._id), { avgRating: entry.avgRating, count: entry.count }])
    );
    const flaggedFeedbackMap = new Map();
    flaggedFeedback.forEach((entry) => {
      const courseId = String(entry.courseId);
      const keywords = extractFeedbackKeywords(entry.comment || "");
      if (!keywords.length) return;
      const existing = flaggedFeedbackMap.get(courseId) || new Set();
      keywords.forEach((keyword) => existing.add(keyword));
      flaggedFeedbackMap.set(courseId, existing);
    });
    const categoryCounts = {};
    const categoryRecentCounts = {};

    enrollments.forEach((enrollment) => {
      const courseId = String(enrollment.course);
      const course = courseMap.get(courseId);
      if (!course) return;

      if (!enrollmentStats.has(courseId)) {
        enrollmentStats.set(courseId, { total: 0, completed: 0, recent: 0 });
      }
      const stats = enrollmentStats.get(courseId);
      stats.total += 1;
      if (enrollment.status === "completed") stats.completed += 1;
      if (enrollment.createdAt && enrollment.createdAt >= sevenDaysAgo) stats.recent += 1;

      const category = course.category || "General";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      if (enrollment.createdAt && enrollment.createdAt >= sevenDaysAgo) {
        categoryRecentCounts[category] = (categoryRecentCounts[category] || 0) + 1;
      }
    });

    const totalEnrollments = enrollments.length;

    const courseStats = courses.map((course) => {
      const stats = enrollmentStats.get(String(course._id)) || {
        total: course.enrollments || 0,
        completed: 0,
        recent: 0,
      };
      const feedback = feedbackMap.get(String(course._id));
      const recentFeedback = recentFeedbackMap.get(String(course._id));
      const rating = feedback?.avgRating ?? course.rating ?? 0;
      const completionRate = getCourseCompletionRate(stats);
      const negativeFlags = new Set([
        ...matchFeedbackKeywords(course),
        ...(flaggedFeedbackMap.get(String(course._id)) || []),
      ]);
      const declining =
        recentFeedback?.avgRating !== undefined &&
        feedback?.avgRating !== undefined &&
        recentFeedback.avgRating < feedback.avgRating - 0.4;
      return {
        id: course._id,
        title: course.title,
        category: course.category,
        rating: round(rating, 2),
        enrollments: stats.total || course.enrollments || 0,
        completionRate: round(completionRate, 2),
        recentEnrollments: stats.recent || 0,
        feedbackFlags: Array.from(negativeFlags),
        decliningRating: Boolean(declining),
        ratingCount: feedback?.count || course.ratingCount || 0,
      };
    });

    const popularCourses = [...courseStats]
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    const lowPerformingCourses = courseStats.filter(
      (course) =>
        (course.rating && course.rating < 3) ||
        (course.enrollments >= 3 && course.completionRate < 0.3)
    );

    const trendingCategories = Object.entries(categoryRecentCounts)
      .map(([category, count]) => ({ category, enrollments: count }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    const categoryPopularity = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, enrollments: count }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    const maxEnrollments = Math.max(...courseStats.map((course) => course.enrollments), 1);
    const rankedCourses = courseStats
      .map((course) => {
        const score =
          (course.enrollments / maxEnrollments) * 0.5 +
          (course.rating / 5) * 0.3 +
          course.completionRate * 0.2;
        return { ...course, score: round(score * 100, 1) };
      })
      .sort((a, b) => b.score - a.score);

    const fastestGrowing = rankedCourses.reduce(
      (acc, course) => (course.recentEnrollments > (acc?.recentEnrollments || 0) ? course : acc),
      null
    );

    const mostCompleted = rankedCourses.reduce(
      (acc, course) =>
        course.completionRate > (acc?.completionRate || 0) && course.enrollments >= 3
          ? course
          : acc,
      null
    );

    const feedbackLowRated = courseStats.filter((course) => course.rating && course.rating < 3);
    const feedbackDeclining = courseStats.filter((course) => course.decliningRating);
    const feedbackFlagged = courseStats.filter((course) => course.feedbackFlags.length);

    const activeUsersToday = students.filter(
      (student) => student.lastLoginAt && student.lastLoginAt >= todayAgo
    ).length;
    const inactiveUsers = students.filter(
      (student) => !student.lastLoginAt || student.lastLoginAt < sevenDaysAgo
    ).length;
    const highPerformers = students.filter(
      (student) => (student.completedCourses || []).length >= 3
    ).length;

    const failedLoginUsers = students.filter(
      (student) =>
        (student.failedLoginAttempts || 0) >= 3 &&
        student.lastFailedLoginAt &&
        student.lastFailedLoginAt >= todayAgo
    ).length;

    const studentMap = new Map(students.map((student) => [String(student._id), student]));
    const order = ["Beginner", "Intermediate", "Advanced"];

    const interestMatchRate = totalEnrollments
      ? enrollments.filter((entry) => {
          const course = courseMap.get(String(entry.course));
          const user = studentMap.get(String(entry.user));
          if (!course || !user) return false;
          return (user.interests || []).some((interest) => {
            const needle = String(interest).toLowerCase();
            return (
              course.title.toLowerCase().includes(needle) ||
              course.category?.toLowerCase().includes(needle) ||
              (course.tags || []).some((tag) => String(tag).toLowerCase().includes(needle))
            );
          });
        }).length / totalEnrollments
      : 0.5;

    const skillMatchRate = totalEnrollments
      ? enrollments.filter((entry) => {
          const course = courseMap.get(String(entry.course));
          const user = studentMap.get(String(entry.user));
          if (!course || !user) return false;
          const userLevel = user.skillLevel || "Beginner";
          const userIdx = order.indexOf(userLevel);
          const courseIdx = order.indexOf(course.difficulty || "Beginner");
          return Math.abs(courseIdx - userIdx) <= 1;
        }).length / totalEnrollments
      : 0.5;

    const avgRating =
      courseStats.reduce((sum, course) => sum + (course.rating || 0), 0) /
      Math.max(courseStats.length, 1);

    const recommendationOptimization = buildWeightOptimizationSummary({
      avgRating,
      interestMatchRate,
      skillMatchRate,
    });

    const metrics = getMetrics();
    const dbLoad = buildDbLoadScore(totalCourses, totalEnrollments);
    const alerts = [];

    if (dbLoad.score >= 70) {
      alerts.push({
        id: "db-load",
        level: dbLoad.score >= 85 ? "critical" : "warning",
        message: `Database load at ${dbLoad.score}%`,
      });
    }
    if (lowPerformingCourses.length) {
      alerts.push({
        id: "low-rating",
        level: "warning",
        message: `${lowPerformingCourses.length} courses need attention (low rating or completion).`,
      });
    }
    if (failedLoginUsers) {
      alerts.push({
        id: "failed-logins",
        level: "warning",
        message: `${failedLoginUsers} users with repeated failed logins in last 24h.`,
      });
    }
    if (metrics.avgResponseMs > 800 || metrics.p95ResponseMs > 1200) {
      alerts.push({
        id: "api-slow",
        level: "warning",
        message: `API response slow (avg ${metrics.avgResponseMs}ms, p95 ${metrics.p95ResponseMs}ms).`,
      });
    }

    if (alerts.length) {
      alerts.forEach((alert) => addLog(`Alert: ${alert.message}`, "warning"));
    }

    return res.json({
      totals: {
        users: totalUsers,
        students: totalStudents,
        admins: totalAdmins,
        courses: totalCourses,
        enrollments: totalEnrollments,
      },
      students,
      courseInsights: {
        popularCourses,
        lowPerformingCourses,
        trendingCategories,
        categoryPopularity,
      },
      recommendationOptimization,
      userActivity: {
        activeUsersToday,
        inactiveUsers,
        highPerformers,
        failedLoginUsers,
      },
      feedbackAnalysis: {
        averageRating: round(avgRating, 2),
        lowRatedCourses: feedbackLowRated,
        decliningCourses: feedbackDeclining,
        keywordFlags: feedbackFlagged,
      },
      courseRankings: {
        topCourses: rankedCourses.slice(0, 5),
        fastestGrowing,
        mostCompleted,
      },
      alerts,
      systemHealth: {
        uptimeSeconds: Math.round(process.uptime()),
        avgResponseMs: metrics.avgResponseMs,
        p95ResponseMs: metrics.p95ResponseMs,
        errorRate: metrics.errorRate,
        requestsPerMinute: metrics.requestsPerMinute,
        dbLoad,
      },
      logs: getLogs(10),
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return res.status(500).json({ error: "Unable to load admin overview." });
  }
}
