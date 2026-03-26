import { AnimatePresence, motion as Motion } from "framer-motion";
import { useMemo, useState } from "react";
import { calcScore, getMatch } from "../../data/courseiq1.js";

function buildFallbackScore(course) {
  const ratingScore = Math.round((Number(course?.rating || 0) / 5) * 100);
  const popularityScore = Math.min(100, Math.round(Number(course?.enrollments || 0)));
  return Math.round(ratingScore * 0.65 + popularityScore * 0.35);
}

function buildLegacyBreakdown(course) {
  if (!course?.scores) return [];

  return [
    { key: "interest", label: "Interest Match", value: course.scores.interest, weight: 0.4, description: "Overlap between the course topics and your interests" },
    { key: "skill", label: "Skill Alignment", value: course.scores.skill, weight: 0.25, description: "How well the course difficulty fits your current level" },
    { key: "rating", label: "Rating Signal", value: course.scores.rating, weight: 0.15, description: "Quality and learner satisfaction" },
    { key: "popularity", label: "Popularity", value: course.scores.popularity, weight: 0.1, description: "Demand from similar learners" },
    { key: "career", label: "Career Fit", value: course.scores.career, weight: 0.1, description: "Alignment with likely role outcomes" },
  ].map((item) => ({
    ...item,
    contribution: Math.round(item.value * item.weight * 10) / 10,
  }));
}

function buildLegacyWhy(course, score) {
  const reasons = [];

  if ((course.tags || []).length) {
    reasons.push(`Matches your interest in ${course.tags[0]}`);
  }
  reasons.push(`${course.difficulty || "Beginner"}-friendly level`);
  if (course.enrollments) {
    reasons.push("Popular among learners with similar goals");
  }
  if ((course.careerPaths || []).length) {
    reasons.push(`Fits your career goal: ${course.careerPaths[0]}`);
  }

  return {
    score,
    category: getMatch(score).label,
    breakdown: buildLegacyBreakdown(course),
    why: reasons.slice(0, 4),
  };
}

function buildFallbackWhy(course) {
  const score = buildFallbackScore(course);
  const reasons = [];

  if ((course?.tags || []).length) {
    reasons.push(`Covers ${course.tags[0]} and related skills`);
  }
  if (course?.difficulty) {
    reasons.push(`${course.difficulty} level course`);
  }
  if (course?.rating) {
    reasons.push(`Strong learner rating of ${Number(course.rating).toFixed(1)}/5`);
  }
  if (course?.enrollments) {
    reasons.push("Popular with learners on the platform");
  }

  return {
    score,
    category: getMatch(score).label,
    breakdown: normalizeBreakdown([]),
    why: reasons.slice(0, 4),
  };
}

const STANDARD_BREAKDOWN = [
  { key: "interest", label: "Interest Match", weight: 0.3, description: "Overlap between course topics and your interests" },
  { key: "skill", label: "Skill Level Match", weight: 0.25, description: "How well the course difficulty fits your current level" },
  { key: "career", label: "Career Goal Alignment", weight: 0.2, description: "Alignment with your career goal and roadmap direction" },
  { key: "rating", label: "Course Rating", weight: 0.1, description: "Learner satisfaction and course quality confidence" },
  { key: "popularity", label: "Popularity", weight: 0.1, description: "Demand among learners with similar profiles" },
  { key: "recency", label: "Recency", weight: 0.05, description: "Freshness and recent relevance of the course" },
];

function normalizeBreakdown(breakdown = []) {
  const indexByKey = new Map(
    breakdown.map((item) => [
      String(item.key || item.label || "")
        .toLowerCase()
        .replace(/\s+/g, ""),
      item,
    ]),
  );

  return STANDARD_BREAKDOWN.map((base) => {
    const raw =
      indexByKey.get(base.key) ||
      indexByKey.get(base.label.toLowerCase().replace(/\s+/g, "")) ||
      {};
    const value = Math.max(0, Math.min(100, Number(raw.value || 0)));
    return {
      key: base.key,
      label: raw.label || base.label,
      weight: typeof raw.weight === "number" ? raw.weight : base.weight,
      description: raw.description || base.description,
      value,
      contribution: Math.round(value * (typeof raw.weight === "number" ? raw.weight : base.weight) * 10) / 10,
    };
  });
}

export default function CourseIQMatchModal({ course, onClose }) {
  const [openPanel, setOpenPanel] = useState("interest");

  const content = useMemo(() => {
    if (!course) return null;

    if (course.scoreBreakdown?.length) {
      return {
        score: course.relevanceScore || course.matchPercentage || 0,
        category: course.matchCategory || getMatch(course.relevanceScore || course.matchPercentage || 0).label,
        breakdown: normalizeBreakdown(course.scoreBreakdown),
        why: course.whyRecommended || [],
      };
    }

    if (!course.scores) {
      return buildFallbackWhy(course);
    }

    const legacy = buildLegacyWhy(course, calcScore(course.scores));
    return {
      ...legacy,
      breakdown: normalizeBreakdown(legacy.breakdown),
      why: legacy.why,
    };
  }, [course]);

  if (!course || !content) return null;

  return (
    <Motion.div
      className="overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Motion.div
        className="modal insight-modal"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="modal-hd">
          <div>
            <div className="modal-title">Why This Course</div>
            <div style={{ fontSize: 12.5, color: "var(--t2)", marginTop: 3 }}>{course.title}</div>
          </div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="why-course-box">
          <div className="why-course-heading">Why this course was recommended</div>
          <div className="why-course-list">
            {content.why.map((reason) => (
              <div className="why-course-item" key={reason}>
                <span className="why-course-check">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="formula-chip-row">
          {content.breakdown.map((item) => (
            <span key={`formula-${item.key}`} className="formula-chip">
              {item.label} - {Math.round(item.weight * 100)}%
            </span>
          ))}
        </div>

        {content.breakdown.map((item, index) => (
          <Motion.div
            className="bd-item"
            key={item.key || item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <button
              type="button"
              className="bd-row-toggle"
              onClick={() => setOpenPanel((current) => (current === item.key ? "" : item.key))}
            >
              <span className="bd-lbl">{item.label}</span>
              <span className="bd-pct">{item.value}%</span>
            </button>
            <div className="bd-track">
              <Motion.div
                className="bd-fill"
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            </div>
            <AnimatePresence initial={false}>
              {openPanel === item.key ? (
                <Motion.div
                  className="bd-expand"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="bd-wt">
                    Weight: {Math.round(item.weight * 100)}% · {item.description}
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>
          </Motion.div>
        ))}

        <div className="modal-total">
          <div className="mt-val">{Math.round(content.score)}%</div>
          <div className="mt-lbl">{content.category}</div>
        </div>
      </Motion.div>
    </Motion.div>
  );
}
