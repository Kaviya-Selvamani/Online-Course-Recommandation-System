import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import SkillGapAlert from "../components/common/SkillGapAlert.jsx";
import {
  enrollCourse,
  removeBookmark,
  saveBookmark,
  unenrollCourse,
} from "../services/courseService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import {
  buildCourseUiTags,
  buildLearningExperience,
  buildWhyCourseSummary,
} from "../services/experienceService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { getSession } from "../services/authService.js";
import { useUiStore } from "../store/ui.js";
import { getBarColor, getMatch } from "../data/courseiq1.js";
import FeedbackModal from "../components/course/FeedbackModal.jsx";

function getCourseAccent(course) {
  const category = String(course.category || "").toLowerCase();
  if (category.includes("ai") || category.includes("ml")) return "var(--bg-ml)";
  if (category.includes("data")) return "var(--bg-py)";
  if (category.includes("cloud")) return "var(--bg-aws)";
  if (category.includes("web")) return "var(--bg-web)";
  if (category.includes("design")) return "var(--bg-ux)";
  return "var(--bg-api)";
}

function RecommendationsSkeleton() {
  return (
    <div className="page anim">
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-5"
            style={{ minHeight: 340 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Recommendations() {
  const { openExplain } = useOutletContext();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const [filter, setFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [activeFeedbackCourse, setActiveFeedbackCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const bookmarkedCourseIds = useUiStore((state) => state.bookmarkedCourseIds);
  const addBookmarkId = useUiStore((state) => state.addBookmarkId);
  const removeBookmarkId = useUiStore((state) => state.removeBookmarkId);
  const clearNewRecs = useUiStore((state) => state.clearNewRecs);
  const upsertNotifications = useUiStore((state) => state.upsertNotifications);

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

  const experience = useMemo(
    () =>
      buildLearningExperience({
        user,
        recommendations: courses,
        enrolledCourseIds: enrolledCourses,
        bookmarkedCourseIds,
      }),
    [bookmarkedCourseIds, courses, enrolledCourses, user],
  );
  const notificationSignature = JSON.stringify(experience.notifications);
  const stableNotifications = useMemo(
    () => JSON.parse(notificationSignature),
    [notificationSignature],
  );

  useEffect(() => {
    if (!courses.length) return;
    upsertNotifications(stableNotifications);
  }, [courses.length, stableNotifications, upsertNotifications]);

  const filteredCourses = useMemo(() => {
    if (filter === "perfect") return courses.filter((course) => course.relevanceScore >= 90);
    if (filter === "strong") {
      return courses.filter((course) => course.relevanceScore >= 70 && course.relevanceScore < 90);
    }
    if (filter === "growth") {
      return courses.filter((course) => course.relevanceScore >= 50 && course.relevanceScore < 70);
    }
    if (filter === "saved") {
      return courses.filter((course) =>
        bookmarkedCourseIds.some((id) => String(id) === String(course._id)),
      );
    }
    return courses;
  }, [bookmarkedCourseIds, courses, filter]);

  if (loading) {
    return <RecommendationsSkeleton />;
  }

  if (error) {
    return <div className="page anim"><div className="empty-state error">{error}</div></div>;
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Transparent Recommendations</div>
        <div className="ps">Every recommendation now includes match percentage, tailored explanations, tags, and save actions.</div>
      </div>

      <SkillGapAlert gap={insights.skillGap} />

      <div className="reco-banner">
        <div>
          <div className="analytics-title">Recommendation Engine</div>
          <div className="analytics-subtitle">
            Match score + profile-based reasoning + gamified follow-up actions
          </div>
        </div>
        <div className="tg">Level {experience.level} learner</div>
      </div>

      <div className="ftabs">
        {[
          ["all", `All (${courses.length})`],
          ["perfect", "Perfect Fit"],
          ["strong", "Strong Match"],
          ["growth", "Growth Zone"],
          ["saved", `Saved (${bookmarkedCourseIds.length})`],
        ].map(([value, label]) => (
          <button key={value} className={`ft ${filter === value ? "on" : ""}`} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredCourses.map((course) => {
          const score = course.relevanceScore || course.matchPercentage || 0;
          const match = course.matchCategory || getMatch(score).label;
          const isEnrolled = (enrolledCourses || []).some((id) => String(id) === String(course._id));
          const isSaved = bookmarkedCourseIds.some((id) => String(id) === String(course._id));
          const experienceTags = buildCourseUiTags(course, courses);

          return (
            <Motion.div
              className="overflow-hidden rounded-[30px] border border-slate-800/70 bg-slate-900/80 shadow-[0_30px_90px_-60px_rgba(52,211,153,0.85)]"
              key={course._id}
              whileHover={{ y: -4, scale: 1.008 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ background: getCourseAccent(course) }}>
                <PlatformBadge platform={course.platform} />
                <div className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                  {Math.round(score)}% match
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="ctitle">{course.title}</div>
                    <div className="course-card-sub">
                      {course.provider} · {course.duration || "Self-paced"}
                    </div>
                  </div>
                  <span className={`match-tag ${match.toLowerCase().replace(/\s+/g, "-")}`}>{match}</span>
                </div>

                <div className="course-card-metrics" style={{ marginTop: 14 }}>
                  <span>⭐ {Number(course.rating || 0).toFixed(1)}</span>
                  <span>{course.isFree ? "Free" : `$${course.price}`}</span>
                  <span>{(course.enrollments || 0).toLocaleString()} learners</span>
                </div>

                <div className="mbar" style={{ marginTop: 16 }}>
                  <Motion.div
                    className="mfill"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    style={{ background: getBarColor(score) }}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Why this course?</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {buildWhyCourseSummary(course, user)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {experienceTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="reason-tag-list" style={{ marginTop: 14 }}>
                  {(course.reasonTags || []).map((tag) => (
                    <span key={tag} className="reason-tag">{tag}</span>
                  ))}
                </div>

                <div className="course-card-actions" style={{ marginTop: 18 }}>
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
                    onClick={() => setActiveFeedbackCourse(course)}
                  >
                    Rate
                  </Motion.button>
                  <Motion.button
                    className="btn bg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openExplain(course)}
                  >
                    Explain
                  </Motion.button>
                  <Motion.button
                    className="btn bg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
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
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </div>

      {filteredCourses.length === 0 ? <div className="empty-state">No courses match this filter.</div> : null}

      {activeFeedbackCourse ? (
        <FeedbackModal
          course={activeFeedbackCourse}
          onClose={() => setActiveFeedbackCourse(null)}
          onSubmitted={(data) => {
            if (!data?.courseRating) return;
            setCourses((prev) =>
              prev.map((course) =>
                course._id === activeFeedbackCourse._id
                  ? { ...course, rating: data.courseRating, ratingCount: data.ratingCount }
                  : course
              )
            );
          }}
        />
      ) : null}
    </div>
  );
}
