import { useEffect, useMemo, useState } from "react";
import { calcScore, getMatch } from "../../data/courseiq1.js";

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

export default function CourseIQMatchModal({ course, onClose }) {
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVis(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const content = useMemo(() => {
    if (!course) return null;

    if (course.scoreBreakdown?.length) {
      return {
        score: course.relevanceScore || course.matchPercentage || 0,
        category: course.matchCategory || getMatch(course.relevanceScore || course.matchPercentage || 0).label,
        breakdown: course.scoreBreakdown,
        why: course.whyRecommended || [],
      };
    }

    return buildLegacyWhy(course, calcScore(course.scores));
  }, [course]);

  if (!course || !content) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal insight-modal" onClick={(event) => event.stopPropagation()}>
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

        {content.breakdown.map((item) => (
          <div className="bd-item" key={item.key || item.label}>
            <div className="bd-row">
              <span className="bd-lbl">{item.label}</span>
              <span className="bd-pct">{item.value}%</span>
            </div>
            <div className="bd-track">
              <div className="bd-fill" style={{ width: vis ? `${item.value}%` : "0%" }} />
            </div>
            <div className="bd-wt">
              Weight: {Math.round(item.weight * 100)}% · {item.description}
            </div>
          </div>
        ))}

        <div className="modal-total">
          <div className="mt-val">{Math.round(content.score)}%</div>
          <div className="mt-lbl">{content.category}</div>
        </div>
      </div>
    </div>
  );
}
