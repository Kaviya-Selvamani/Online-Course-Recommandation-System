import { api, getAuthHeaders } from "./api.js";
import { useUiStore } from "../store/ui.js";
import { getSession, getToken, setSession } from "./session.js";

function showPopup(message) {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(message);
  }
}

export async function enrollCourse(courseId, options = {}) {
  if (!getToken()) throw new Error("Not logged in");
  const { showSuccessPopup = true } = options;

  const sessionBeforeEnroll = getSession();
  const existingEnrolled = sessionBeforeEnroll?.user?.enrolledCourses || [];
  const wasAlreadyEnrolled = existingEnrolled.some(
    (id) => String(id) === String(courseId)
  );

  try {
    const { data } = await api.post(
      "/auth/enroll",
      { courseId },
      { headers: getAuthHeaders() }
    );

    if (data.success) {
      const session = getSession();
      if (session?.user) {
        setSession({
          role: session.role,
          user: {
            ...session.user,
            enrolledCourses: data.enrolledCourses,
          },
        });
      }
      useUiStore.getState().setEnrolledCourses(data.enrolledCourses || []);

      if (showSuccessPopup && !wasAlreadyEnrolled) {
        showPopup("Enrollment successful.");
      }
    }

    return data;
  } catch (error) {
    if (error.response?.data?.error === "Already enrolled in this course") {
      const session = getSession();
      let current = session?.user?.enrolledCourses || [];
      if (!current.some((id) => String(id) === String(courseId))) {
        current = [...current, String(courseId)];
        if (session?.user) {
          setSession({
            role: session.role,
            user: {
              ...session.user,
              enrolledCourses: current,
            },
          });
        }
        useUiStore.getState().setEnrolledCourses(current);
      }
      if (showSuccessPopup) {
        showPopup("You are already enrolled in this course.");
      }
      return { success: true, enrolledCourses: current };
    }
    throw error;
  }
}
