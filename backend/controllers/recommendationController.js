import Course from "../models/Course.js";
import User from "../models/User.js";

const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];

const CAREER_KEYWORDS = {
  "ML Engineer": ["Machine Learning", "ML", "AI", "Python", "Deep Learning", "PyTorch", "TensorFlow", "Neural Networks", "Linear Algebra"],
  "Data Scientist": ["Data Science", "Python", "Statistics", "ML", "Machine Learning", "Pandas", "Visualization", "SQL"],
  "Frontend Developer": ["React", "JavaScript", "JS", "CSS", "HTML", "Web Development", "Frontend", "TypeScript"],
  "Full Stack Developer": ["React", "Node", "JavaScript", "Express", "MongoDB", "Web Development", "SQL", "Backend", "REST"],
  "UX Designer": ["UX", "Design", "Figma", "Prototyping", "User Research", "UI"],
  "Cloud Architect": ["AWS", "Cloud", "DevOps", "Docker", "Kubernetes", "Architecture", "Terraform"],
  "Data Analyst": ["Data", "SQL", "Python", "Pandas", "Excel", "Visualization", "Statistics"],
  "AI Researcher": ["AI", "Deep Learning", "Neural Networks", "NLP", "Computer Vision", "Transformers", "PyTorch"],
  "Backend Developer": ["Node", "Express", "MongoDB", "SQL", "Python", "REST", "API", "Backend", "Docker"],
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value) {
  return Math.round(value * 10) / 10;
}

function normalizeTextList(items = []) {
  return items.map((item) => String(item).toLowerCase());
}

function getDifficultyIndex(level) {
  const idx = DIFFICULTY_ORDER.indexOf(level);
  return idx === -1 ? 0 : idx;
}

function getScoreCategory(score) {
  if (score >= 90) return "Perfect Fit";
  if (score >= 70) return "Strong Match";
  if (score >= 50) return "Growth Zone";
  return "Skill Stretch";
}

