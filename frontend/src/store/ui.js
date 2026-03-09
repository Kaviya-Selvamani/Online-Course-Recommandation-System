import { create } from 'zustand'
import { getSession } from '../services/session.js'

export const useUiStore = create((set) => ({
  enrolledCourses: getSession()?.user?.enrolledCourses || [],
  setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),
  selectedCourse: null,
  openCourse: (course) => set({ selectedCourse: course }),
  closeCourse: () => set({ selectedCourse: null }),

  // Recommendations state
  hasNewRecs: true,
  clearNewRecs: () => set({ hasNewRecs: false }),

  // Notifications state
  notifs: [
    {
      id: 1,
      icon: "🎯",
      bg: "var(--adim)",
      title: "New Perfect Fit Course",
      desc: '"Deep Learning with PyTorch" matches 93% of your profile.',
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      icon: "📈",
      bg: "rgba(74,184,245,.1)",
      title: "Relevance Score Improved",
      desc: "Your learning alignment jumped to 84% — up 6% from last week.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: 3,
      icon: "🔔",
      bg: "rgba(240,160,48,.1)",
      title: "Course Enrollment Closing",
      desc: '"Cloud Architecture (AWS)" has only 3 seats left.',
      time: "2 days ago",
      unread: true,
    },
    {
      id: 4,
      icon: "✅",
      bg: "rgba(24,201,138,.1)",
      title: "Module Completed",
      desc: "You completed Module 5 in Machine Learning Fundamentals. 68% done!",
      time: "3 days ago",
      unread: false,
    },
    {
      id: 5,
      icon: "🏆",
      bg: "rgba(240,160,48,.1)",
      title: "Achievement Unlocked",
      desc: 'You earned the "Fast Learner" badge.',
      time: "4 days ago",
      unread: false,
    },
    {
      id: 6,
      icon: "💡",
      bg: "rgba(74,184,245,.1)",
      title: "Skill Gap Identified",
      desc: "AI detected a gap in your Cloud knowledge. 2 courses recommended.",
      time: "5 days ago",
      unread: false,
    },
  ],
  markNotifRead: (id) => set((s) => ({ notifs: s.notifs.map(n => n.id === id ? { ...n, unread: false } : n) })),
  markAllNotifsRead: () => set((s) => ({ notifs: s.notifs.map(n => ({ ...n, unread: false })) })),
  clearNotifs: () => set({ notifs: [] })
}))
