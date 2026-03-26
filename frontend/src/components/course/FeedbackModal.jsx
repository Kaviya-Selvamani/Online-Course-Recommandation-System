import { useState } from "react";
import { submitFeedback } from "../../services/feedbackService.js";

const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackModal({ course, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!course?._id) return;
    setSaving(true);
    setError("");
    try {
      const data = await submitFeedback({ courseId: course._id, rating, comment });
      onSubmitted?.(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to submit feedback.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-hd">
          <div className="modal-title">Rate {course?.title}</div>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: "20px 0" }}>
          <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 10 }}>
            Your feedback updates course ratings instantly.
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {RATINGS.map((value) => (
              <button
                key={value}
                className="btn"
                style={
                  rating === value
                    ? { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
                    : { background: "var(--bg-h)", color: "var(--t)", border: "1px solid var(--bd)" }
                }
                onClick={() => setRating(value)}
              >
                {"★".repeat(value)}
              </button>
            ))}
          </div>

          <textarea
            className="fi"
            rows={4}
            placeholder="Share what you liked or what could be improved..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            style={{ resize: "vertical" }}
          />

          {error ? (
            <div style={{ marginTop: 10, color: "#f05a4a", fontSize: 12 }}>{error}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="btn bg" style={{ flex: 1 }} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn bp" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
