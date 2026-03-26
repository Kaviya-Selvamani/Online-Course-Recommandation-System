import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Recommendation from "../models/Recommendation.js";

const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];
const DEFAULT_WEIGHTS = {
  interest: 0.3,
  skill: 0.25,
  career: 0.2,
  rating: 0.1,
  popularity: 0.1,
  recency: 0.05,
};

const CAREER_KEYWORDS = {
  "Machine Learning Engineer": ["Machine Learning", "ML", "AI", "Python", "Deep Learning", "PyTorch", "TensorFlow", "Neural Networks", "Linear Algebra"],
  "ML Engineer": ["Machine Learning", "ML", "AI", "Python", "Deep Learning", "PyTorch", "TensorFlow", "Neural Networks", "Linear Algebra"],
  "Data Scientist": ["Data Science", "Python", "Statistics", "ML", "Machine Learning", "Pandas", "Visualization", "SQL"],
  "Frontend Developer": ["React", "JavaScript", "JS", "CSS", "HTML", "Web Development", "Frontend", "TypeScript"],
  "Full Stack Developer": ["React", "Node", "JavaScript", "Express", "MongoDB", "Web Development", "SQL", "Backend", "REST"],
  "UX Designer": ["UX", "Design", "Figma", "Prototyping", "User Research", "UI"],
  "Cloud Engineer": ["Cloud", "AWS", "Azure", "GCP", "DevOps", "Docker", "Kubernetes", "Terraform"],
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
  let base = 55;
  let message = "Below your current level but still useful for revision";

  if (diff === 0) {
    base = 100;
    message = `Aligned with your ${user.skillLevel || "Beginner"} level`;
  } else if (diff === 1) {
    base = 80;
    message = "Slight stretch that builds your next skill tier";
  } else if (diff === -1) {
    base = 70;
    message = "Comfortable revision of foundations";
  } else if (diff >= 2) {
    base = 35;
    message = "Advanced jump that may need more preparation";
  }

  const termMap = [
    { key: "python", terms: ["python"] },
    { key: "machineLearning", terms: ["machine learning", "ml", "deep learning", "ai", "pytorch", "tensorflow"] },
    { key: "statistics", terms: ["statistics", "probability"] },
    { key: "algorithms", terms: ["algorithm", "dsa", "data structure"] },
    { key: "dataScience", terms: ["data science", "data analysis", "pandas", "sql", "visualization"] },
  ];
  const courseTerms = [course.title, course.category, ...(course.tags || []), course.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const matchedSkillKeys = termMap
    .filter((entry) => entry.terms.some((term) => courseTerms.includes(term)))
    .map((entry) => entry.key);

  const profileSkills = user.skills || {};
  const relevantSkillValues = matchedSkillKeys
    .map((key) => Number(profileSkills[key]))
    .filter((value) => Number.isFinite(value));
  const averageSkillStrength = relevantSkillValues.length
    ? relevantSkillValues.reduce((sum, value) => sum + value, 0) / relevantSkillValues.length
    : null;
  const skillAdjustment = averageSkillStrength == null ? 0 : ((averageSkillStrength - 50) / 50) * 12;
  const adjustedValue = clamp(base + skillAdjustment);

  return { value: roundScore(adjustedValue), message };
}

function computeCareerGoalMatch(course, user) {
  const careerGoal = user.careerTarget || user.careerGoal || "";
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

function clampWeight(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, roundScore(value / total)])
  );
}

function buildAdaptiveWeights({ interestMatchRate, skillMatchRate, avgRating }) {
  const interestBoost = (interestMatchRate - 0.5) * 0.2;
  const skillBoost = (skillMatchRate - 0.5) * 0.16;
  const ratingBoost = ((avgRating - 3.5) / 1.5) * 0.1;

  const weights = {
    interest: clampWeight(DEFAULT_WEIGHTS.interest + interestBoost, 0.2, 0.4),
    skill: clampWeight(DEFAULT_WEIGHTS.skill + skillBoost, 0.2, 0.35),
    career: DEFAULT_WEIGHTS.career,
    rating: clampWeight(DEFAULT_WEIGHTS.rating + ratingBoost, 0.05, 0.2),
    popularity: DEFAULT_WEIGHTS.popularity,
    recency: DEFAULT_WEIGHTS.recency,
  };

  return normalizeWeights(weights);
}

