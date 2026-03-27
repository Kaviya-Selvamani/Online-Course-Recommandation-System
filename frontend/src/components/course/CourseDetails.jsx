import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  enrollCourse,
  fetchCourseById,
  fetchCoursesCatalog,
  removeBookmark,
  saveBookmark,
  unenrollCourse,
} from "../../services/courseService.js";
import FeedbackModal from "./FeedbackModal.jsx";
import { buildCourseUiTags, buildWhyCourseSummary } from "../../services/experienceService.js";
import { getSession } from "../../services/authService.js";
import { useUiStore } from "../../store/ui.js";

const CATEGORY_ACCENTS = [
  { match: ["ai", "ml"], bg: "var(--bg-ml)", emoji: "AI" },
  { match: ["data", "science"], bg: "var(--bg-py)", emoji: "DS" },
  { match: ["cloud", "aws"], bg: "var(--bg-aws)", emoji: "CL" },
  { match: ["web", "frontend"], bg: "var(--bg-web)", emoji: "WEB" },
  { match: ["design", "ux"], bg: "var(--bg-ux)", emoji: "UX" },
];

function resolveAccent(category) {
  const value = String(category || "").toLowerCase();
  const hit = CATEGORY_ACCENTS.find((item) =>
    item.match.some((needle) => value.includes(needle))
  );
  if (hit) return hit;
  return { bg: "var(--bg-api)", emoji: "CS" };
}

function formatEnrollmentDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openExplain } = useOutletContext();
  const enrolledCourses = useUiStore((s) => s.enrolledCourses) || [];
  const bookmarkedCourseIds = useUiStore((s) => s.bookmarkedCourseIds) || [];
  const addBookmarkId = useUiStore((s) => s.addBookmarkId);
  const removeBookmarkId = useUiStore((s) => s.removeBookmarkId);
  const session = getSession();
  const user = session?.user || {};

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bar, setBar] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [ratingOverride, setRatingOverride] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const stateCourse = location.state?.course || null;
    const routeId = decodeURIComponent(String(id || ""));

    const normalizeKey = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const isLikelyObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value || ""));

    const findCourseInCatalog = (catalog = [], key = "") => {
      if (!Array.isArray(catalog) || !catalog.length) return null;
      const target = normalizeKey(key);
      return (
        catalog.find((course) => normalizeKey(course?._id) === target) ||
        catalog.find((course) => normalizeKey(course?.id) === target) ||
        catalog.find((course) => normalizeKey(course?.courseId) === target) ||
        catalog.find((course) => normalizeKey(course?.slug) === target) ||
        catalog.find((course) => normalizeKey(course?.title) === target) ||
        null
      );
    };

    const applyCourseData = (nextCourse) => {
      setCourse(nextCourse);
      setEnrollmentCount(nextCourse?.enrollments || 0);
      setRatingOverride(nextCourse?.rating || 0);
      setLoading(false);
      setError("");
    };

    const resolveCourse = async () => {
      if (stateCourse && !cancelled) {
        applyCourseData(stateCourse);
      } else if (!cancelled) {
        setLoading(true);
        setError("");
      }

      if (!routeId && stateCourse) {
        return;
      }

      if (!routeId) {
        if (!cancelled) {
          setError("Course not found.");
          setLoading(false);
        }
        return;
      }

      if (!isLikelyObjectId(routeId)) {
        try {
          const catalog = await fetchCoursesCatalog();
          const matched = findCourseInCatalog(catalog, routeId);
          if (matched) {
            if (!cancelled) {
              applyCourseData(matched);
            }
            return;
          }
        } catch {
          // Fall through to API fetch / error handling.
        }

        if (stateCourse) {
          if (!cancelled) {
            applyCourseData(stateCourse);
          }
          return;
        }
      }

      try {
        const data = await fetchCourseById(routeId);
        if (!cancelled) {
          applyCourseData(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (stateCourse) {
            applyCourseData(stateCourse);
            return;
          }
          setError(err.response?.data?.error || "Course not found.");
          setLoading(false);
        }
      }
    };

    resolveCourse();

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  useEffect(() => {
    if (course) {
      const t = setTimeout(() => setBar(true), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [course]);

  const accent = resolveAccent(course?.category);
  const providerName = course?.provider || course?.platform || "Course Provider";
  const prerequisites = course?.prerequisites || [];
  const enrollmentRoster = course?.enrollmentRoster || [];
  const canExplain = Boolean(course?.scoreBreakdown?.length || course?.scores);

  const breakdownItems = useMemo(() => {
    if (!course?.scoreBreakdown?.length) return [];
    return course.scoreBreakdown.map((item) => ({
      label: item.label || item.key || "Signal",
      value: Math.round(Number(item.value || 0)),
      weight: typeof item.weight === "number" ? `${Math.round(item.weight * 100)}%` : "—",
    }));
  }, [course]);

  const matchScore = Math.round(course?.relevanceScore || course?.matchPercentage || 0);
  const isSaved = bookmarkedCourseIds.some((bookmarkId) => String(bookmarkId) === String(course?._id));
  const experienceTags = buildCourseUiTags(course, [course]);

  if (loading) {
    return (
      <div className="page anim">
        <div className="empty-state">Loading course details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page anim">
        <button className="btn bg bsm" style={{ marginBottom: 16 }} onClick={() => navigate("/courses")}>
          ← Back to Courses
        </button>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Course not found</div>
          <div style={{ color: "var(--t2)" }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page anim">
        <button className="btn bg bsm" style={{ marginBottom: 16 }} onClick={() => navigate("/courses")}>
          ← Back to Courses
        </button>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Course not found</div>
          <div style={{ color: "var(--t2)" }}>No course with id {id} exists in the catalog.</div>
        </div>
      </div>
    );
  }

  const isEnrolled = enrolledCourses.some((enrolledId) => String(enrolledId) === String(course._id));

  return (
    <div className="page anim">
      <button className="btn bg bsm" style={{ marginBottom: 16 }} onClick={() => navigate("/courses")}>
        ← Back to Courses
      </button>

      <div className="cd-header">
        <div className="cd-thumb" style={{ background: accent.bg }}>
          {accent.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div className="cd-title">{course.title}</div>
          <div className="cd-meta-row">
            <span className={"bdg bdg-" + String(course.difficulty || "beginner").charAt(0).toLowerCase()}>{course.difficulty}</span>
            <span style={{ fontSize: 13, color: "var(--t2)" }}>⭐ {Number(ratingOverride || course.rating || 0).toFixed(1)}</span>
            <span className="tg">{course.category}</span>
            <span style={{ fontSize: 12, color: "var(--t3)" }}>
              {enrollmentCount.toLocaleString()} learners · {course.duration || "Self-paced"}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 14 }}>{course.description}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {experienceTags.map((tag) => (
              <span key={tag} className="tg">{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn bp"
              style={
                isEnrolled
                  ? { background: "#c0392b", color: "#fff", border: "1px solid #a93226" }
                  : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
              }
              onClick={async () => {
                try {
                  if (isEnrolled) {
                    await unenrollCourse(course._id);
                    setEnrollmentCount((prev) => Math.max(0, prev - 1));
                    return;
                  }
                  await enrollCourse(course._id);
                  setEnrollmentCount((prev) => prev + 1);
                } catch (err) {
                  alert(err.response?.data?.error || err.message || "Failed to update enrollment.");
                }
              }}
            >
              {isEnrolled ? "Unenroll" : "Enroll Now"}
            </button>
            <button
              className="btn bg"
              onClick={() => {
                if (!course?._id) {
                  alert("Feedback is available only for live catalog courses.");
                  return;
                }
                setFeedbackOpen(true);
              }}
            >
              Rate Course
            </button>
            <button
              className="btn bg"
              onClick={async () => {
                try {
                  if (isSaved) {
                    await removeBookmark(course._id);
                    removeBookmarkId(course._id);
                    return;
                  }
                  await saveBookmark(course._id);
                  addBookmarkId(course._id);
                } catch (err) {
                  alert(err.response?.data?.error || err.message || "Failed to update bookmark.");
                }
              }}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              className="btn bg"
              onClick={() => {
                if (!canExplain) {
                  alert("Personalized match insights appear in your Recommendations.");
                  return;
                }
                openExplain(course);
              }}
              disabled={!canExplain}
            >
              Explain Match
            </button>
          </div>
        </div>
      </div>

      <div className="cd-body">
        <div>
          <div className="cd-section">
            <div className="cd-stitle">About This Course</div>
            <p style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.7 }}>
              {course.description} This course includes hands-on projects and a final capstone.
            </p>
            <div style={{ marginTop: 14, borderRadius: 18, border: "1px solid var(--bd)", background: "rgba(15,23,42,0.35)", padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac)" }}>
                Why this course?
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
                {buildWhyCourseSummary(course, user)}
              </div>
            </div>
          </div>
          <div className="cd-section">
            <div className="cd-stitle">Provider & Platform</div>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,var(--ac),#0a8c5c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#fff",
                  fontFamily: "var(--fd)",
                }}
              >
                {providerName[0] || "C"}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--t)" }}>{providerName}</div>
                <div style={{ fontSize: 12, color: "var(--t2)" }}>{course.platform || "Online platform"}</div>
              </div>
            </div>
          </div>
          <div className="cd-section">
            <div className="cd-stitle">Prerequisites & Info</div>
            {prerequisites.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--t3)" }}>No prerequisites required.</div>
            ) : (
              prerequisites.map((p) => (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: "1px solid var(--bd)",
                    fontSize: 13,
                    color: "var(--t2)",
                  }}
                >
                  <span>📋</span>
                  {p}
                </div>
              ))
            )}
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--t3)" }}>
              Duration: <strong style={{ color: "var(--ac)" }}>{course.duration || "Self-paced"}</strong> · Language:{" "}
              <strong style={{ color: "var(--t)" }}>{course.language || "English"}</strong>
            </div>
          </div>
          <div className="cd-section">
            <div className="cd-stitle">Enrollment Roster</div>
            {enrollmentRoster.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--t3)" }}>
                No learners have enrolled in this course yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {enrollmentRoster.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      padding: 12,
                      border: "1px solid var(--bd)",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t)" }}>
                        {entry.learner?.name || "Unknown learner"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--t3)" }}>
                        {entry.learner?.role || "Learner"}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t2)", textAlign: "right" }}>
                      <div>Enrolled: {formatEnrollmentDate(entry.enrolledAt)}</div>
                      <div>Status: {entry.status || "enrolled"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="ri-panel">
            <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
              Relevance Intelligence
            </div>
            {course?.scoreBreakdown?.length ? (
              <>
                <div className="ri-score">
                  <div className="ri-val">{matchScore}%</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="mpill good">Personalized</span>
                  </div>
                </div>

                {breakdownItems.map((it) => (
                  <div key={it.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: "var(--t2)" }}>{it.label}</span>
                      <span style={{ fontWeight: 700, color: "var(--ac)" }}>{it.value}%</span>
                    </div>
                    <div className="bd-track">
                      <div className="bd-fill" style={{ width: bar ? it.value + "%" : "0%" }} />
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>Weight: {it.weight}</div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
                Personalized match signals will appear after this course is ranked in your Recommendations.
              </div>
            )}
          </div>
        </div>
      </div>

      {feedbackOpen ? (
        <FeedbackModal
          course={course}
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={(data) => {
            if (data?.courseRating) {
              setRatingOverride(data.courseRating);
            }
          }}
        />
      ) : null}
    </div>
  );
}
