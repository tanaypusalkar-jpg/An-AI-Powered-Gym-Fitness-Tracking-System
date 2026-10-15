import { useState } from "react";
import { analyzeWorkout } from "../api";

const EXERCISES = [
  { value: "squat",      label: "Squat" },
  { value: "pushup",     label: "Push-up" },
  { value: "lunge",      label: "Lunge" },
  { value: "bicep curl", label: "Bicep Curl" },
];

export default function GymTrainer() {
  const [exercise, setExercise]   = useState("squat");
  const [reps, setReps]           = useState(10);
  const [formScore, setFormScore] = useState(80);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeWorkout({
        exercise,
        reps_detected: Number(reps),
        form_score: Number(formScore),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze workout");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result?.form_score >= 80 ? "var(--neon-green)"
    : result?.form_score >= 50 ? "#FFB800"
    : "#FF6B80";

  return (
    <div className="mod-card">
      {/* Header */}
      <div className="mod-header">
        <div className="mod-icon-wrap">🏋️</div>
        <div className="mod-header-text">
          <h1>AI Gym Trainer</h1>
          <p>Log your set and get instant AI-powered form feedback.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mod-field">
          <label>Exercise</label>
          <select
            className="mod-input"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          >
            {EXERCISES.map((ex) => (
              <option key={ex.value} value={ex.value}>{ex.label}</option>
            ))}
          </select>
        </div>

        <div className="mod-row">
          <div className="mod-field">
            <label>Reps</label>
            <input
              className="mod-input"
              type="number"
              min="0"
              max="1000"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>
          <div className="mod-field">
            <label>Form Score (0–100)</label>
            <input
              className="mod-input"
              type="number"
              min="0"
              max="100"
              value={formScore}
              onChange={(e) => setFormScore(e.target.value)}
              placeholder="e.g. 80"
            />
          </div>
        </div>

        <button type="submit" className="mod-btn mod-btn-full" disabled={loading}>
          {loading ? <><span className="spin" /> Analyzing...</> : "⚡ Analyze Workout"}
        </button>
      </form>

      {/* Error */}
      {error && <div className="mod-error">⚠ {error}</div>}

      {/* Result */}
      {result && !result.error && (
        <div className="mod-result">
          <div className="result-row">
            <span className="result-label">Exercise</span>
            <span className="result-value">{result.exercise}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Reps</span>
            <span className="result-value">{result.reps_detected}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Form Score</span>
            <span className="result-value" style={{ color: scoreColor }}>
              {result.form_score}/100
            </span>
          </div>
          {result.feedback && (
            <div className="result-feedback">{result.feedback}</div>
          )}
        </div>
      )}
      {result?.error && <div className="mod-error">⚠ {result.error}</div>}
    </div>
  );
}
