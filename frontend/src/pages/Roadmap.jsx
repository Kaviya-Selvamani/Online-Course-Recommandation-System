import { useUiStore } from "../store/ui.js";
import { COURSES } from "../data/courseiq1.js";

export default function Roadmap() {
  const enrolledIds = useUiStore((s) => s.enrolledCourses) || [];
  const enrolledCourses = enrolledIds
    .map((id) => {
      const known = COURSES.find((c) => String(c.id) === String(id));
      if (known) return known;
      return {
        id,
        title: "Enrolled Course",
        tags: ["In Progress"],
      };
    });
  const phases = [
    {
      phase: "Foundation",
      title: "Python & Data Basics",
      desc: "Build your programming core with Python, data manipulation, and statistics.",
      courses: ["Python for Data Analysis", "SQL Fundamentals"],
      done: true,
      active: false,
    },
    {
      phase: "Core Skills",
      title: "Machine Learning",
      desc: "Dive into ML algorithms, model training, and evaluation frameworks.",
      courses: ["Intro to ML", "Statistics for DS"],
      done: true,
      active: false,
    },
    {
      phase: "Current Phase",
      title: "Advanced ML & Deep Learning",
      desc: "Tackle neural networks, PyTorch, and production ML systems.",
      courses: ["ML Fundamentals", "Deep Learning PyTorch"],
      done: false,
      active: true,
    },
    {
      phase: "Specialization",
      title: "MLOps & Cloud Deployment",
      desc: "Deploy and monitor ML models at scale with cloud infrastructure.",
      courses: ["Cloud Architecture AWS", "Node.js REST APIs"],
      done: false,
      active: false,
    },
    {
      phase: "Capstone",
      title: "Industry Project",
      desc: "Build a full end-to-end ML system with real-world data.",
      courses: ["Capstone: ML System Design"],
      done: false,
      active: false,
    },
  ];

  if (enrolledCourses.length > 0) {
    enrolledCourses.forEach((c, idx) => {
      phases.splice(2 + idx, 0, {
        phase: "Deep Dive",
        title: `Mastering: ${c.title}`,
        desc: `Developing expertise in ${c.tags.join(", ")}. Focus on understanding core principles for long-term retention.`,
        courses: c.tags,
        done: false,
        active: true,
        skills: ["Practical Projects", "Code Review", "Advanced Theory"]
      });
    });
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Learning Roadmap</div>
        <div className="ps">Your personalized path to ML Engineer · 40% complete</div>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {[
          ["Phases Done", "2 / 5"],
          ["Courses Left", "8"],
          ["Est. Completion", "14 weeks"],
          ["Career Fit", "95%"],
        ].map(([l, v]) => (
          <div className="card sc lift" key={l}>
            <div className="sl">{l}</div>
            <div className="sv">{v}</div>
          </div>
        ))}
      </div>

      <div className="rm-track">
        {phases.map((p, i) => (
          <div className="rm-item" key={p.title}>
            <div className={"rm-dot" + (p.done ? " done" : "") + (p.active ? " active" : "")}>
              {p.done ? "✓" : p.active ? "●" : i + 1}
            </div>
            <div className="rm-card">
              <div className="rm-phase">{p.phase}</div>
              <div className="rm-title">{p.title}</div>
              <div className="rm-desc">{p.desc}</div>
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
                  <button className="btn bp bsm">Continue</button>
                  <button className="btn bg bsm">View Courses</button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
