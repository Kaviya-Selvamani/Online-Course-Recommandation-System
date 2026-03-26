import { useState } from "react";

export default function AddCourse() {
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    instructor: "",
    category: "AI/ML",
    difficulty: "Beginner",
    seats: "",
    credits: "",
    description: "",
    tags: "",
    careerPaths: "",
    prereqs: "",
    interestScore: "85",
    skillScore: "80",
    ratingScore: "90",
    popularityScore: "75",
    careerScore: "88",
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Course title is required.";
    if (!form.instructor.trim()) nextErrors.instructor = "Instructor name is required.";
    if (!form.seats || Number(form.seats) <= 0) nextErrors.seats = "Seats must be greater than 0.";
    if (!form.credits || Number(form.credits) <= 0) nextErrors.credits = "Credits must be greater than 0.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    const scoreFields = [
      ["interestScore", "Interest score"],
      ["skillScore", "Skill alignment"],
      ["ratingScore", "Rating score"],
      ["popularityScore", "Popularity index"],
      ["careerScore", "Career alignment"],
    ];
    scoreFields.forEach(([key, label]) => {
      const value = Number(form[key]);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        nextErrors[key] = `${label} must be between 0 and 100.`;
      }
    });
    return nextErrors;
  };

  const handlePublish = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!window.confirm("Publish this course now?")) return;
    setIsPublishing(true);
    setNotice("");
    setTimeout(() => {
      setIsPublishing(false);
      setDone(true);
    }, 800);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setNotice("");
    setTimeout(() => {
      setIsSaving(false);
      setNotice("Draft saved.");
    }, 600);
  };

  if (done) {
    return (
      <div className="page anim" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, color: "var(--t)", marginBottom: 8 }}>
            Course Published!
          </div>
          <div style={{ fontSize: 14, color: "var(--t2)", marginBottom: 20 }}>The course is now live on the platform.</div>
          <button className="btn bp" onClick={() => setDone(false)}>
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Add New Course</div>
        <div className="ps">Create and publish a new course to the platform</div>
      </div>

      {notice ? (
        <div className="card" style={{ padding: 12, marginBottom: 14, background: "rgba(24,201,138,.12)", color: "#18c98a", fontSize: 13 }}>
          {notice}
        </div>
      ) : null}

      <div className="fsec">
        <div className="fstitle">📋 Basic Information</div>
        <div className="form-grid">
          <div className="fg">
            <label className="fl">Course Title *</label>
            <input
              className="fi"
              placeholder="e.g. Advanced React Patterns"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {errors.title ? <div className="err" style={{ marginTop: 6 }}>{errors.title}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Instructor Name *</label>
            <input
              className="fi"
              placeholder="Dr. Jane Doe"
              value={form.instructor}
              onChange={(e) => setField("instructor", e.target.value)}
            />
            {errors.instructor ? <div className="err" style={{ marginTop: 6 }}>{errors.instructor}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Category</label>
            <select className="fi" value={form.category} onChange={(e) => setField("category", e.target.value)}>
              <option>AI/ML</option>
              <option>Web Dev</option>
              <option>Data</option>
              <option>Cloud</option>
              <option>Design</option>
              <option>Backend</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Difficulty</label>
            <select className="fi" value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Available Seats *</label>
            <input
              className="fi"
              type="number"
              placeholder="30"
              value={form.seats}
              onChange={(e) => setField("seats", e.target.value)}
            />
            {errors.seats ? <div className="err" style={{ marginTop: 6 }}>{errors.seats}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Credits *</label>
            <input
              className="fi"
              type="number"
              placeholder="3"
              value={form.credits}
              onChange={(e) => setField("credits", e.target.value)}
            />
            {errors.credits ? <div className="err" style={{ marginTop: 6 }}>{errors.credits}</div> : null}
          </div>
        </div>
        <div className="fg">
          <label className="fl">Description *</label>
          <textarea
            className="fi"
            rows={3}
            placeholder="Describe what students will learn..."
            style={{ resize: "vertical", lineHeight: 1.6 }}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          {errors.description ? <div className="err" style={{ marginTop: 6 }}>{errors.description}</div> : null}
        </div>
        <div className="fg">
          <label className="fl">Tags (comma separated)</label>
          <input
            className="fi"
            placeholder="e.g. React, Hooks, Context"
            value={form.tags}
            onChange={(e) => setField("tags", e.target.value)}
          />
        </div>
        <div className="fg">
          <label className="fl">Career Paths</label>
          <input
            className="fi"
            placeholder="e.g. Frontend Dev, Full Stack"
            value={form.careerPaths}
            onChange={(e) => setField("careerPaths", e.target.value)}
          />
        </div>
        <div className="fg">
          <label className="fl">Prerequisites</label>
          <input
            className="fi"
            placeholder="e.g. JavaScript Basics, HTML/CSS"
            value={form.prereqs}
            onChange={(e) => setField("prereqs", e.target.value)}
          />
        </div>
      </div>

      <div className="fsec">
        <div className="fstitle">🎯 Relevance Engine Weights (0–100)</div>
        <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 16 }}>
          Set the base relevance scores used in AI recommendations.
        </div>
        <div className="form-grid">
          <div className="fg">
            <label className="fl">Interest Score</label>
            <input className="fi" type="number" min="0" max="100" value={form.interestScore} onChange={(e) => setField("interestScore", e.target.value)} />
            {errors.interestScore ? <div className="err" style={{ marginTop: 6 }}>{errors.interestScore}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Skill Alignment</label>
            <input className="fi" type="number" min="0" max="100" value={form.skillScore} onChange={(e) => setField("skillScore", e.target.value)} />
            {errors.skillScore ? <div className="err" style={{ marginTop: 6 }}>{errors.skillScore}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Rating Score</label>
            <input className="fi" type="number" min="0" max="100" value={form.ratingScore} onChange={(e) => setField("ratingScore", e.target.value)} />
            {errors.ratingScore ? <div className="err" style={{ marginTop: 6 }}>{errors.ratingScore}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Popularity Index</label>
            <input className="fi" type="number" min="0" max="100" value={form.popularityScore} onChange={(e) => setField("popularityScore", e.target.value)} />
            {errors.popularityScore ? <div className="err" style={{ marginTop: 6 }}>{errors.popularityScore}</div> : null}
          </div>
          <div className="fg">
            <label className="fl">Career Alignment</label>
            <input className="fi" type="number" min="0" max="100" value={form.careerScore} onChange={(e) => setField("careerScore", e.target.value)} />
            {errors.careerScore ? <div className="err" style={{ marginTop: 6 }}>{errors.careerScore}</div> : null}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn bp blg" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish Course"}
        </button>
        <button className="btn bg blg" onClick={handleSaveDraft} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Draft"}
        </button>
      </div>
    </div>
  );
}
