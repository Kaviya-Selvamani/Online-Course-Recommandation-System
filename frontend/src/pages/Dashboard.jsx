import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FiAward, FiBookmark, FiBookOpen, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import SkillGapAlert from "../components/common/SkillGapAlert.jsx";
import { BarChart, SkillGrowthTrendChart } from "../components/common/AnalyticsCharts.jsx";
import {
  enrollCourse,
  removeBookmark,
  saveBookmark,
  unenrollCourse,
} from "../services/courseService.js";
import { getSession } from "../services/authService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import {
  buildCourseUiTags,
  buildLearningExperience,
  buildWhyCourseSummary,
} from "../services/experienceService.js";
import { useUiStore } from "../store/ui.js";
import { getBarColor, getMatch } from "../data/courseiq1.js";

function getCourseBanner(category) {
  const normalized = String(category || "").toLowerCase();
  if (normalized.includes("ai") || normalized.includes("ml")) return "var(--bg-ml)";
  if (normalized.includes("data")) return "var(--bg-py)";
  if (normalized.includes("cloud")) return "var(--bg-aws)";
  if (normalized.includes("web")) return "var(--bg-web)";
  if (normalized.includes("design")) return "var(--bg-ux)";
  return "var(--bg-api)";
}

function DashboardSkeleton() {
  return (
    <div className="page anim">
      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-5"
            style={{ minHeight: 140 }}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-6" style={{ minHeight: 320 }} />
        <div className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-6" style={{ minHeight: 320 }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { openExplain } = useOutletContext();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const bookmarkedCourseIds = useUiStore((state) => state.bookmarkedCourseIds);
  const addBookmarkId = useUiStore((state) => state.addBookmarkId);
  const removeBookmarkId = useUiStore((state) => state.removeBookmarkId);
  const upsertNotifications = useUiStore((state) => state.upsertNotifications);
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

  useEffect(() => {
    if (!courses.length) return;
    upsertNotifications(experience.notifications);
  }, [courses.length, experience.notifications, upsertNotifications]);

  const filteredCourses = useMemo(() => {
    if (filter === "perfect") return courses.filter((course) => course.relevanceScore >= 90);
    if (filter === "growth") return courses.filter((course) => course.relevanceScore >= 50 && course.relevanceScore < 80);
    if (filter === "saved") {
      return courses.filter((course) =>
        bookmarkedCourseIds.some((id) => String(id) === String(course._id)),
      );
    }
    return courses;
  }, [bookmarkedCourseIds, courses, filter]);

  const heroStats = [
    {
      icon: <FiZap />,
      label: "XP Balance",
      value: `${experience.xp} XP`,
      sub: `Level ${experience.level}`,
    },
    {
      icon: <FiTrendingUp />,
      label: "Weekly Streak",
      value: `${experience.streakDays} days`,
      sub: "Momentum this week",
    },
    {
      icon: <FiTarget />,
      label: "Alignment Score",
      value: `${experience.averageMatch || 0}%`,
      sub: "Average recommendation fit",
    },
    {
      icon: <FiBookmark />,
      label: "Saved Courses",
      value: `${experience.bookmarkCount}`,
      sub: "Ready to revisit",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Dashboard</div>
        <div className="ps">Gamified learning analytics, weekly momentum, and AI-guided next steps.</div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {heroStats.map((item, index) => (
          <Motion.div
            key={item.label}
            className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-5 shadow-[0_24px_80px_-55px_rgba(16,185,129,0.8)]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              {item.icon}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
            <div className="mt-1 text-sm text-slate-400">{item.sub}</div>
          </Motion.div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Motion.div
          className="rounded-[30px] border border-slate-800/70 bg-slate-900/80 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Level Progress</div>
              <div className="mt-2 text-3xl font-semibold text-white">Level {experience.level}</div>
              <div className="mt-2 text-sm text-slate-400">
                {experience.xp} XP collected. {experience.nextLevelXp - experience.xp} XP to reach the next level.
              </div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {experience.earnedBadges.length} badges earned
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {experience.progressBars.map((item, index) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <Motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.75, delay: index * 0.08, ease: "easeOut" }}
                    style={{
                      background: `linear-gradient(90deg, ${index === 0 ? "#34d399" : index === 1 ? "#60a5fa" : "#f59e0b"}, rgba(255,255,255,0.92))`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-800/70 bg-slate-950/40 p-5">
            <div className="mb-3 text-sm font-semibold text-slate-200">Weekly Study Hours</div>
            <BarChart labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} values={experience.insights.weeklyActivity} />
          </div>
        </Motion.div>

        <div className="space-y-5">
          <Motion.div
            className="rounded-[30px] border border-slate-800/70 bg-slate-900/80 p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Skill Growth</div>
                <div className="mt-2 text-xl font-semibold text-white">Six-week trend</div>
              </div>
              <div className="text-sm text-slate-400">{experience.completionPercent}% roadmap completion</div>
            </div>
            <div className="mt-4">
              <SkillGrowthTrendChart
                data={experience.skillGrowthTimeline}
                legend={experience.skillGrowthLegend}
              />
            </div>
          </Motion.div>

          <Motion.div
            className="rounded-[30px] border border-slate-800/70 bg-slate-900/80 p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold text-white">Badge Cabinet</div>
              <FiAward className="text-amber-300" />
            </div>
            <div className="grid gap-3">
              {experience.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl border px-4 py-3 ${badge.earned ? "border-emerald-400/30 bg-emerald-400/10" : "border-slate-800/70 bg-slate-950/40"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{badge.icon} {badge.label}</div>
                      <div className="mt-1 text-xs text-slate-400">{badge.description}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.earned ? "bg-emerald-400/20 text-emerald-200" : "bg-slate-800 text-slate-400"}`}>
                      {badge.earned ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>

      <div className="mt-5">
        <SkillGapAlert gap={experience.insights.skillGap} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-white">Recommended Next Moves</div>
          <div className="text-sm text-slate-400">Save, explain, and enroll without leaving the dashboard.</div>
        </div>
        <div className="ftabs">
          {[
            ["all", "All"],
            ["perfect", "Perfect Fit"],
            ["growth", "Growth Zone"],
            ["saved", `Saved (${bookmarkedCourseIds.length})`],
          ].map(([value, label]) => (
            <button key={value} className={`ft ${filter === value ? "on" : ""}`} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        {filteredCourses.slice(0, 4).map((course) => {
          const isEnrolled = enrolledCourses.some((id) => String(id) === String(course._id));
          const isSaved = bookmarkedCourseIds.some((id) => String(id) === String(course._id));
          const match = course.matchCategory || getMatch(course.relevanceScore || 0).label;
          const experienceTags = buildCourseUiTags(course, courses);

          return (
            <Motion.div
              key={course._id}
              className="overflow-hidden rounded-[28px] border border-slate-800/70 bg-slate-900/80 shadow-[0_32px_80px_-60px_rgba(14,165,233,0.9)]"
              whileHover={{ y: -4, scale: 1.006 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ background: getCourseBanner(course.category) }}>
                <PlatformBadge platform={course.platform} />
                <div className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                  {Math.round(course.matchPercentage || course.relevanceScore || 0)}% match
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-white">{course.title}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {course.provider} · {course.duration || "Self-paced"}
                    </div>
                  </div>
                  <span className={`match-tag ${match.toLowerCase().replace(/\s+/g, "-")}`}>{match}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {experienceTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Why this course?</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {buildWhyCourseSummary(course, user)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span>⭐ {Number(course.rating || 0).toFixed(1)}</span>
                  <span>{course.isFree ? "Free" : `$${course.price}`}</span>
                  <span>{(course.enrollments || 0).toLocaleString()} learners</span>
                </div>

                <div className="mbar" style={{ marginTop: 16 }}>
                  <Motion.div
                    className="mfill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(course.relevanceScore || 0)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ background: getBarColor(course.relevanceScore || 0) }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="btn"
                    style={
                      isEnrolled
                        ? { background: "#c0392b", color: "#fff", border: "1px solid #a93226" }
                        : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
                    }
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
                  </button>
                  <button className="btn bg" onClick={() => openExplain(course)}>Explain</button>
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
                  <button className="btn bg" onClick={() => navigate(`/course/${encodeURIComponent(String(course._id))}`, { state: { course } })}>
                    View Details
                  </button>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </div>

      {!filteredCourses.length ? (
        <div className="empty-state">No dashboard courses match this filter yet.</div>
      ) : null}
    </div>
  );
}
