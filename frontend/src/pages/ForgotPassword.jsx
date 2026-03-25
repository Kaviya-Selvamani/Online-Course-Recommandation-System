import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../services/authService.js";

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setInfo("If an account exists, a reset code has been sent.");
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.error || "Unable to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    if (!email.trim() || !code.trim() || !password) {
      setErr("Email, code, and new password are required.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
      });
      setInfo("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login", { state: { email: email.trim().toLowerCase() } }), 800);
    } catch (error) {
      setErr(error.response?.data?.error || "Unable to reset password.");
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

        <div className="auth-t">{step === 1 ? "Reset Password" : "Enter Reset Code"}</div>
        <div className="auth-s">
          {step === 1
            ? "We'll email you a verification code."
            : "Check your email for the 6-digit code."}
        </div>

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

        {step === 2 ? (
          <>
            <div className="fg">
              <label className="fl">Verification Code</label>
              <input
                className="fi"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
              />
            </div>
            <div className="fg">
              <label className="fl">New Password</label>
              <input
                className="fi"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="fg">
              <label className="fl">Confirm Password</label>
              <input
                className="fi"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>
          </>
        ) : null}

        <button
          type="button"
          className="btn bp"
          style={{ width: "100%", marginTop: 6, padding: "11px 0", fontSize: 14, fontFamily: "var(--fd)", fontWeight: 700 }}
          onClick={step === 1 ? sendCode : submitReset}
          disabled={loading}
        >
          {step === 1 ? "Send Code →" : "Update Password →"}
        </button>

        {step === 2 ? (
          <div className="auth-link">
            Didn’t get a code?{" "}
            <span onClick={sendCode} style={{ fontWeight: 600 }}>Resend</span>
          </div>
        ) : null}

        <div className="auth-link">
          Remembered your password?{" "}
          <Link to="/login" style={{ color: "var(--ac)", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
