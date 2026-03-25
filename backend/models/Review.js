import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
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
    title: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
