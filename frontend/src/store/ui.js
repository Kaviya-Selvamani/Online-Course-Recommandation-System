import { create } from "zustand";
import { getSession } from "../services/session.js";

const UI_STORAGE_KEY = "courseiq_ui_state";

function readStoredUiState() {
  if (typeof window === "undefined") {
    return {
      bookmarkedCourseIds: [],
      notifs: [],
      hasNewRecs: true,
    };
  }

  try {
    const raw = window.localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) {
      return {
        bookmarkedCourseIds: [],
        notifs: [],
        hasNewRecs: true,
      };
    }

    const parsed = JSON.parse(raw);
    return {
      bookmarkedCourseIds: Array.isArray(parsed.bookmarkedCourseIds)
        ? parsed.bookmarkedCourseIds.map((id) => String(id))
        : [],
      notifs: Array.isArray(parsed.notifs) ? parsed.notifs : [],
      hasNewRecs: parsed.hasNewRecs !== false,
    };
  } catch {
    return {
      bookmarkedCourseIds: [],
      notifs: [],
      hasNewRecs: true,
    };
  }
}

function persistUiState(state) {
  if (typeof window === "undefined") return;

  const payload = {
    bookmarkedCourseIds: state.bookmarkedCourseIds || [],
    notifs: state.notifs || [],
    hasNewRecs: state.hasNewRecs !== false,
  };

  window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(payload));
}

function mergeNotifications(existing = [], incoming = []) {
  const merged = new Map(
    existing.map((notif) => [String(notif.id), notif]),
  );

  incoming.forEach((notif) => {
    const id = String(notif.id);
    const previous = merged.get(id);
    merged.set(id, {
      ...previous,
      ...notif,
      id,
      unread: previous ? previous.unread : notif.unread !== false,
    });
  });

  return Array.from(merged.values()).sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function areNotificationsEqual(left = [], right = []) {
  if (left.length !== right.length) return false;

  return left.every((notif, index) => {
    const other = right[index];
    return (
      String(notif.id) === String(other?.id) &&
      notif.title === other?.title &&
      notif.desc === other?.desc &&
      notif.time === other?.time &&
      notif.unread === other?.unread &&
      notif.createdAt === other?.createdAt &&
      notif.icon === other?.icon &&
      notif.bg === other?.bg
    );
  });
}

const stored = readStoredUiState();

export const useUiStore = create((set, get) => ({
  enrolledCourses: getSession()?.user?.enrolledCourses || [],
  bookmarkedCourseIds: stored.bookmarkedCourseIds,
  selectedCourse: null,
  hasNewRecs: stored.hasNewRecs,
  notifs: stored.notifs,

  setEnrolledCourses: (courses) => set({
    enrolledCourses: Array.isArray(courses) ? courses.map((id) => String(id)) : [],
  }),

  setBookmarkedCourseIds: (courseIds) =>
    set((state) => {
      const next = {
        ...state,
        bookmarkedCourseIds: Array.isArray(courseIds)
          ? [...new Set(courseIds.map((id) => String(id)))]
          : [],
      };
      persistUiState(next);
      return { bookmarkedCourseIds: next.bookmarkedCourseIds };
    }),

  addBookmarkId: (courseId) =>
    set((state) => {
      const bookmarkedCourseIds = [...new Set([...state.bookmarkedCourseIds, String(courseId)])];
      const next = { ...state, bookmarkedCourseIds };
      persistUiState(next);
      return { bookmarkedCourseIds };
    }),

  removeBookmarkId: (courseId) =>
    set((state) => {
      const bookmarkedCourseIds = state.bookmarkedCourseIds.filter(
        (id) => String(id) !== String(courseId),
      );
      const next = { ...state, bookmarkedCourseIds };
      persistUiState(next);
      return { bookmarkedCourseIds };
    }),

  openCourse: (course) => set({ selectedCourse: course }),
  closeCourse: () => set({ selectedCourse: null }),

  clearNewRecs: () =>
    set((state) => {
      const next = { ...state, hasNewRecs: false };
      persistUiState(next);
      return { hasNewRecs: false };
    }),

  flagNewRecs: () =>
    set((state) => {
      const next = { ...state, hasNewRecs: true };
      persistUiState(next);
      return { hasNewRecs: true };
    }),

  pushNotif: (notif) =>
    set((state) => {
      const notifs = mergeNotifications(state.notifs, [
        {
          unread: true,
          createdAt: notif.createdAt || new Date().toISOString(),
          ...notif,
        },
      ]);
      const next = { ...state, notifs };
      persistUiState(next);
      return { notifs };
    }),

  upsertNotifications: (notifs) =>
    {
      const state = get();
      const merged = mergeNotifications(state.notifs, notifs);
      if (areNotificationsEqual(state.notifs, merged)) {
        return;
      }
      const next = { ...state, notifs: merged };
      persistUiState(next);
      set({ notifs: merged });
    },

  markNotifRead: (id) =>
    set((state) => {
      const notifs = state.notifs.map((notif) =>
        String(notif.id) === String(id) ? { ...notif, unread: false } : notif,
      );
      const next = { ...state, notifs };
      persistUiState(next);
      return { notifs };
    }),

  markAllNotifsRead: () =>
    set((state) => {
      const notifs = state.notifs.map((notif) => ({ ...notif, unread: false }));
      const next = { ...state, notifs };
      persistUiState(next);
      return { notifs };
    }),

  clearNotifs: () =>
    set((state) => {
      const next = { ...state, notifs: [] };
      persistUiState(next);
      return { notifs: [] };
    }),

  resetUiState: () =>
    set(() => {
      const next = {
        bookmarkedCourseIds: [],
        notifs: [],
        hasNewRecs: true,
      };
      persistUiState(next);
      return {
        bookmarkedCourseIds: [],
        notifs: [],
        hasNewRecs: true,
        enrolledCourses: [],
        selectedCourse: null,
      };
    }),

  getUnreadCount: () => get().notifs.filter((notif) => notif.unread).length,
}));
