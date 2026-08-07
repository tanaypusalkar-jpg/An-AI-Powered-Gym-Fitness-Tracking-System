import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function WorkoutTrainer() {
  const [exercise, setExercise] = useState("Squat");
  const [reps, setReps] = useState(12);
  const [formScore, setFormScore] = useState(80);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await postJSON("/workout/analyze", {
        exercise,
        reps_detected: Number(reps),
        form_score: Number(formScore),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>AI Gym Trainer</h2>
      <p>Simulates feedback from a workout detection session (reps + form score normally come from MediaPipe).</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Exercise</label>
          <input value={exercise} onChange={(e) => setExercise(e.target.value)} />
        </div>
        <div className="row">
          <div className="field">
            <label>Reps Detected</label>
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
          </div>
          <div className="field">
            <label>Form Score (0-100)</label>
            <input type="number" value={formScore} onChange={(e) => setFormScore(e.target.value)} />
          </div>
        </div>
        <button className="submit" type="submit">Analyze Workout</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
