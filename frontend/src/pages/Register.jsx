import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession, serverRegister } from "../services/authService.js";

const ALL_INTERESTS = [
  "Machine Learning",
  "Python",
  "React",
  "Data Science",
  "Cloud",
  "NLP",
  "Computer Vision",
  "SQL",
  "DevOps",
  "UX Design",
  "JavaScript",
  "Deep Learning",
  "Statistics",
  "Node.js",
  "Docker",
];

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [interests, setInterests] = useState(["Machine Learning", "Python"]);
  const [skill, setSkill] = useState("Intermediate");
  const [goal, setGoal] = useState("ML Engineer");
  const [pace, setPace] = useState("Steady");
  const [platforms, setPlatforms] = useState(["Coursera", "edX"]);
  const [pref, setPref] = useState("Paid Allowed");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [learningFormat, setLearningFormat] = useState("Video Lectures");

  const toggleInterest = (tag) =>
    setInterests((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const togglePlatform = (p) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  useEffect(() => {
    const session = getSession();
    if (session) {
      navigate(session.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const finish = async () => {
    try {
      await serverRegister({
        name: name || "Alex Kim",
        email: email || "alex@uni.edu",
        password: pass,
        role: "student",
        adminId: null,
        skill,
        goal,
        pace,
        interests,
        preferredPlatforms: platforms,
        learningPreference: pref,
        educationLevel,
        learningFormat,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.error || "Registration failed or user already exists");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-gem">CQ</div>
          <div className="logo-name">
            Course<em>IQ</em>
          </div>
        </div>

        <div className="auth-t">{["Create Account", "Your Interests", "Skill & Career", "Learning Pace", "Preferences", "Learning Details"][step - 1]}</div>
        <div className="auth-s">Step {step} of 6 · Build your learning profile</div>

        <div className="ob-prog">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={"ob-dot " + (i <= step ? "done" : "")} />
          ))}
        </div>

        {step === 1 ? (
          <>
            <div className="fg">
              <label className="fl">Full Name</label>
              <input className="fi" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Kim" />
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>
            <div className="fg">
              <label className="fl">Password</label>
              <input className="fi" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min 8 characters" />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--t2)", marginBottom: 12 }}>
              Select all topics that interest you:
            </div>
            <div className="itags">
              {ALL_INTERESTS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={"itag " + (interests.includes(tag) ? "on" : "")}
                  onClick={() => toggleInterest(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className="fg" style={{ marginBottom: 16 }}>
              <label className="fl" style={{ marginBottom: 10 }}>
                Your Skill Level
              </label>
              <div className="sk-opts">
                {[
                  ["B", "Beginner", "New to the field"],
                  ["I", "Intermediate", "Some experience"],
                  ["A", "Advanced", "Deep expertise"],
                ].map(([icon, label, desc]) => (
                  <div
                    key={label}
                    className={"sk-opt " + (skill === label ? "on" : "")}
                    onClick={() => setSkill(label)}
                  >
                    <div className="sk-icon">{icon}</div>
                    <div className="sk-lbl">{label}</div>
                    <div className="sk-sub">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fg">
              <label className="fl">Career Goal</label>
              <select className="fi" value={goal} onChange={(e) => setGoal(e.target.value)}>
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
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--t2)", marginBottom: 12 }}>
              How many hours per week can you commit?
            </div>
            {[
              ["C", "Casual", "1–2 hours/week"],
              ["S", "Steady", "3–5 hours/week"],
              ["I", "Intensive", "6–10 hours/week"],
              ["F", "Full-time", "10+ hours/week"],
            ].map(([icon, label, desc]) => (
              <div
                key={label}
                className={"pace-opt " + (pace === label ? "on" : "")}
                onClick={() => setPace(label)}
              >
                <div className="pace-icon">{icon}</div>
                <div>
                  <div className="pace-lbl">{label}</div>
                  <div className="pace-sub">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {step === 5 ? (
          <div>
            <div className="fg" style={{ marginBottom: 16 }}>
              <label className="fl" style={{ marginBottom: 10 }}>Preferred Platforms</label>
              <div className="itags">
                {["Coursera", "edX", "NPTEL", "Udacity", "Udemy", "LinkedIn Learning"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={"itag " + (platforms.includes(p) ? "on" : "")}
                    onClick={() => togglePlatform(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label className="fl">Learning Preference</label>
              <select className="fi" value={pref} onChange={(e) => setPref(e.target.value)}>
                <option value="Paid Allowed">Paid Allowed (Full Access)</option>
                <option value="Free Only">Free Courses Only</option>
              </select>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <>
            <div className="fg" style={{ marginBottom: 16 }}>
              <label className="fl">Education Level</label>
              <select className="fi" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                {["High School", "Some College", "Bachelor's Degree", "Master's Degree", "PhD", "Self-Taught"].map((edu) => (
                  <option key={edu}>{edu}</option>
                ))}
              </select>
            </div>
            <div className="fg" style={{ marginBottom: 16 }}>
              <label className="fl">Preferred Learning Format</label>
              <select className="fi" value={learningFormat} onChange={(e) => setLearningFormat(e.target.value)}>
                {["Video Lectures", "Interactive Coding", "Reading Materials", "Project-Based", "Mixed Format"].map((fmt) => (
                  <option key={fmt}>{fmt}</option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <button
          type="button"
          className="btn bp"
          style={{ width: "100%", marginTop: 16, padding: "11px 0", fontSize: 14, fontFamily: "var(--fd)", fontWeight: 700 }}
          onClick={() => (step < 6 ? setStep((s) => s + 1) : finish())}
        >
          {step < 6 ? "Continue →" : "Launch My Dashboard"}
        </button>

        {step > 1 ? (
          <div className="auth-link">
            <span onClick={() => setStep((s) => s - 1)}>← Back</span>
          </div>
        ) : null}

        <div className="auth-link">
          Already have an account? <Link to="/login" style={{ color: "var(--ac)", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
