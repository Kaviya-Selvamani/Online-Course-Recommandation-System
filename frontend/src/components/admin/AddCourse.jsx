import { useState } from "react";

export default function AddCourse() {
  const [done, setDone] = useState(false);

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

      <div className="fsec">
        <div className="fstitle">📋 Basic Information</div>
        <div className="form-grid">
          {[
            ["Course Title", "e.g. Advanced React Patterns"],
            ["Instructor Name", "Dr. Jane Doe"],
          ].map(([l, p]) => (
            <div className="fg" key={l}>
              <label className="fl">{l}</label>
              <input className="fi" placeholder={p} />
            </div>
          ))}
          <div className="fg">
            <label className="fl">Category</label>
            <select className="fi">
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
            <select className="fi">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Available Seats</label>
            <input className="fi" type="number" placeholder="30" />
          </div>
          <div className="fg">
            <label className="fl">Credits</label>
            <input className="fi" type="number" placeholder="3" />
          </div>
        </div>
        <div className="fg">
          <label className="fl">Description</label>
          <textarea className="fi" rows={3} placeholder="Describe what students will learn..." style={{ resize: "vertical", lineHeight: 1.6 }} />
        </div>
        <div className="fg">
          <label className="fl">Tags (comma separated)</label>
          <input className="fi" placeholder="e.g. React, Hooks, Context" />
        </div>
        <div className="fg">
          <label className="fl">Career Paths</label>
          <input className="fi" placeholder="e.g. Frontend Dev, Full Stack" />
        </div>
        <div className="fg">
          <label className="fl">Prerequisites</label>
          <input className="fi" placeholder="e.g. JavaScript Basics, HTML/CSS" />
        </div>
      </div>

      <div className="fsec">
        <div className="fstitle">🎯 Relevance Engine Weights (0–100)</div>
        <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 16 }}>
          Set the base relevance scores used in AI recommendations.
        </div>
        <div className="form-grid">
          {[
            ["Interest Score", "85"],
            ["Skill Alignment", "80"],
            ["Rating Score", "90"],
            ["Popularity Index", "75"],
            ["Career Alignment", "88"],
          ].map(([l, v]) => (
            <div className="fg" key={l}>
              <label className="fl">{l}</label>
              <input className="fi" type="number" min="0" max="100" defaultValue={v} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn bp blg" onClick={() => setDone(true)}>
          Publish Course
        </button>
        <button className="btn bg blg">Save Draft</button>
      </div>
    </div>
  );
}

