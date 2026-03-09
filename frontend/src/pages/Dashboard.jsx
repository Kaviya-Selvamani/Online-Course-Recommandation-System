import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import SkillGapAlert from "../components/common/SkillGapAlert.jsx";
import { BarChart, GrowthChart } from "../components/common/AnalyticsCharts.jsx";
import { enrollCourse } from "../services/courseService.js";
import { getSession } from "../services/authService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { useUiStore } from "../store/ui.js";
import { getBarColor, getMatch } from "../data/courseiq1.js";

function Counter({ to, suffix = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += to / 50;
      if (current >= to) {
        setValue(to);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [to]);

  return <>{value}{suffix}</>;
}

function getCourseBanner(category) {
  const normalized = String(category || "").toLowerCase();
  if (normalized.includes("ai") || normalized.includes("ml")) return "var(--bg-ml)";
  if (normalized.includes("data")) return "var(--bg-py)";
  if (normalized.includes("cloud")) return "var(--bg-aws)";
  if (normalized.includes("web")) return "var(--bg-web)";
  if (normalized.includes("design")) return "var(--bg-ux)";
  return "var(--bg-api)";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { openExplain } = useOutletContext();
  const session = getSession();
  const user = session?.user || {};
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    fetchRecommendations()
      .then((data) => {
        if (!cancelled) {
          setCourses(data.recommendations || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
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
    if (filter === "growth") return courses.filter((course) => course.relevanceScore >= 50 && course.relevanceScore < 70);
    if (filter === "trending") return [...courses].sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
    return courses;
  }, [courses, filter]);

  return (
    <div className="page anim">
      <div className="hero-greeting dashboard-hero">
        <div>
          <div className="hg-main">
            Weekly learning alignment: <em>{insights.averageMatchScore || 84}%</em>
          </div>
          <div className="hg-sub">
            Your strongest momentum is in <strong style={{ color: "var(--secondary-accent)" }}>{insights.topSkillDomain}</strong>.
            Stay consistent and your recommendation quality will keep improving.
          </div>
        </div>
        <div className="hero-badge-stack">
          <span className="dashboard-hero-chip">Streak +{insights.streak} days</span>
          <span className="dashboard-hero-chip">Top 12% consistency</span>
        </div>
      </div>

      <div className="g4">
        {[
          ["🔥", "Learning Streak", `${insights.streak}`, "days"],
          ["📈", "Weekly Alignment", `${insights.averageMatchScore || 84}`, "%"],
          ["🏆", "Top Skill Domain", insights.topSkillDomain, ""],
          ["⚡", "Skill Gap To Improve", insights.skillGap.missingSkills[0] || insights.weakestSkillDomain, ""],
        ].map(([icon, label, value, suffix]) => (
          <div className="card sc lift dashboard-stat" key={label}>
            <div className="dashboard-stat-icon">{icon}</div>
            <div className="sl">{label}</div>
            <div className="sv">{suffix ? <Counter to={Number(value)} suffix={suffix} /> : value}</div>
            <div className="sd">Personalized from your recent activity and recommendation fit.</div>
          </div>
        ))}
      </div>

      <SkillGapAlert gap={insights.skillGap} />

      <div className="g2">
        <div className="card analytics-card">
          <div className="analytics-title">Weekly Progress Summary</div>
          <BarChart labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} values={insights.weeklyActivity} />
        </div>
        <div className="card analytics-card">
          <div className="analytics-title">Skill Improvement Suggestions</div>
          <GrowthChart items={insights.skillGrowth} />
        </div>
      </div>

      <div className="sec">
        <div className="sec-t">Recommended Next Moves</div>
        <div className="sec-l" onClick={() => navigate("/recommendations")}>View all →</div>
      </div>

      <div className="ftabs">
        {[
          ["all", "All"],
          ["perfect", "Perfect Fit"],
          ["growth", "Growth Zone"],
          ["trending", "Trending"],
        ].map(([value, label]) => (
          <button key={value} className={`ft ${filter === value ? "on" : ""}`} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="dashboard-course-grid">
        {(loading ? [] : filteredCourses.slice(0, 4)).map((course) => {
          const isEnrolled = enrolledCourses.some((id) => String(id) === String(course._id));
          const match = course.matchCategory || getMatch(course.relevanceScore || 0).label;
          return (
            <div className="card dashboard-course-card" key={course._id}>
              <div className="course-card-banner" style={{ background: getCourseBanner(course.category) }}>
                <PlatformBadge platform={course.platform} />
                <div className="course-banner-score">{Math.round(course.relevanceScore || 0)}%</div>
              </div>
              <div className="course-card-content">
                <div className="ctitle">{course.title}</div>
                <div className="course-card-sub">{course.provider} · {course.duration || "Self-paced"}</div>
                <div className="course-card-metrics">
                  <span>{match}</span>
                  <span>⭐ {Number(course.rating || 0).toFixed(1)}</span>
                  <span>{course.isFree ? "Free" : `$${course.price}`}</span>
                </div>
                <div className="mbar">
                  <div className="mfill" style={{ width: `${course.relevanceScore}%`, background: getBarColor(course.relevanceScore || 0) }} />
                </div>
                <div className="reason-tag-list">
                  {(course.reasonTags || []).map((tag) => (
                    <span key={tag} className="reason-tag">{tag}</span>
                  ))}
                </div>
                <div className="course-card-actions">
                  <button
                    className="btn"
                    style={isEnrolled ? { background: "var(--ac2)", color: "#fff", border: "1px solid var(--ac)" } : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }}
                    disabled={isEnrolled}
                    onClick={async () => {
                      try {
                        await enrollCourse(course._id);
                      } catch (err) {
                        alert(err.response?.data?.error || err.message || "Failed to enroll.");
                      }
                    }}
                  >
                    {isEnrolled ? "Enrolled" : "Enroll"}
                  </button>
                  <button className="btn bg" onClick={() => openExplain(course)}>Explain</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? <div className="empty-state">Loading recommendations...</div> : null}
    </div>
  );
}
