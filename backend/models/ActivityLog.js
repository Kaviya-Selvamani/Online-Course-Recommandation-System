import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ level: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
