import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendVerificationEmail, serverVerifyEmail } from "../services/authService.js";

function useInitialEmail() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return location.state?.email || params.get("email") || "";
  }, [location]);
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const initialEmail = useInitialEmail();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!email.trim() || !code.trim()) {
      setErr("Email and code are required.");
      return;
    }
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await serverVerifyEmail({ email: email.trim().toLowerCase(), code: code.trim() });
      setInfo("Email verified. Redirecting to login...");
      setTimeout(() => navigate("/login", { state: { email: email.trim().toLowerCase() } }), 800);
    } catch (error) {
      setErr(error.response?.data?.error || "Unable to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await resendVerificationEmail(email.trim().toLowerCase());
      setInfo("Verification code sent.");
    } catch (error) {
      setErr(error.response?.data?.error || "Unable to resend code.");
    } finally {
      setLoading(false);
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

        <div className="auth-t">Verify Your Email</div>
        <div className="auth-s">Enter the 6-digit code sent to your email.</div>

        {err ? <div className="err">⚠ {err}</div> : null}
        {info ? <div className="admin-note">{info}</div> : null}

        <div className="fg">
          <label className="fl">Email</label>
          <input
            className="fi"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
          />
        </div>
        <div className="fg">
          <label className="fl">Verification Code</label>
          <input
            className="fi"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
          />
        </div>

        <button
          type="button"
          className="btn bp"
          style={{ width: "100%", marginTop: 6, padding: "11px 0", fontSize: 14, fontFamily: "var(--fd)", fontWeight: 700 }}
          onClick={verify}
          disabled={loading}
        >
          Verify Email →
        </button>

        <div className="auth-link">
          Didn’t get a code?{" "}
          <span onClick={resend} style={{ fontWeight: 600 }}>Resend</span>
        </div>

        <div className="auth-link">
          Back to{" "}
          <Link to="/login" style={{ color: "var(--ac)", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