function computeInterestMatch(course, user) {
  const userInterests = normalizeTextList(user.interests || []);
  if (!userInterests.length) return { value: 35, matched: [] };

  const courseTerms = [
    course.category,
    ...(course.tags || []),
    course.title,
    course.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = user.interests.filter((interest) =>
    courseTerms.includes(String(interest).toLowerCase())
  );

  const coverage = matched.length / userInterests.length;
  const tagDensity = matched.length / Math.max(1, (course.tags || []).length);
  const value = clamp((coverage * 70) + (tagDensity * 30));

  return { value: roundScore(value), matched };
}

function computeSkillLevelMatch(course, user) {
  const userSkillIdx = getDifficultyIndex(user.skillLevel || "Beginner");
  const courseSkillIdx = getDifficultyIndex(course.difficulty || "Beginner");
  const diff = courseSkillIdx - userSkillIdx;

  if (diff === 0) return { value: 100, message: `Aligned with your ${user.skillLevel || "Beginner"} level` };
  if (diff === 1) return { value: 80, message: "Slight stretch that builds your next skill tier" };
  if (diff === -1) return { value: 70, message: "Comfortable revision of foundations" };
  if (diff >= 2) return { value: 35, message: "Advanced jump that may need more preparation" };
  return { value: 55, message: "Below your current level but still useful for revision" };
}

function computeCareerGoalMatch(course, user) {
  const careerGoal = user.careerGoal || "";
  const keywords = normalizeTextList(CAREER_KEYWORDS[careerGoal] || []);
  if (!keywords.length) return { value: 40, matched: [] };

  const courseTerms = [
    course.category,
    ...(course.tags || []),
    course.title,
    course.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = keywords.filter((keyword) => courseTerms.includes(keyword));
  const coverage = matched.length / keywords.length;
  const value = matched.length ? clamp(50 + coverage * 50) : 20;

  return { value: roundScore(value), matched };
}

function computeCourseRatingScore(course) {
  return roundScore(clamp(((course.rating || 0) / 5) * 100));
}

function computePopularityScore(course, maxEnrollments) {
  if (!maxEnrollments) return 40;
  return roundScore(clamp(((course.enrollments || 0) / maxEnrollments) * 100));
}

function computeRecencyScore(course) {
  const createdAt = course.createdAt ? new Date(course.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return 55;

  const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 30) return 100;
  if (ageDays <= 90) return 85;
  if (ageDays <= 180) return 70;
  if (ageDays <= 365) return 55;
  return 35;
}

function buildExplanations({ interest, skill, career, popularity, recency, user, course }) {
  const bullets = [];
  const tags = [];

  if (interest.matched.length) {
    bullets.push(`Matches your interests in ${interest.matched.slice(0, 2).join(" and ")}`);
    tags.push("Interest match");
  }

  if (skill.value >= 80) {
    bullets.push(skill.message);
    tags.push("Level aligned");
  } else if (skill.value >= 50) {
    bullets.push(skill.message);
    tags.push("Growth-ready");
  } else {
    bullets.push(skill.message);
    tags.push("Stretch course");
  }

  if (career.matched.length || career.value >= 60) {
    bullets.push(`Fits your career goal: ${user.careerGoal || "your target role"}`);
    tags.push("Career fit");
  }

  if (popularity >= 70) {
    bullets.push("Popular among learners with similar goals");
    tags.push("Popular");
  }

  if (recency >= 70) {
    bullets.push("Recently refreshed and still trending");
    tags.push("Fresh");
  }

  if ((course.tags || []).some((tag) => ["pytorch", "deep learning", "linear algebra"].includes(String(tag).toLowerCase()))) {
    tags.push("Skill-gap closer");
  }

  return {
    whyRecommended: bullets.slice(0, 4),
    reasonTags: Array.from(new Set(tags)).slice(0, 4),
  };
}

function buildScoreBreakdown({ interest, skill, career, rating, popularity, recency }) {
  return [
    {
      key: "interest",
      label: "Interest Match",
      value: interest.value,
      weight: 0.3,
      contribution: roundScore(interest.value * 0.3),
      description: "Overlap between course topics and your interests",
    },
    {
      key: "skill",
      label: "Skill Level Match",
      value: skill.value,
      weight: 0.25,
      contribution: roundScore(skill.value * 0.25),
      description: "Fit between your level and the course difficulty",
    },
    {
      key: "career",
      label: "Career Goal Match",
      value: career.value,
      weight: 0.2,
      contribution: roundScore(career.value * 0.2),
      description: "Alignment with your stated career goal",
    },
    {
      key: "rating",
      label: "Course Rating",
      value: rating,
      weight: 0.1,
      contribution: roundScore(rating * 0.1),
      description: "Learner satisfaction and quality signal",
    },
    {
      key: "popularity",
      label: "Popularity",
      value: popularity,
      weight: 0.1,
      contribution: roundScore(popularity * 0.1),
      description: "Demand compared with other courses",
    },
    {
      key: "recency",
      label: "Recency",
      value: recency,
      weight: 0.05,
      contribution: roundScore(recency * 0.05),
      description: "Freshness of the course in the catalog",
    },
  ];
}

function computeRecommendation(course, user, maxEnrollments) {
  const interest = computeInterestMatch(course, user);
  const skill = computeSkillLevelMatch(course, user);
  const career = computeCareerGoalMatch(course, user);
  const rating = computeCourseRatingScore(course);
  const popularity = computePopularityScore(course, maxEnrollments);
  const recency = computeRecencyScore(course);

  const relevanceScore = roundScore(
    interest.value * 0.3 +
      skill.value * 0.25 +
      career.value * 0.2 +
      rating * 0.1 +
      popularity * 0.1 +
      recency * 0.05
  );

  const matchCategory = getScoreCategory(relevanceScore);
  const { whyRecommended, reasonTags } = buildExplanations({
    interest,
    skill,
    career,
    popularity,
    recency,
    user,
    course,
  });

  return {
    _id: course._id,
    title: course.title,
    provider: course.provider,
    platform: course.platform,
    category: course.category,
    difficulty: course.difficulty,
    price: course.price,
    isFree: course.isFree,
    rating: course.rating,
    tags: course.tags,
    description: course.description,
    courseUrl: course.courseUrl,
    duration: course.duration,
    language: course.language,
    enrollments: course.enrollments,
    thumbnailUrl: course.thumbnailUrl,
    relevanceScore,
    matchPercentage: relevanceScore,
    matchCategory,
    reasonTags,
    whyRecommended,
    scoreBreakdown: buildScoreBreakdown({
      interest,
      skill,
      career,
      rating,
      popularity,
      recency,
    }),
  };
}

export async function getRecommendations(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const courses = await Course.find({});
  const maxEnrollments = Math.max(...courses.map((course) => course.enrollments || 0), 0);

  const recommendations = courses
    .filter(
      (course) =>
        !(user.enrolledCourses || []).some((id) => String(id) === String(course._id))
    )
    .map((course) => computeRecommendation(course, user, maxEnrollments))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);

  return res.json({
    total: recommendations.length,
    recommendations,
  });
}
