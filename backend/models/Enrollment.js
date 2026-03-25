import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["enrolled", "completed", "dropped"],
      default: "enrolled",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, status: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
