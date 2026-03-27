import { buildLearningInsights } from "./learningInsights.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hashString(value = "") {
  return String(value)
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
}

export function normalizeCourseId(course) {
  if (!course) return "";
  return String(course._id || course.id || course.courseId || course.slug || course.title || "");
}

export function buildCourseUiTags(course, allCourses = []) {
  const tags = [];
  const difficulty = String(course?.difficulty || "").toLowerCase();
  const rating = Number(course?.rating || 0);
  const enrollments = Number(course?.enrollments || 0);
  const match = Number(course?.relevanceScore || course?.matchPercentage || 0);

  if (difficulty === "beginner") tags.push("Beginner-friendly");
  if (rating >= 4.5) tags.push("High-rated");

  const enrollmentValues = allCourses.map((item) => Number(item?.enrollments || 0)).sort((a, b) => a - b);
  const threshold = enrollmentValues[Math.max(0, Math.floor(enrollmentValues.length * 0.7) - 1)] || 0;
  if (enrollments >= threshold && enrollments > 0) tags.push("Trending");

  if (match >= 90) tags.push("Perfect fit");
  if (!tags.length && rating >= 4) tags.push("Popular choice");

  return Array.from(new Set(tags)).slice(0, 4);
}

export function buildWhyCourseSummary(course, user) {
  const interests = (user?.interests || []).filter(Boolean);
  const skillLevel = user?.skillLevel || user?.learningPreferences?.preferredDifficultyLevel || "Intermediate";
  const careerGoal = user?.careerTarget || user?.careerGoal || user?.goal || "your next role";
  const why = Array.isArray(course?.whyRecommended) ? course.whyRecommended : [];
  const tags = [course?.category, ...(course?.tags || []), course?.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchedInterest = interests.find((interest) =>
    tags.includes(String(interest).toLowerCase()),
  );

  if (why.length >= 2) {
    return why.slice(0, 2).join(" • ");
  }

  if (matchedInterest) {
    return `Aligned with your interest in ${matchedInterest} and your goal of becoming ${careerGoal}.`;
  }

  return `${course?.difficulty || skillLevel} level content that supports your path toward ${careerGoal}.`;
}

function buildCourseProgress(courseId, completedSet, index) {
  if (completedSet.has(String(courseId))) return 100;
  const seed = Math.abs(hashString(String(courseId)));
  return clamp(28 + (seed % 42) + (index % 3) * 6, 18, 92);
}

function buildSkillGrowthTimeline(skillGrowth = []) {
  const focusAreas = skillGrowth.slice(0, 3);
  const legend = focusAreas.map((item, index) => ({
    key: `skill${index + 1}`,
    label: item.label,
  }));

  const timeline = Array.from({ length: 6 }, (_, index) => {
    const row = {
      week: `W${index + 1}`,
    };

    focusAreas.forEach((item, itemIndex) => {
      const anchor = Math.max(18, item.progress - 24 - itemIndex * 5);
      row[`skill${itemIndex + 1}`] = clamp(anchor + index * 5 + (itemIndex === 0 ? 4 : 0), 0, 100);
    });

    return row;
  });

  return { timeline, legend };
}

export function buildLearningExperience({
  user = {},
  recommendations = [],
  catalogCourses = [],
  enrolledCourseIds = [],
  bookmarkedCourseIds = [],
}) {
  const insights = buildLearningInsights(user, recommendations, enrolledCourseIds);
  const catalogMap = new Map(
    [...recommendations, ...catalogCourses].map((course) => [normalizeCourseId(course), course]),
  );
  const completedSet = new Set((user?.completedCourses || []).map((id) => String(id)));
  const enrolledList = enrolledCourseIds
    .map((courseId, index) => {
      const key = String(courseId);
      const course = catalogMap.get(key) || null;
      return {
        id: key,
        course,
        progress: buildCourseProgress(key, completedSet, index),
      };
    });

  const completedCount = enrolledList.filter((item) => item.progress >= 100).length;
  const activeCount = Math.max(enrolledList.length - completedCount, 0);
  const averageMatch = Math.round(
    average(recommendations.map((course) => course.relevanceScore || course.matchPercentage || 0)),
  );
  const streakDays = clamp(
    Math.round((user?.weeklyLearningHours || 4) * 1.4 + activeCount * 1.5 + completedCount * 2),
    2,
    30,
  );
  const weeklyStudyHours = Math.max(
    Number(user?.weeklyLearningHours || 0),
    Math.round(average(insights.weeklyActivity || [])),
  );
  const completionPercent = enrolledList.length
    ? Math.round(average(enrolledList.map((item) => item.progress)))
    : 0;
  const xp = Math.round(
    completedCount * 220 +
    activeCount * 90 +
    bookmarkedCourseIds.length * 20 +
    averageMatch * 4 +
    streakDays * 8,
  );
  const xpPerLevel = 300;
  const level = Math.max(1, Math.floor(xp / xpPerLevel) + 1);
  const levelFloor = (level - 1) * xpPerLevel;
  const nextLevelXp = level * xpPerLevel;
  const levelProgress = clamp(Math.round(((xp - levelFloor) / xpPerLevel) * 100));

  const badges = [
    {
      id: "beginner",
      label: "Beginner",
      icon: "🌱",
      earned: enrolledList.length >= 1,
      description: "Started your first guided course path.",
    },
    {
      id: "consistency",
      label: "Consistency",
      icon: "🔥",
      earned: streakDays >= 7,
      description: "Kept a solid weekly learning streak.",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: "🚀",
      earned: completedCount >= 2 || completionPercent >= 75,
      description: "Sustained deep progress across advanced learning steps.",
    },
  ];

  const progressBars = [
    {
      id: "study-hours",
      label: "Weekly study hours",
      value: clamp(Math.round((weeklyStudyHours / Math.max(6, (user?.weeklyLearningHours || 4) + 2)) * 100)),
      hint: `${weeklyStudyHours}h tracked this week`,
    },
    {
      id: "completion",
      label: "Course completion",
      value: completionPercent,
      hint: `${completedCount}/${Math.max(enrolledList.length, 1)} roadmap steps completed`,
    },
    {
      id: "xp",
      label: "Level progress",
      value: levelProgress,
      hint: `${xp}/${nextLevelXp} XP`,
    },
  ];

  const { timeline: skillGrowthTimeline, legend: skillGrowthLegend } =
    buildSkillGrowthTimeline(insights.skillGrowth || []);

  const firstIncompleteIndex = enrolledList.findIndex((item) => item.progress < 100);
  const activeIndex = firstIncompleteIndex === -1 ? enrolledList.length : firstIncompleteIndex;
  const futureRecommendations = recommendations
    .filter((course) => !enrolledCourseIds.some((courseId) => String(courseId) === normalizeCourseId(course)))
    .slice(0, 2);

  const roadmapSteps = [
    ...enrolledList.map((item, index) => ({
      id: item.id,
      course: item.course,
      title: item.course?.title || "Enrolled Course",
      description: item.course?.description || "Continue building this skill block.",
      status: item.progress >= 100 ? "completed" : index === activeIndex ? "active" : index > activeIndex ? "locked" : "completed",
      progress: item.progress,
      locked: index > activeIndex,
      recommended: false,
    })),
    ...futureRecommendations.map((course, index) => ({
      id: normalizeCourseId(course),
      course,
      title: course.title,
      description: buildWhyCourseSummary(course, user),
      status: "locked",
      progress: 0,
      locked: true,
      recommended: true,
      unlockAfter: activeIndex + index + 1,
    })),
  ];

  const highestMilestone = completionPercent >= 75 ? 75 : completionPercent >= 50 ? 50 : completionPercent >= 25 ? 25 : 0;
  const stableTimestamp =
    user?.lastActivityAt ||
    user?.lastLoginAt ||
    user?.updatedAt ||
    user?.createdAt ||
    "2026-01-01T00:00:00.000Z";
  const notifications = [
    {
      id: "notif-recommendation-refresh",
      icon: "🎯",
      bg: "rgba(74, 184, 245, 0.12)",
      title: "New recommendations ready",
      desc: recommendations[0]
        ? `${recommendations[0].title} is your strongest match at ${Math.round(recommendations[0].matchPercentage || recommendations[0].relevanceScore || 0)}%.`
        : "Fresh recommendations are ready based on your current profile.",
      time: "Today",
      createdAt: stableTimestamp,
    },
    {
      id: "notif-inactivity-watch",
      icon: streakDays <= 4 ? "⏳" : "✅",
      bg: streakDays <= 4 ? "rgba(240, 160, 48, 0.12)" : "rgba(24, 201, 138, 0.12)",
      title: streakDays <= 4 ? "Stay active this week" : "Learning streak is healthy",
      desc: streakDays <= 4
        ? "You are close to losing momentum. Continue one roadmap step to protect your streak."
        : `You have a ${streakDays}-day learning streak. Keep it going with your active course.`,
      time: streakDays <= 4 ? "Needs attention" : "Today",
      createdAt: stableTimestamp,
    },
    highestMilestone
      ? {
          id: `notif-progress-${highestMilestone}`,
          icon: "🏁",
          bg: "rgba(99, 102, 241, 0.12)",
          title: `${highestMilestone}% progress milestone reached`,
          desc: `Your roadmap completion is now at ${completionPercent}%. You're moving steadily toward the next badge.`,
          time: "Today",
          createdAt: stableTimestamp,
        }
      : null,
  ].filter(Boolean);

  return {
    insights,
    xp,
    level,
    nextLevelXp,
    levelProgress,
    streakDays,
    weeklyStudyHours,
    completionPercent,
    bookmarkCount: bookmarkedCourseIds.length,
    badges,
    earnedBadges: badges.filter((badge) => badge.earned),
    progressBars,
    skillGrowthTimeline,
    skillGrowthLegend,
    roadmapSteps,
    notifications,
    enrolledList,
    averageMatch,
  };
}
