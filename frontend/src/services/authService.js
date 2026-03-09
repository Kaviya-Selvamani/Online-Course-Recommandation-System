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

function hydrateUserSession(data, roleOverride) {
  const {
    _id,
    name,
    email,
    role,
    token,
    enrolledCourses,
    skillLevel,
    interests,
    careerGoal,
    weeklyLearningHours,
    preferredPlatforms,
    learningPreference,
    educationLevel,
    learningFormat,
  } = data;

  login({
    user: {
      _id,
      name,
      email,
      enrolledCourses: enrolledCourses || [],
      skill: skillLevel,
      interests,
      goal: careerGoal,
      weeklyLearningHours,
      preferredPlatforms,
      learningPreference,
      educationLevel,
      learningFormat,
    },
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
  hydrateUserSession(
    {
      ...data,
      skillLevel: credentials.skill,
      interests: credentials.interests,
      careerGoal: credentials.goal,
      weeklyLearningHours: credentials.weeklyLearningHours,
      preferredPlatforms: credentials.preferredPlatforms,
      learningPreference: credentials.learningPreference,
      educationLevel: credentials.educationLevel,
      learningFormat: credentials.learningFormat,
    },
    credentials.role
  );
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
          ...data,
          skill: data.skillLevel,
          goal: data.careerGoal,
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
        ...data,
        interests: data.interests,
        skill: data.skillLevel,
        goal: data.careerGoal,
        weeklyLearningHours: data.weeklyLearningHours,
      },
    });
  }

  return data;
}
