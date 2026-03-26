import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import SkillGapAlert from "../components/common/SkillGapAlert.jsx";
import { enrollCourse, unenrollCourse } from "../services/courseService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { getSession } from "../services/authService.js";
import { useUiStore } from "../store/ui.js";
import { getBarColor, getMatch } from "../data/courseiq1.js";

function getCourseAccent(course) {
  const category = String(course.category || "").toLowerCase();
  if (category.includes("ai") || category.includes("ml")) return "var(--bg-ml)";
  if (category.includes("data")) return "var(--bg-py)";
  if (category.includes("cloud")) return "var(--bg-aws)";
  if (category.includes("web")) return "var(--bg-web)";
  if (category.includes("design")) return "var(--bg-ux)";
  return "var(--bg-api)";
}

export default function Recommendations() {
  const { openExplain } = useOutletContext();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const [filter, setFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const clearNewRecs = useUiStore((state) => state.clearNewRecs);

  useEffect(() => {
    clearNewRecs();
  }, [clearNewRecs]);

  useEffect(() => {
    let cancelled = false;

    fetchRecommendations()
      .then((data) => {
        if (!cancelled) {
          setCourses(data.recommendations || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || "Failed to load recommendations.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const insights = useMemo(
    () => buildLearningInsights(user, courses, enrolledCourses),
    [user, courses, enrolledCourses]
  );

  const filteredCourses = useMemo(() => {
    if (filter === "perfect") return courses.filter((course) => course.relevanceScore >= 90);
    if (filter === "strong") {
      return courses.filter((course) => course.relevanceScore >= 70 && course.relevanceScore < 90);
    }
    if (filter === "growth") {
      return courses.filter((course) => course.relevanceScore >= 50 && course.relevanceScore < 70);
    }
    if (filter === "stretch") return courses.filter((course) => course.relevanceScore < 50);
    return courses;
  }, [courses, filter]);

  if (loading) {
    return <div className="page anim"><div className="empty-state">Loading personalized recommendations...</div></div>;
  }

  if (error) {
    return <div className="page anim"><div className="empty-state error">{error}</div></div>;
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Transparent Recommendations</div>
        <div className="ps">Every course is ranked with a visible scoring model so students can trust why it appears here.</div>
      </div>

      <SkillGapAlert gap={insights.skillGap} />

      <div className="reco-banner">
        <div>
          <div className="analytics-title">Relevance Score Formula</div>
          <div className="analytics-subtitle">
            Interest 30% · Skill 25% · Career 20% · Rating 10% · Popularity 10% · Recency 5%
          </div>
        </div>
        <div className="tg">Explainable by design</div>
      </div>

      <div className="ftabs">
        {[
          ["all", `All (${courses.length})`],
          ["perfect", "Perfect Fit"],
          ["strong", "Strong Match"],
          ["growth", "Growth Zone"],
          ["stretch", "Skill Stretch"],
        ].map(([value, label]) => (
          <button key={value} className={`ft ${filter === value ? "on" : ""}`} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="rec-grid">
        {filteredCourses.map((course) => {
          const score = course.relevanceScore || 0;
          const match = course.matchCategory || getMatch(score).label;
          const isEnrolled = (enrolledCourses || []).some((id) => String(id) === String(course._id));

          return (
            <Motion.div
              className="rec-card glass-card"
              key={course._id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="course-card-banner" style={{ background: getCourseAccent(course) }}>
                <PlatformBadge platform={course.platform} />
                <div className="course-banner-score">{Math.round(score)}%</div>
              </div>

              <div className="course-card-content">
                <div className="course-card-head">
                  <div>
                    <div className="ctitle">{course.title}</div>
                    <div className="course-card-sub">
                      {course.provider} · {course.duration || "Self-paced"}
                    </div>
                  </div>
                  <span className={`match-tag ${match.toLowerCase().replace(/\s+/g, "-")}`}>{match}</span>
                </div>

                <div className="course-card-metrics">
                  <span>⭐ {Number(course.rating || 0).toFixed(1)}</span>
                  <span>{course.isFree ? "Free" : `$${course.price}`}</span>
                  <span>{(course.enrollments || 0).toLocaleString()} learners</span>
                </div>

                <div className="mbar">
                  <Motion.div
                    className="mfill"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    style={{ background: getBarColor(score) }}
                    />
                </div>

                <div className="reason-tag-list">
                  {(course.reasonTags || []).map((tag) => (
                    <span key={tag} className="reason-tag">{tag}</span>
                  ))}
                </div>

                <div className="course-card-tags">
                  {(course.tags || []).slice(0, 4).map((tag) => (
                    <span key={tag} className="tg">{tag}</span>
                  ))}
                </div>

                <div className="course-card-actions">
                  <Motion.button
                    className="btn"
                    style={
                      isEnrolled
                        ? { background: "#c0392b", color: "#fff", border: "1px solid #a93226" }
                        : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
                    }
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      try {
                        if (isEnrolled) {
                          await unenrollCourse(course._id);
                          return;
                        }
                        await enrollCourse(course._id);
                      } catch (err) {
                        alert(err.response?.data?.error || err.message || "Failed to update enrollment.");
                      }
                    }}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll"}
                  </Motion.button>
                  <Motion.button
                    className="btn bg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openExplain(course)}
                  >
                    Explain
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </div>

      {filteredCourses.length === 0 ? <div className="empty-state">No courses match this filter.</div> : null}
    </div>
  );
}
