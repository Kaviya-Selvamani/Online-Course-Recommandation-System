const USER_KEY = "courseiq_user";
const ROLE_KEY = "courseiq_role";
const THEME_KEY = "courseiq_theme";
const TOKEN_KEY = "courseiq_token";

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function getSession() {
  try {
    const userRaw = localStorage.getItem(USER_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    if (!userRaw || !role) return null;
    return { user: JSON.parse(userRaw), role };
  } catch {
    return null;
  }
}

export function setSession({ user, role }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
