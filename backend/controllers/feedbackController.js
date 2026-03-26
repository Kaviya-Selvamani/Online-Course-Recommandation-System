import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const NEGATIVE_KEYWORDS = ["bad", "boring", "slow", "outdated", "confusing", "broken"];

function extractKeywords(comment = "") {
  const lower = String(comment || "").toLowerCase();
  return NEGATIVE_KEYWORDS.filter((keyword) => lower.includes(keyword));
}

export async function submitFeedback(req, res) {
  try {
    const { courseId, rating, comment } = req.body || {};
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Valid courseId is required." });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }

    const keywords = extractKeywords(comment);

    const feedback = await Feedback.findOneAndUpdate(
      { userId: req.user.id, courseId },
      {
        $set: {
          rating: numericRating,
          comment: String(comment || "").trim(),
          keywords,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const stats = await Feedback.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: "$courseId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avgRating = stats[0]?.avgRating || numericRating;
    const ratingCount = stats[0]?.count || 1;

    await Course.findByIdAndUpdate(courseId, {
      rating: avgRating,
      ratingCount,
    });

    await User.findByIdAndUpdate(req.user.id, { lastActivityAt: new Date() });

    return res.json({
      feedback,
      courseRating: avgRating,
      ratingCount,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return res.status(500).json({ error: "Unable to submit feedback right now." });
  }
}

export async function getCourseFeedback(req, res) {
  try {
    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Valid courseId is required." });
    }

    const feedback = await Feedback.find({ courseId })
      .sort({ createdAt: -1 })
      .populate("userId", "name avatarUrl")
      .lean();

    return res.json({ feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    return res.status(500).json({ error: "Unable to load feedback." });
  }
}
