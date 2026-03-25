import User from "../models/User.js";
import Course from "../models/Course.js";

export async function getAdminOverview(req, res) {
  try {
    const [totalUsers, totalStudents, totalAdmins, totalCourses, students] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "admin" }),
        Course.countDocuments(),
        User.find({ role: "student" })
          .select("name email skillLevel careerGoal careerTarget createdAt")
          .sort({ createdAt: -1 }),
      ]);

    return res.json({
      totals: {
        users: totalUsers,
        students: totalStudents,
        admins: totalAdmins,
        courses: totalCourses,
      },
      students,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return res.status(500).json({ error: "Unable to load admin overview." });
  }
}
