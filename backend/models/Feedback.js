import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ courseId: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, courseId: 1 }, { unique: true });
feedbackSchema.index({ rating: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
