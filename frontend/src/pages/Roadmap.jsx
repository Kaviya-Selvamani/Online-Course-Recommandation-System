import { motion as Motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCoursesCatalog } from "../services/courseService.js";
import { useUiStore } from "../store/ui.js";

export default function Roadmap() {
  const navigate = useNavigate();
  const enrolledIds = useUiStore((s) => s.enrolledCourses) || [];
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCoursesCatalog()
      .then((data) => {
        if (!cancelled) {
          setCatalogCourses(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogCourses([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const enrolledCourses = useMemo(
    () =>
      enrolledIds.map((id) => {
        const known = catalogCourses.find((course) => String(course._id) === String(id));
        if (known) return known;
        return {
          _id: id,
          title: "Enrolled Course",
          tags: ["In Progress"],
        };
      }),
    [catalogCourses, enrolledIds]
  );

  if (enrolledCourses.length === 0) {
    return (
      <div className="page anim">
        <div className="ph">
          <div className="pt">Learning Roadmap</div>
          <div className="ps">Start with recommendations, then enroll to build your roadmap.</div>
        </div>
        <div className="card glass-card" style={{ padding: 20 }}>
          <div className="analytics-title">No enrolled courses yet</div>
          <div className="analytics-subtitle" style={{ marginTop: 6 }}>
            Your roadmap will appear after you enroll in a course.
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

  const phases = enrolledCourses.map((course, index) => ({
    phase: `Course ${index + 1}`,
    title: course.title || "Enrolled Course",
    desc:
      course.description ||
      `Deep dive into ${course.title || "this course"} and track your progress here.`,
    courses: (course.tags && course.tags.length ? course.tags : [course.title || "In Progress"]),
    done: false,
    active: index === 0,
    courseId: course._id,
    skills: (course.tags || []).slice(0, 3),
  }));
  const totalPhases = phases.length;
  const completedPhases = phases.filter((phase) => phase.done).length;
  const progressPercent = Math.round((completedPhases / Math.max(totalPhases, 1)) * 100);
  const nextMilestone = phases.find((phase) => !phase.done)?.title || "Capstone Complete";

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const buildTokens = (value) =>
    normalizeText(value)
      .split(" ")
      .filter((token) => token.length > 2 && !["and", "for", "with", "the"].includes(token));

  const scoreOverlap = (candidateTokens, titleTokens) => {
    if (!candidateTokens.length || !titleTokens.length) return 0;
    const titleSet = new Set(titleTokens);
    const overlap = candidateTokens.reduce((count, token) => count + (titleSet.has(token) ? 1 : 0), 0);
    return overlap / titleTokens.length;
  };

  const resolvePhaseCourse = (phase) => {
    if (phase.courseId) {
      const byId = catalogCourses.find((course) => String(course._id) === String(phase.courseId));
      if (byId) return byId;
    }

    const candidates = [phase.title, ...(phase.courses || [])].map(buildTokens).filter((tokens) => tokens.length > 0);
    let best = null;
    let bestScore = 0;

    catalogCourses.forEach((course) => {
      const title = normalizeText(course.title);
      const titleTokens = buildTokens(course.title);

      candidates.forEach((candidateTokens) => {
        const candidateText = candidateTokens.join(" ");
        const exact = title.includes(candidateText) || candidateText.includes(title);
        const overlap = scoreOverlap(candidateTokens, titleTokens);
        const score = exact ? 1 : overlap;

        if (score > bestScore) {
          bestScore = score;
          best = course;
        }
      });
    });

    return bestScore >= 0.34 ? best : null;
  };

  const handleContinue = (phase) => {
    const course = resolvePhaseCourse(phase);
    if (course?.courseUrl) {
      window.open(course.courseUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (course?._id) {
      navigate(`/course/${course._id}`);
      return;
    }
    navigate("/courses");
  };

  const handleViewDetails = (phase) => {
    const course = resolvePhaseCourse(phase);
    if (course?._id) {
      navigate(`/course/${course._id}`);
      return;
    }
    navigate("/courses");
  };

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Learning Roadmap</div>
        <div className="ps">Your personalized path to ML Engineer · {progressPercent}% complete</div>
      </div>

      {loading ? <div className="empty-state">Loading roadmap...</div> : null}

      <Motion.div
        className="card roadmap-progress-card glass-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="roadmap-progress-head">
          <div>
            <div className="analytics-title">Career Progress</div>
            <div className="analytics-subtitle">Next milestone: <strong>{nextMilestone}</strong></div>
          </div>
          <div className="roadmap-progress-pill">{completedPhases}/{totalPhases} phases</div>
        </div>
        <div className="roadmap-progress-track">
          <Motion.div
            className="roadmap-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </Motion.div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {[
          ["Phases Done", `${completedPhases} / ${totalPhases}`],
          ["Courses Left", `${Math.max(totalPhases - completedPhases, 0) * 2}`],
          ["Est. Completion", "14 weeks"],
          ["Career Fit", "95%"],
        ].map(([l, v]) => (
          <Motion.div
            className="card sc lift glass-card"
            key={l}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sl">{l}</div>
            <div className="sv">{v}</div>
          </Motion.div>
        ))}
      </div>

      <div className="rm-track">
        {phases.map((p, i) => (
          <Motion.div
            className="rm-item"
            key={p.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.03 }}
          >
            <div className={"rm-dot" + (p.done ? " done" : "") + (p.active ? " active" : "")}>
              {p.done ? "✓" : p.active ? "●" : i + 1}
            </div>
            <div className="rm-card glass-card">
              <div className="rm-phase">{p.phase}</div>
              <div className="rm-title">{p.title}</div>
              <div className="rm-desc">{p.desc}</div>
              <div className="rm-status-line">
                <span className={`rm-status-pill ${p.done ? "done" : p.active ? "active" : "pending"}`}>
                  {p.done ? "Completed" : p.active ? "In Progress" : "Upcoming"}
                </span>
              </div>
              <div className="rm-courses">
                {p.courses.map((c) => (
                  <span key={c} className="tg" style={{ fontSize: 10.5 }}>
                    {c}
                  </span>
                ))}
              </div>
              {p.skills && (
                <div style={{ marginTop: 12, borderTop: '1px dashed var(--bd)', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ac)', marginBottom: 4 }}>UNDERSTAND DEEPER:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.skills.map(s => (
                      <div key={s} style={{ fontSize: 11, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ac)' }} /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {p.active ? (
                <div style={{ marginTop: 10, display: "flex", gap: 7 }}>
                  <Motion.button className="btn bp bsm" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => handleContinue(p)}>Continue</Motion.button>
                  <Motion.button className="btn bg bsm" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => handleViewDetails(p)}>View Details</Motion.button>
                </div>
              ) : null}
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
} 
