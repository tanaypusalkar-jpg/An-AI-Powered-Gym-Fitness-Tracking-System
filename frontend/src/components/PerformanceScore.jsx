import { useState } from "react";
import { calculatePerformance } from "../api";

export default function PerformanceScore() {
  const [reps,      setReps]      = useState(10);
  const [duration,  setDuration]  = useState(30);
  const [formScore, setFormScore] = useState(80);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await calculatePerformance({
        reps: Number(reps),
        duration_minutes: Number(duration),
        form_score: Number(formScore),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  const score    = result?.performance_score ?? null;
  const scorePct = score != null ? Math.min(100, Math.round(score)) : 0;
  const grade    =
    scorePct >= 90 ? { label: "S", color: "var(--neon-cyan)" }
    : scorePct >= 75 ? { label: "A", color: "var(--neon-green)" }
    : scorePct >= 60 ? { label: "B", color: "#FFB800" }
    : scorePct >= 45 ? { label: "C", color: "#FF9040" }
    : { label: "D", color: "#FF6B80" };

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(0,212,255,0.1)", borderColor: "rgba(0,212,255,0.3)" }}>
          📈
        </div>
        <div className="mod-header-text">
          <h1>Performance Score</h1>
          <p>Calculate your overall workout performance score based on your session data.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mod-row">
          <div className="mod-field">
            <label>Reps</label>
            <input className="mod-input" type="number" min="0" value={reps}
              onChange={(e) => setReps(e.target.value)} placeholder="e.g. 10" />
          </div>
          <div className="mod-field">
            <label>Duration (min)</label>
            <input className="mod-input" type="number" min="0" value={duration}
              onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="mod-field">
            <label>Form Score (0–100)</label>
            <input className="mod-input" type="number" min="0" max="100" value={formScore}
              onChange={(e) => setFormScore(e.target.value)} placeholder="e.g. 80" />
          </div>
        </div>

        <button type="submit" className="mod-btn mod-btn-full" disabled={loading}
          style={{ background: "linear-gradient(135deg, #0080cc, var(--neon-cyan))" }}>
          {loading ? <><span className="spin" /> Calculating...</> : "🏆 Calculate Score"}
        </button>
      </form>

      {error && <div className="mod-error">⚠ {error}</div>}

      {result && (
        <div className="mod-result">
          {score != null ? (
            <>
              {/* Score ring */}
              <div className="score-ring-wrap">
                <div
                  className="score-ring"
                  style={{ "--pct": `${scorePct}%` }}
                >
                  <div className="score-ring-inner">
                    <strong>{scorePct}</strong>
                    <small>/ 100 pts</small>
                  </div>
                </div>
              </div>

              {/* Grade badge */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <span style={{
                  padding: "4px 18px", borderRadius: 20,
                  background: `${grade.color}15`,
                  border: `1px solid ${grade.color}40`,
                  color: grade.color, fontSize: 13, fontWeight: 700
                }}>
                  Grade: {grade.label}
                </span>
              </div>

              {result.feedback && <div className="result-feedback">{result.feedback}</div>}
            </>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
