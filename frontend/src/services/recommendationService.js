import { api, getAuthHeaders } from "./api.js";
import { getToken } from "./session.js";

export async function fetchRecommendations() {
  if (!getToken()) throw new Error("Not logged in");

  const { data } = await api.get("/recommendations", {
    headers: getAuthHeaders(),
  });

  return data;
}
