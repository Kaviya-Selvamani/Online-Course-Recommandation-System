import mongoose from "mongoose";

const recommendationItemSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    algorithmVersion: {
      type: String,
      default: "adaptive-v1",
    },
    weights: {
      interest: Number,
      skill: Number,
      career: Number,
      rating: Number,
      popularity: Number,
      recency: Number,
    },
    items: {
      type: [recommendationItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

recommendationSchema.index({ generatedAt: -1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;
