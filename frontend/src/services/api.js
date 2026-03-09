import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function getAuthHeaders() {
  const token = localStorage.getItem("courseiq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
