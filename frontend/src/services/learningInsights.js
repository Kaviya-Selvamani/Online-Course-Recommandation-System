export const CAREER_SKILL_MAP = {
  "ML Engineer": ["Linear Algebra", "Deep Learning", "PyTorch", "Model Deployment"],
  "Data Scientist": ["Statistics", "SQL", "Python", "Visualization"],
  "Frontend Developer": ["React", "TypeScript", "State Management", "Accessibility"],
  "Full Stack Developer": ["Node.js", "React", "Databases", "API Design"],
  "UX Designer": ["Figma", "User Research", "Interaction Design", "Prototyping"],
  "Cloud Architect": ["AWS", "Networking", "Terraform", "Security"],
  "Data Analyst": ["SQL", "Excel", "Pandas", "Dashboarding"],
  "AI Researcher": ["Transformers", "PyTorch", "Deep Learning", "Linear Algebra"],
  "Backend Developer": ["Node.js", "System Design", "Databases", "API Security"],
};

export const PLATFORM_META = {
  Coursera: { short: "C", label: "Coursera" },
  "edX": { short: "E", label: "edX" },
  Harvard: { short: "H", label: "Harvard" },
  NPTEL: { short: "N", label: "NPTEL" },
  Udacity: { short: "U", label: "Udacity" },
  Stanford: { short: "S", label: "Stanford" },
};

export const COMPLETED_COURSES = [
  { name: "Python for Data Analysis", category: "Data", level: "Beginner", grade: "A", credits: 3 },
  { name: "React Basics", category: "Web Dev", level: "Beginner", grade: "A-", credits: 3 },
  { name: "SQL Fundamentals", category: "Data", level: "Beginner", grade: "B+", credits: 2 },
  { name: "Intro to ML", category: "AI/ML", level: "Intermediate", grade: "A", credits: 4 },
  { name: "Statistics for DS", category: "Math", level: "Intermediate", grade: "A-", credits: 3 },
];

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildWeeklyActivity(hours = 4) {
  const templates = {
    low: [0.4, 0.7, 0.5, 0.9, 0.6, 0.7, 0.2],
    medium: [0.7, 1.2, 0.8, 1.4, 1.1, 1.7, 0.6],
    high: [1.1, 1.6, 1.2, 1.8, 1.5, 2.2, 1.1],
  };
  const key = hours <= 3 ? "low" : hours <= 6 ? "medium" : "high";
  return templates[key].map((value) => Math.round(value * 10) / 10);
}

export function getPlatformMeta(platform) {
  return PLATFORM_META[platform] || {
    short: String(platform || "C").slice(0, 1).toUpperCase(),
    label: platform || "Platform",
  };
}

export function getSkillGapData(user, recommendations = []) {
  const goal = user?.goal || user?.careerGoal || "ML Engineer";
  const requiredSkills = CAREER_SKILL_MAP[goal] || ["Critical Thinking", "Projects", "Core Concepts"];
  const knownTerms = [
    ...(user?.interests || []),
    ...recommendations.flatMap((course) => course.tags || []),
  ].map((item) => String(item).toLowerCase());

  const missingSkills = requiredSkills.filter(
    (skill) => !knownTerms.some((term) => term.includes(skill.toLowerCase()) || skill.toLowerCase().includes(term))
  );

  const recommendedCourse =
    recommendations.find((course) =>
      (course.tags || []).some((tag) =>
        missingSkills.some((skill) => String(tag).toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(String(tag).toLowerCase()))
      )
    ) || recommendations[0] || null;

  return {
    goal,
    missingSkills: missingSkills.slice(0, 4),
    recommendedCourse,
  };
}

export function buildLearningInsights(user, recommendations = [], enrolledCourses = []) {
  const weeklyActivity = buildWeeklyActivity(user?.weeklyLearningHours || 4);
  const categories = recommendations.reduce((acc, course) => {
    const key = course.category || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(course.relevanceScore || course.matchPercentage || 0);
    return acc;
  }, {});

  const domainDistribution = Object.entries(categories)
    .map(([label, scores]) => ({
      label,
      value: Math.round(average(scores)),
    }))
    .sort((a, b) => b.value - a.value);

  const strongestAreas = domainDistribution.slice(0, 3);
  const weakAreas = [...domainDistribution].sort((a, b) => a.value - b.value).slice(0, 3);

  const skillGrowth = strongestAreas.concat(weakAreas)
    .filter((item, index, items) => items.findIndex((entry) => entry.label === item.label) === index)
    .slice(0, 4)
    .map((item, index) => ({
      label: item.label,
      progress: Math.min(96, Math.max(35, item.value + (index % 2 === 0 ? 8 : -4))),
    }));

  const averageMatchScore = Math.round(average(recommendations.map((course) => course.relevanceScore || course.matchPercentage || 0)) || 0);
  const topSkillDomain = strongestAreas[0]?.label || user?.interests?.[0] || "AI/ML";
  const weakestSkillDomain = weakAreas[0]?.label || "Cloud";

  const skillGap = getSkillGapData(user, recommendations);
  const recommendedFocusAreas = [
    ...skillGap.missingSkills.slice(0, 2),
    ...weakAreas.map((item) => item.label),
  ]
    .filter((item, index, items) => item && items.indexOf(item) === index)
    .slice(0, 4);

  return {
    weeklyActivity,
    domainDistribution,
    strongestAreas,
    weakAreas,
    skillGrowth,
    averageMatchScore,
    topSkillDomain,
    weakestSkillDomain,
    skillGap,
    recommendedFocusAreas,
    streak: 12 + Math.min(6, enrolledCourses.length),
    completedCourses: COMPLETED_COURSES,
    creditsUsed: COMPLETED_COURSES.reduce((sum, course) => sum + course.credits, 0),
  };
}
