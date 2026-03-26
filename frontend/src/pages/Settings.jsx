import { useEffect, useMemo, useState } from "react";
import { FiSave, FiSliders, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";
import { getSession, updateProfile } from "../services/authService.js";

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const PLATFORM_OPTIONS = ["Coursera", "edX", "Udacity", "NPTEL"];
const FORMAT_OPTIONS = ["Video Courses", "Reading Material", "Projects", "Interactive Labs"];
const CAREER_TARGET_OPTIONS = [
  "Machine Learning Engineer",
  "Data Scientist",
  "Backend Developer",
  "Cloud Engineer",
  "AI Researcher",
];

const DEFAULT_SKILLS = {
  python: 60,
  machineLearning: 40,
  statistics: 30,
  algorithms: 20,
  dataScience: 50,
};

function parseInterests(input) {
  return String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeSkills(userSkills) {
  return {
    ...DEFAULT_SKILLS,
    ...(userSkills || {}),
  };
}

function toggleValue(current, value) {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
}

export default function Settings() {
  const [tab, setTab] = useState("account");
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);

  const [name, setName] = useState(user.name || "");
  const [email] = useState(user.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [interests, setInterests] = useState((user.interests || []).join(", "));

  const [preferredDifficulty, setPreferredDifficulty] = useState(
    user.learningPreferences?.preferredDifficultyLevel || user.skillLevel || user.skill || "Intermediate"
  );
  const [preferredPlatforms, setPreferredPlatforms] = useState(
    user.learningPreferences?.preferredPlatforms || user.preferredPlatforms || []
  );
  const [learningFormat, setLearningFormat] = useState(
    user.learningPreferences?.learningFormat || user.learningFormat || []
  );
  const [careerTarget, setCareerTarget] = useState(
    user.careerTarget || user.goal || user.careerGoal || "Machine Learning Engineer"
  );
  const [skills, setSkills] = useState(mergeSkills(user.skills));

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setName(user.name || "");
    setAvatarUrl(user.avatarUrl || "");
    setInterests((user.interests || []).join(", "));
    setPreferredDifficulty(
      user.learningPreferences?.preferredDifficultyLevel || user.skillLevel || user.skill || "Intermediate"
    );
    setPreferredPlatforms(user.learningPreferences?.preferredPlatforms || user.preferredPlatforms || []);
    setLearningFormat(user.learningPreferences?.learningFormat || user.learningFormat || []);
    setCareerTarget(user.careerTarget || user.goal || user.careerGoal || "Machine Learning Engineer");
    setSkills(mergeSkills(user.skills));
  }, [user]);

  useEffect(() => {
    if (!msg) return undefined;
    const timer = setTimeout(() => setMsg(""), 3200);
    return () => clearTimeout(timer);
  }, [msg]);

  const onSaveAccount = async () => {
    setSaving(true);
    setMsg("");
    try {
      await updateProfile({
        name,
        avatarUrl,
        interests: parseInterests(interests),
      });
      setMsg("✅ Account profile updated.");
    } catch (error) {
      setMsg(error.response?.data?.error || "❌ Failed to update account profile.");
    } finally {
      setSaving(false);
    }
  };

  const onSavePersonalization = async () => {
    setSaving(true);
    setMsg("");
    try {
      await updateProfile({
        skillLevel: preferredDifficulty,
        careerTarget,
        careerGoal: careerTarget,
        preferredPlatforms,
        learningFormat,
        learningPreferences: {
          preferredDifficultyLevel: preferredDifficulty,
          preferredPlatforms,
          learningFormat,
        },
        skills: {
          python: Number(skills.python),
          machineLearning: Number(skills.machineLearning),
          statistics: Number(skills.statistics),
          algorithms: Number(skills.algorithms),
          dataScience: Number(skills.dataScience),
        },
      });
      setMsg("✅ Learning preferences saved.");
    } catch (error) {
      setMsg(error.response?.data?.error || "❌ Failed to save learning preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Settings</div>
        <div className="ps">Personalize recommendations and roadmap behavior from your profile signals.</div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {[
            ["account", "👤 Account"],
            ["learning", "🧠 Personalization"],
          ].map(([id, label]) => (
            <div key={id} className={"sni " + (tab === id ? "on" : "")} onClick={() => setTab(id)}>
              {label}
            </div>
          ))}
        </div>

        <div className="settings-panel glass-card">
          {msg ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                background: msg.startsWith("✅") ? "rgba(24,201,138,0.1)" : "rgba(240,90,74,0.1)",
                color: msg.startsWith("✅") ? "#18c98a" : "#f05a4a",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {msg}
            </div>
          ) : null}

          {tab === "account" ? (
            <>
              <div className="stitle">Account Settings</div>
              <div className="ssub">Keep your profile details up to date.</div>
              <div className="pref-grid">
                <section className="pref-card">
                  <div className="pref-card-head">
                    <FiUser />
                    <span>Basic Profile</span>
                  </div>
                  <div className="form-grid">
                    <div className="fg">
                      <label className="fl">Full Name</label>
                      <input
                        className="fi"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="fg">
                      <label className="fl">Email</label>
                      <input className="fi" value={email} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                    </div>
                  </div>
                  <div className="fg" style={{ marginTop: 12 }}>
                    <label className="fl">Profile Picture</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div
                        className="sb-av"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          backgroundColor: "var(--bg-h)",
                          border: "1px solid var(--bd)",
                          backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          color: avatarUrl ? "transparent" : "var(--t)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {name?.[0] || "U"}
                      </div>
                      <input
                        className="fi"
                        value={avatarUrl}
                        onChange={(event) => setAvatarUrl(event.target.value)}
                        placeholder="Paste image URL or upload below"
                      />
                    </div>
                    <input
                      className="fi"
                      type="file"
                      accept="image/*"
                      style={{ marginTop: 8 }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setAvatarUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <div className="fg" style={{ marginTop: 12 }}>
                    <label className="fl">Interests (comma separated)</label>
                    <input
                      className="fi"
                      value={interests}
                      onChange={(event) => setInterests(event.target.value)}
                      placeholder="Machine Learning, Python, Statistics"
                    />
                  </div>
                </section>
              </div>

              <button className="btn bp" style={{ marginTop: 10 }} onClick={onSaveAccount} disabled={saving}>
                <FiSave style={{ marginRight: 6 }} />
                {saving ? "Saving..." : "Save Account"}
              </button>
            </>
          ) : null}

          {tab === "learning" ? (
            <>
              <div className="stitle">Learning Preferences</div>
              <div className="ssub">Tune recommendation intelligence based on how you learn best.</div>

              <div className="pref-grid">
                <section className="pref-card">
                  <div className="pref-card-head">
                    <FiSliders />
                    <span>Learning Preferences</span>
                  </div>

                  <div className="fg">
                    <label className="fl">Preferred Difficulty Level</label>
                    <select
                      className="fi"
                      value={preferredDifficulty}
                      onChange={(event) => setPreferredDifficulty(event.target.value)}
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fg" style={{ marginTop: 12 }}>
                    <label className="fl">Preferred Platforms</label>
                    <div className="chip-check-grid">
                      {PLATFORM_OPTIONS.map((option) => (
                        <label key={option} className="chip-check">
                          <input
                            type="checkbox"
                            checked={preferredPlatforms.includes(option)}
                            onChange={() =>
                              setPreferredPlatforms((current) => toggleValue(current, option))
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="fg" style={{ marginTop: 12 }}>
                    <label className="fl">Learning Format</label>
                    <div className="chip-check-grid">
                      {FORMAT_OPTIONS.map((option) => (
                        <label key={option} className="chip-check">
                          <input
                            type="checkbox"
                            checked={learningFormat.includes(option)}
                            onChange={() =>
                              setLearningFormat((current) => toggleValue(current, option))
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="pref-card">
                  <div className="pref-card-head">
                    <FiTarget />
                    <span>Career Target</span>
                  </div>
                  <div className="fg">
                    <label className="fl">Desired Role</label>
                    <select
                      className="fi"
                      value={careerTarget}
                      onChange={(event) => setCareerTarget(event.target.value)}
                    >
                      {CAREER_TARGET_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              </div>

              <section className="pref-card" style={{ marginTop: 14 }}>
                <div className="pref-card-head">
                  <FiTrendingUp />
                  <span>Skill Self Assessment</span>
                </div>

                <div className="skill-slider-list">
                  {[
                    ["python", "Python"],
                    ["machineLearning", "Machine Learning"],
                    ["statistics", "Statistics"],
                    ["algorithms", "Algorithms"],
                    ["dataScience", "Data Science"],
                  ].map(([key, label]) => (
                    <div className="skill-slider-row" key={key}>
                      <div className="skill-slider-top">
                        <span>{label}</span>
                        <strong>{skills[key]}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skills[key]}
                        onChange={(event) =>
                          setSkills((current) => ({
                            ...current,
                            [key]: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <button className="btn bp" style={{ marginTop: 14 }} onClick={onSavePersonalization} disabled={saving}>
                <FiSave style={{ marginRight: 6 }} />
                {saving ? "Saving..." : "Save Personalization"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
