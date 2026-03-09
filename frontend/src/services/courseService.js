import { api, getAuthHeaders } from "./api.js";
import { useUiStore } from "../store/ui.js";
import { getSession, getToken, setSession } from "./session.js";

export async function enrollCourse(courseId) {
  if (!getToken()) throw new Error("Not logged in");

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
      return { success: true, enrolledCourses: current };
    }
    throw error;
  }
}
