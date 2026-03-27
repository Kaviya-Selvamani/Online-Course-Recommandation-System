import axios from "axios";

function getFallbackApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5001/api";
  }

  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  if (isLocalHost) {
    return "http://localhost:5001/api";
  }

  return "https://online-course-recommandation-system.onrender.com/api";
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || getFallbackApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function getAuthHeaders() {
  const token = localStorage.getItem("courseiq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
