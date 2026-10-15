import { useState } from "react";
import { postJSON } from "../api.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitTracker() {
  const [days,    setDays]    = useState([true, true, false, true, false, false, true]);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function toggleDay(i) {
    const next = [...days];
    next[i] = !next[i];
    setDays(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON("/habits/predict", { last_7_days: days });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const completedDays = days.filter(Boolean).length;
  const pct = Math.round((completedDays / 7) * 100);

  const riskLevel = result?.skip_probability != null
    ? result.skip_probability > 0.6 ? "high"
    : result.skip_probability > 0.35 ? "medium"
    : "low"
    : null;

  const riskColors = {
    high:   { color: "#FF6B80", bg: "rgba(255,60,80,0.1)", border: "rgba(255,60,80,0.3)" },
    medium: { color: "#FFB800", bg: "rgba(255,184,0,0.1)",  border: "rgba(255,184,0,0.3)" },
    low:    { color: "var(--neon-green)", bg: "rgba(57,255,138,0.08)", border: "rgba(57,255,138,0.3)" },
  };

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(255,184,0,0.1)", borderColor: "rgba(255,184,0,0.3)" }}>
          ✓
        </div>
        <div className="mod-header-text">
          <h1>AI Fitness Habit Tracker</h1>
          <p>Mark the days you worked out this week and predict your skip risk.</p>
        </div>
      </div>

      {/* Week summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 28, fontFamily: "Orbitron, sans-serif", fontWeight: 800,
          background: "linear-gradient(90deg, #FFB800, var(--neon-cyan))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {completedDays}/7
        </span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Days completed</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pct}% weekly consistency</div>
        </div>
      </div>

      {/* Day grid */}
      <div className="day-grid">
        {DAYS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`day-btn ${days[i] ? "done" : ""}`}
            onClick={() => toggleDay(i)}
          >
            <span className="day-dot" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button className="mod-btn mod-btn-full" onClick={handleSubmit} disabled={loading}
        style={{ background: "linear-gradient(135deg, #9B6B00, #FFB800)" }}>
        {loading ? <><span className="spin" /> Predicting...</> : "🔮 Predict Skip Risk"}
      </button>

      {error && <div className="mod-error">⚠ {error}</div>}

      {result && (
        <div className="mod-result" style={riskLevel ? {
          background: riskColors[riskLevel].bg,
          borderColor: riskColors[riskLevel].border,
        } : {}}>
          {result.skip_probability != null && (
            <div className="result-row">
              <span className="result-label">Skip Risk</span>
              <span className="result-value" style={{ color: riskLevel ? riskColors[riskLevel].color : undefined }}>
                {Math.round(result.skip_probability * 100)}%
                {riskLevel && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>({riskLevel})</span>}
              </span>
            </div>
          )}
          {result.message && <div className="result-feedback">{result.message}</div>}
          {!result.skip_probability && !result.message && (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
