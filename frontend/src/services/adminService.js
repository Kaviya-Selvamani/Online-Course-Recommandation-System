import { api, getAuthHeaders } from "./api.js";

export async function fetchAdminOverview() {
  const { data } = await api.get("/admin/overview", {
    headers: getAuthHeaders(),
  });
  return data;
}
