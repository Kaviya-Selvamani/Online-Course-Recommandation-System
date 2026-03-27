import { motion as Motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourseById, fetchCoursesCatalog } from "../services/courseService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { getSession } from "../services/authService.js";
import { buildLearningExperience, normalizeCourseId } from "../services/experienceService.js";
import { useUiStore } from "../store/ui.js";

function resolveCourseUrl(course) {
  return course?.courseUrl || course?.url || course?.courseURL || course?.link || "";
}

export default function Roadmap() {
  const navigate = useNavigate();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const rawEnrolledIds = useUiStore((s) => s.enrolledCourses);
  const enrolledIds = useMemo(() => rawEnrolledIds || [], [rawEnrolledIds]);
  const bookmarkedCourseIds = useUiStore((state) => state.bookmarkedCourseIds);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([fetchCoursesCatalog(), fetchRecommendations()])
      .then(([catalogResult, recommendationResult]) => {
        if (cancelled) return;

        setCatalogCourses(
          catalogResult.status === "fulfilled" && Array.isArray(catalogResult.value)
            ? catalogResult.value
            : [],
        );
        setRecommendations(
          recommendationResult.status === "fulfilled"
            ? recommendationResult.value.recommendations || []
            : [],
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogCourses([]);
          setRecommendations([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const experience = useMemo(
    () =>
      buildLearningExperience({
        user,
        recommendations,
        catalogCourses,
        enrolledCourseIds: enrolledIds,
        bookmarkedCourseIds,
      }),
    [bookmarkedCourseIds, catalogCourses, enrolledIds, recommendations, user],
  );

  if (loading) {
    return (
      <div className="page anim">
        <div className="ph">
          <div className="pt">Learning Roadmap</div>
          <div className="ps">Building your step-by-step learning path...</div>
        </div>
        <div className="empty-state">Loading roadmap...</div>
      </div>
    );
  }

  if (!experience.roadmapSteps.length) {
    return (
      <div className="page anim">
        <div className="ph">
          <div className="pt">Learning Roadmap</div>
          <div className="ps">Enroll in a course to unlock your next steps.</div>
        </div>
        <div className="card glass-card" style={{ padding: 24 }}>
          <div className="analytics-title">No roadmap steps yet</div>
          <div className="analytics-subtitle" style={{ marginTop: 6 }}>
            Your roadmap unlocks automatically after your first enrollment.
          </div>
          <div style={{ marginTop: 14 }}>
            <Motion.button
              className="btn bp"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/recommendations")}
            >
              Browse Recommendations
            </Motion.button>
          </div>
        </div>
      </div>
    );
  }

  const totalSteps = experience.roadmapSteps.length;
  const completedSteps = experience.roadmapSteps.filter((step) => step.status === "completed").length;
  const activeStep = experience.roadmapSteps.find((step) => step.status === "active") || experience.roadmapSteps[0];

  const handleContinue = async (step) => {
    if (step.locked) return;

    const directUrl = resolveCourseUrl(step.course);
    if (directUrl) {
      window.open(directUrl, "_blank", "noopener,noreferrer");
      return;
    }

    let course = step.course;
    const courseId = normalizeCourseId(step.course) || step.id;

    if (!course && courseId) {
      try {
        course = await fetchCourseById(courseId);
      } catch {
        course = null;
      }
    }

    const fetchedUrl = resolveCourseUrl(course);
    if (fetchedUrl) {
      window.open(fetchedUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (courseId) {
      navigate(`/course/${encodeURIComponent(String(courseId))}`, { state: { course } });
      return;
    }

    navigate("/courses");
  };

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Learning Roadmap</div>
        <div className="ps">
          Step-by-step progression with unlocks, milestones, and external continue links.
        </div>
      </div>

      <Motion.div
        className="rounded-[30px] border border-slate-800/70 bg-slate-900/80 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Roadmap Progress</div>
            <div className="mt-2 text-3xl font-semibold text-white">{experience.completionPercent}% complete</div>
            <div className="mt-2 text-sm text-slate-400">
              {completedSteps}/{totalSteps} steps completed. Active focus: <strong className="text-slate-200">{activeStep?.title}</strong>
            </div>
          </div>
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200">
            Level {experience.level} • {experience.streakDays}-day streak
          </div>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
          <Motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${experience.completionPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </Motion.div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {[
          ["Unlocked", `${experience.roadmapSteps.filter((step) => !step.locked).length}`],
          ["Locked", `${experience.roadmapSteps.filter((step) => step.locked).length}`],
          ["Completed", `${completedSteps}`],
          ["Saved", `${bookmarkedCourseIds.length}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-slate-800/70 bg-slate-900/80 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {experience.roadmapSteps.map((step, index) => {
          const statusColor =
            step.status === "completed"
              ? "border-emerald-400/30 bg-emerald-400/10"
              : step.status === "active"
                ? "border-sky-400/30 bg-sky-400/10"
                : "border-slate-800/70 bg-slate-900/80";

          return (
            <Motion.div
              key={`${step.id}-${index}`}
              className={`rounded-[28px] border p-5 ${statusColor}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: index * 0.04 }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold ${
                      step.status === "completed"
                        ? "bg-emerald-400/20 text-emerald-200"
                        : step.status === "active"
                          ? "bg-sky-400/20 text-sky-200"
                          : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : step.locked ? "🔒" : index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold text-white">{step.title}</div>
                      <span className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-200">
                        {step.recommended ? "Upcoming Recommendation" : "Roadmap Step"}
                      </span>
                      <span className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-200">
                        {step.status === "completed" ? "Completed" : step.status === "active" ? "Active" : "Locked"}
                      </span>
                    </div>
                    <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{step.description}</div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <Motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-400">{step.progress}% progress</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Motion.button
                    className="btn bp"
                    whileHover={{ scale: step.locked ? 1 : 1.03 }}
                    whileTap={{ scale: step.locked ? 1 : 0.98 }}
                    onClick={() => handleContinue(step)}
                    disabled={step.locked}
                    style={step.locked ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                  >
                    {step.status === "completed" ? "Review" : step.locked ? "Locked" : "Continue"}
                  </Motion.button>
                  <Motion.button
                    className="btn bg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const courseId = normalizeCourseId(step.course) || step.id;
                      navigate(`/course/${encodeURIComponent(String(courseId))}`, { state: { course: step.course } });
                    }}
                  >
                    View Details
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
}
