import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { COURSES, calcScore, getMatch } from "../../data/courseiq1.js";
import { enrollCourse } from "../../services/courseService.js";
import { useUiStore } from "../../store/ui.js";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openExplain } = useOutletContext();
  const enrolledCourses = useUiStore((s) => s.enrolledCourses) || [];

  const courseId = Number(id);
  const sel = COURSES.find((c) => c.id === courseId) || null;

  const [bar, setBar] = useState(false);
  useEffect(() => {
    if (sel) {
      const t = setTimeout(() => setBar(true), 120);
      return () => clearTimeout(t);
    }
  }, [sel]);

  if (!sel) {
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

  const pct = calcScore(sel.scores);
  const meta = getMatch(pct);
  const isEnrolled = enrolledCourses.some(id => String(id) === String(sel.id));

  const items = [
    { l: "Interest Fit", v: sel.scores.interest, w: "40%" },
    { l: "Skill Fit", v: sel.scores.skill, w: "25%" },
    { l: "Rating Weight", v: sel.scores.rating, w: "15%" },
    { l: "Popularity", v: sel.scores.popularity, w: "10%" },
    { l: "Career Alignment", v: sel.scores.career, w: "10%" },
  ];

  return (
    <div className="page anim">
      <button className="btn bg bsm" style={{ marginBottom: 16 }} onClick={() => navigate("/courses")}>
        ← Back to Courses
      </button>

      <div className="cd-header">
        <div className="cd-thumb" style={{ background: sel.bg }}>
          {sel.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div className="cd-title">{sel.title}</div>
          <div className="cd-meta-row">
            <span className={"bdg bdg-" + sel.difficulty.charAt(0).toLowerCase()}>{sel.difficulty}</span>
            <span style={{ fontSize: 13, color: "var(--t2)" }}>⭐ {sel.rating}</span>
            <span className="tg">{sel.category}</span>
            <span style={{ fontSize: 12, color: "var(--t3)" }}>
              {sel.enrollments.toLocaleString()} enrolled · {sel.seats} seats left
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 14 }}>{sel.desc}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn bp"
              style={
                isEnrolled
                  ? { background: "var(--ac2)", color: "#fff", border: "1px solid var(--ac)" }
                  : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
              }
              disabled={isEnrolled}
              onClick={async () => {
                try {
                  await enrollCourse(sel.id);
                } catch (err) {
                  alert(err.response?.data?.error || err.message || "Failed to enroll.");
                }
              }}
            >
              {isEnrolled ? "Enrolled" : "Enroll Now"}
            </button>
            <button className="btn bg" onClick={() => openExplain(sel)}>
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
              {sel.desc} This course includes hands-on projects and a final capstone.
            </p>
          </div>
          <div className="cd-section">
            <div className="cd-stitle">Instructor</div>
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
                {sel.instructor[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--t)" }}>{sel.instructor}</div>
                <div style={{ fontSize: 12, color: "var(--t2)" }}>⭐ 4.9 · 12k students</div>
              </div>
            </div>
          </div>
          <div className="cd-section">
            <div className="cd-stitle">Prerequisites & Info</div>
            {sel.prereqs.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--t3)" }}>No prerequisites required.</div>
            ) : (
              sel.prereqs.map((p) => (
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
              Credits: <strong style={{ color: "var(--ac)" }}>{sel.credits}</strong> · Seats:{" "}
              <strong style={{ color: "var(--t)" }}>{sel.seats}</strong>
            </div>
          </div>
        </div>

        <div>
          <div className="ri-panel">
            <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
              Relevance Intelligence
            </div>
            <div className="ri-score">
              <div className="ri-val">{pct}%</div>
              <div style={{ marginTop: 6 }}>
                <span className={"mpill " + meta.cls}>{meta.label}</span>
              </div>
            </div>

            {items.map((it) => (
              <div key={it.l} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--t2)" }}>{it.l}</span>
                  <span style={{ fontWeight: 700, color: "var(--ac)" }}>{it.v}%</span>
                </div>
                <div className="bd-track">
                  <div className="bd-fill" style={{ width: bar ? it.v + "%" : "0%" }} />
                </div>
                <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>Weight: {it.w}</div>
              </div>
            ))}
            <div className="modal-tip" style={{ marginTop: 14 }}>
              💡 Complete "Python Basics" to improve your match.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
