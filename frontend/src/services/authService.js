import { api, getAuthHeaders } from "./api.js";
import { useUiStore } from "../store/ui.js";
import {
  clearSession,
  getSession,
  getTheme,
  getToken,
  setSession,
  setTheme,
  setToken,
} from "./session.js";

export { getSession, getTheme, setTheme };

export function login({ user, role }) {
  setSession({ user, role });
}

export function logout() {
  clearSession();
  useUiStore.getState().setEnrolledCourses([]);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function mapUserPayload(data = {}) {
  const skillLevel = data.skillLevel || data.learningPreferences?.preferredDifficultyLevel || "Intermediate";
  const careerTarget = data.careerTarget || data.careerGoal || "";
  const preferredPlatforms = normalizeArray(
    data.preferredPlatforms?.length
      ? data.preferredPlatforms
      : data.learningPreferences?.preferredPlatforms
  );
  const learningFormat = normalizeArray(
    data.learningFormat?.length ? data.learningFormat : data.learningPreferences?.learningFormat
  );

  return {
    _id: data._id,
    name: data.name,
    email: data.email,
    enrolledCourses: data.enrolledCourses || [],
    skill: skillLevel,
    skillLevel,
    interests: data.interests || [],
    goal: careerTarget,
    careerGoal: data.careerGoal || careerTarget,
    careerTarget,
    weeklyLearningHours: data.weeklyLearningHours,
    preferredPlatforms,
    learningPreference: data.learningPreference,
    educationLevel: data.educationLevel,
    learningFormat,
    learningPreferences: {
      preferredDifficultyLevel: skillLevel,
      preferredPlatforms,
      learningFormat,
      ...(data.learningPreferences || {}),
    },
    skills: {
      python: data.skills?.python ?? 0,
      machineLearning: data.skills?.machineLearning ?? 0,
      statistics: data.skills?.statistics ?? 0,
      algorithms: data.skills?.algorithms ?? 0,
      dataScience: data.skills?.dataScience ?? 0,
    },
  };
}

function hydrateUserSession(data, roleOverride) {
  const { role, token, enrolledCourses } = data;

  login({
    user: mapUserPayload(data),
    role: roleOverride || role,
  });

  if (token) setToken(token);
  useUiStore.getState().setEnrolledCourses(enrolledCourses || []);
}

export async function serverLogin(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  hydrateUserSession(data);
  return data;
}

export async function serverRegister(credentials) {
  const { data } = await api.post("/auth/signup", credentials);
  if (data?.requiresVerification) {
    return data;
  }

  hydrateUserSession(
    {
      ...data,
      skillLevel: data.skillLevel || credentials.skill,
      interests: data.interests || credentials.interests,
      careerGoal: data.careerGoal || credentials.goal,
      careerTarget: data.careerTarget || credentials.careerTarget || credentials.goal,
      weeklyLearningHours: credentials.weeklyLearningHours,
      preferredPlatforms: data.preferredPlatforms || credentials.preferredPlatforms,
      learningPreference: credentials.learningPreference,
      educationLevel: credentials.educationLevel,
      learningFormat: data.learningFormat || credentials.learningFormat,
      learningPreferences:
        data.learningPreferences ||
        {
          preferredDifficultyLevel: credentials.skill || "Intermediate",
          preferredPlatforms: credentials.preferredPlatforms || [],
          learningFormat: normalizeArray(credentials.learningFormat),
        },
      skills: data.skills || credentials.skills,
    },
    credentials.role
  );
  return data;
}

export async function serverVerifyEmail({ email, code }) {
  const { data } = await api.post("/auth/verify-email", { email, code });
  return data;
}

export async function resendVerificationEmail(email) {
  const { data } = await api.post("/auth/resend-verification", { email });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword({ email, code, password }) {
  const { data } = await api.post("/auth/reset-password", { email, code, password });
  return data;
}

export async function refreshEnrolledCourses() {
  if (!getToken()) return null;

  try {
    const { data } = await api.get("/auth/me", {
      headers: getAuthHeaders(),
    });

    useUiStore.getState().setEnrolledCourses(data.enrolledCourses || []);

    const session = getSession();
    if (session?.user) {
      login({
        role: session.role,
        user: {
          ...session.user,
          ...mapUserPayload(data),
        },
      });
    }

    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(profileData) {
  if (!getToken()) throw new Error("Not logged in");

  const { data } = await api.put("/auth/profile/update", profileData, {
    headers: getAuthHeaders(),
  });

  const session = getSession();
  if (session?.user) {
    login({
      role: session.role,
      user: {
        ...session.user,
        ...mapUserPayload(data),
      },
    });
  }

  return data;
}