function buildOptimizationSummary(stats, weights) {
  const notes = [];
  if (stats.avgRating >= 4.4) {
    notes.push("Learners tend to choose highly rated courses, so rating weight increased.");
  }
  if (stats.interestMatchRate >= 0.6) {
    notes.push("Strong interest alignment observed, emphasizing interest match.");
  }
  if (stats.skillMatchRate >= 0.7) {
    notes.push("Learners prefer level-aligned courses, boosting skill-fit weight.");
  }
  if (!notes.length) {
    notes.push("Using balanced weights based on recent enrollment signals.");
  }
  return {
    weights,
    signals: stats,
    rationale: notes,
  };
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
    bullets.push(`Fits your career goal: ${user.careerTarget || user.careerGoal || "your target role"}`);
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

function buildScoreBreakdown({ interest, skill, career, rating, popularity, recency, weights }) {
  const normalizedWeights = weights || DEFAULT_WEIGHTS;
  return [
    {
      key: "interest",
      label: "Interest Match",
      value: interest.value,
      weight: normalizedWeights.interest,
      contribution: roundScore(interest.value * normalizedWeights.interest),
      description: "Overlap between course topics and your interests",
    },
    {
      key: "skill",
      label: "Skill Level Match",
      value: skill.value,
      weight: normalizedWeights.skill,
      contribution: roundScore(skill.value * normalizedWeights.skill),
      description: "Fit between your level and the course difficulty",
    },
    {
      key: "career",
      label: "Career Goal Match",
      value: career.value,
      weight: normalizedWeights.career,
      contribution: roundScore(career.value * normalizedWeights.career),
      description: "Alignment with your stated career goal",
    },
    {
      key: "rating",
      label: "Course Rating",
      value: rating,
      weight: normalizedWeights.rating,
      contribution: roundScore(rating * normalizedWeights.rating),
      description: "Learner satisfaction and quality signal",
    },
    {
      key: "popularity",
      label: "Popularity",
      value: popularity,
      weight: normalizedWeights.popularity,
      contribution: roundScore(popularity * normalizedWeights.popularity),
      description: "Demand compared with other courses",
    },
    {
      key: "recency",
      label: "Recency",
      value: recency,
      weight: normalizedWeights.recency,
      contribution: roundScore(recency * normalizedWeights.recency),
      description: "Freshness of the course in the catalog",
    },
  ];
}

async function getAdaptiveWeightsForUser(user) {
  const enrollments = await Enrollment.find({ user: user._id })
    .populate("course")
    .select("course status")
    .lean();

  if (!enrollments.length) {
    const fallback = normalizeWeights(DEFAULT_WEIGHTS);
    return buildOptimizationSummary(
      { interestMatchRate: 0.5, skillMatchRate: 0.5, avgRating: 3.8 },
      fallback
    );
  }

  const courses = enrollments.map((entry) => entry.course).filter(Boolean);
  const total = courses.length;

  const interestMatches = courses.filter((course) => computeInterestMatch(course, user).matched.length)
    .length;
  const interestMatchRate = total ? interestMatches / total : 0.5;

  const userSkillIdx = getDifficultyIndex(user.skillLevel || "Beginner");
  const skillMatches = courses.filter((course) => {
    const courseSkillIdx = getDifficultyIndex(course.difficulty || "Beginner");
    return Math.abs(courseSkillIdx - userSkillIdx) <= 1;
  }).length;
  const skillMatchRate = total ? skillMatches / total : 0.5;

  const avgRating = total
    ? courses.reduce((sum, course) => sum + (Number(course.rating) || 0), 0) / total
    : 3.8;

  const stats = {
    interestMatchRate: roundScore(interestMatchRate),
    skillMatchRate: roundScore(skillMatchRate),
    avgRating: roundScore(avgRating),
  };

  const weights = buildAdaptiveWeights(stats);
  return buildOptimizationSummary(stats, weights);
}

function computeRecommendation(course, user, maxEnrollments, weights) {
  const interest = computeInterestMatch(course, user);
  const skill = computeSkillLevelMatch(course, user);
  const career = computeCareerGoalMatch(course, user);
  const rating = computeCourseRatingScore(course);
  const popularity = computePopularityScore(course, maxEnrollments);
  const recency = computeRecencyScore(course);
  const activeWeights = weights || DEFAULT_WEIGHTS;

  const relevanceScore = roundScore(
    interest.value * activeWeights.interest +
      skill.value * activeWeights.skill +
      career.value * activeWeights.career +
      rating * activeWeights.rating +
      popularity * activeWeights.popularity +
      recency * activeWeights.recency
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
      weights: activeWeights,
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
  const optimization = await getAdaptiveWeightsForUser(user);
  const weights = optimization.weights;

  const recommendations = courses
    .filter(
      (course) =>
        !(user.enrolledCourses || []).some((id) => String(id) === String(course._id))
    )
    .map((course) => computeRecommendation(course, user, maxEnrollments, weights))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);

  try {
    const items = recommendations.map((course, index) => ({
      courseId: course._id,
      score: course.relevanceScore,
      rank: index + 1,
      reasons: course.whyRecommended || [],
    }));
    await Recommendation.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          generatedAt: new Date(),
          algorithmVersion: "adaptive-v1",
          weights,
          items,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.warn("Failed to store recommendations:", error?.message || error);
  }

  return res.json({
    total: recommendations.length,
    recommendations,
    optimization,
  });
}
