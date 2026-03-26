import { api, getAuthHeaders } from "./api.js";
import { getToken } from "./session.js";

export async function submitFeedback({ courseId, rating, comment }) {
  if (!getToken()) throw new Error("Not logged in");
  const { data } = await api.post(
    "/feedback",
    { courseId, rating, comment },
    { headers: getAuthHeaders() }
  );
  return data;
}

export async function fetchCourseFeedback(courseId) {
  const { data } = await api.get(`/feedback/course/${courseId}`);
  return data;
}
