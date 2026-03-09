import { useState, useEffect } from "react";
import { getSession, updateProfile } from "../services/authService.js";

export default function Settings() {
  const [tab, setTab] = useState("account");
  const session = getSession();
  const user = session?.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [goal, setGoal] = useState(user.goal || "");
  const [interests, setInterests] = useState(user.interests?.join(", ") || "");
  const [skill, setSkill] = useState(user.skill || "Intermediate");
  const [pace, setPace] = useState(user.weeklyLearningHours ?
    (user.weeklyLearningHours <= 2 ? "Casual (1–2 hrs/week)" :
      user.weeklyLearningHours <= 5 ? "Steady (3–5 hrs/week)" : "Intensive (6–10 hrs/week)") :
    "Steady (3–5 hrs/week)");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [tg, setTg] = useState({
    publicProfile: false,
  });

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const tog = (k) => setTg((t) => ({ ...t, [k]: !t[k] }));

  const onSaveAccount = async () => {
    setSaving(true);
    setMsg("");
    try {
      const interestsArray = interests.split(",").map(i => i.trim()).filter(i => i);
      await updateProfile({
        name,
        interests: interestsArray,
        careerGoal: goal
      });
      setMsg("✅ Account updated successfully");
    } catch (err) {
      setMsg("❌ Failed to update account");
    }
    setSaving(false);
  };

  const onUpdateLearning = async () => {
    setSaving(true);
    setMsg("");
    try {
      let weeklyHours = 4;
      if (pace.startsWith("Casual")) weeklyHours = 2;
      else if (pace.startsWith("Steady")) weeklyHours = 4;
      else if (pace.startsWith("Intensive")) weeklyHours = 8;

      await updateProfile({
        skillLevel: skill,
        careerGoal: goal,
        weeklyLearningHours: weeklyHours
      });
      setMsg("✅ Preferences updated");
    } catch (err) {
      setMsg("❌ Failed to update preferences");
    }
    setSaving(false);
  };

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Settings</div>
        <div className="ps">Manage your account, preferences, and privacy</div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {[
            ["account", "👤 Account"],
            ["learning", "📚 Learning Preferences"],
          ].map(([id, label]) => (
            <div key={id} className={"sni " + (tab === id ? "on" : "")} onClick={() => setTab(id)}>
              {label}
            </div>
          ))}
        </div>

        <div className="settings-panel">
          {msg && <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: msg.startsWith("✅") ? "rgba(24,201,138,0.1)" : "rgba(240,90,74,0.1)", color: msg.startsWith("✅") ? "#18c98a" : "#f05a4a", fontSize: 13, fontWeight: 600 }}>{msg}</div>}

          {tab === "account" ? (
            <>
              <div className="stitle">Account Settings</div>
              <div className="ssub">Update your personal information</div>
              <div className="form-grid">
                <div className="fg">
                  <label className="fl">Full Name</label>
                  <input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
                </div>
                <div className="fg">
                  <label className="fl">Email</label>
                  <input className="fi" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="fg">
                  <label className="fl">Student ID</label>
                  <input className="fi" value={user._id?.slice(-8).toUpperCase() || "—"} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="fg">
                  <label className="fl">Career Goal</label>
                  <input className="fi" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Target Role" />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Interests (comma separated)</label>
                <input className="fi" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Machine Learning, Python, ..." />
              </div>
              <button className="btn bp" style={{ marginTop: 6 }} onClick={onSaveAccount} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : null}

          {tab === "learning" ? (
            <>
              <div className="stitle">Learning Preferences</div>
              <div className="ssub">Tune how the relevance engine works for you</div>
              <div className="fg">
                <label className="fl">Skill Level</label>
                <select className="fi" value={skill} onChange={e => setSkill(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Learning Pace</label>
                <select className="fi" value={pace} onChange={e => setPace(e.target.value)}>
                  <option value="Casual (1–2 hrs/week)">Casual (1–2 hrs/week)</option>
                  <option value="Steady (3–5 hrs/week)">Steady (3–5 hrs/week)</option>
                  <option value="Intensive (6–10 hrs/week)">Intensive (6–10 hrs/week)</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Primary Career Goal</label>
                <select className="fi" value={goal} onChange={e => setGoal(e.target.value)}>
                  {[
                    "ML Engineer",
                    "Data Scientist",
                    "Frontend Developer",
                    "Full Stack Developer",
                    "UX Designer",
                    "Cloud Architect",
                    "Data Analyst",
                    "AI Researcher",
                    "Backend Developer",
                  ].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <button className="btn bp" style={{ marginTop: 6 }} onClick={onUpdateLearning} disabled={saving}>
                {saving ? "Updating..." : "Update Preferences"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
