import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function PerformanceAnalyzer() {
  const [reps, setReps] = useState(15);
  const [duration, setDuration] = useState(10);
  const [formScore, setFormScore] = useState(75);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await postJSON("/performance/score", {
        reps: Number(reps),
        duration_minutes: Number(duration),
        form_score: Number(formScore),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Pose-to-Performance Analyzer</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="field">
            <label>Reps</label>
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="field">
            <label>Form Score (0-100)</label>
            <input type="number" value={formScore} onChange={(e) => setFormScore(e.target.value)} />
          </div>
        </div>
        <button className="submit" type="submit">Calculate Score</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
