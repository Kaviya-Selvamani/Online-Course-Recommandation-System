import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSession, serverLogin } from "../services/authService.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [adminId, setAdminId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session) {
      navigate(session.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const submit = async () => {
    if (!email || !pass) {
      setErr("Please fill in all fields.");
      return;
    }
    if (role === "admin" && !adminId) {
      setErr("Admin ID is required for admin login.");
      return;
    }

    setErr("");
    try {
      await serverLogin({
        email,
        password: pass,
        role,
        adminId: role === "admin" ? adminId : undefined,
      });
      navigate(role === "admin" ? "/admin" : from, { replace: true });
    } catch (error) {
      setErr(error.response?.data?.error || "Invalid credentials or server error.");
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
        <div className="auth-t">Welcome back</div>
        <div className="auth-s">Sign in to your CourseIQ workspace</div>

        <div className="fg" style={{ marginBottom: "18px" }}>
          <label className="fl">Account Type</label>
          <select
            className="fi"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            <option value="student">🎓 Student Account</option>
            <option value="admin">🏫 Admin Workspace</option>
          </select>
        </div>

        {err ? <div className="err">⚠ {err}</div> : null}
        {role === "admin" ? (
          <div className="admin-note">
            Admin access requires your unique <strong>Admin ID</strong> in addition to email and password.
          </div>
        ) : null}

        <div className="fg">
          <label className="fl">Email Address</label>
          <input
            className="fi"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
          />
        </div>
        <div className="fg">
          <label className="fl">Password</label>
          <input
            className="fi"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {role === "admin" ? (
          <div className="fg">
            <label className="fl">Admin ID</label>
            <input
              className="fi"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="ADMIN-XXXX-XXX"
            />
          </div>
        ) : null}

        <button
          type="button"
          className="btn bp"
          style={{ width: "100%", marginTop: 6, padding: "11px 0", fontSize: 14, fontFamily: "var(--fd)", fontWeight: 700 }}
          onClick={submit}
        >
          {role === "admin" ? "Sign In as Admin →" : "Sign In →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--t3)" }}>
          <span style={{ cursor: "pointer", color: "var(--ac)" }}>Forgot password?</span>
        </div>

        <div className="auth-link">
          New to CourseIQ? <Link to="/register" style={{ color: "var(--ac)", fontWeight: 600 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
}
