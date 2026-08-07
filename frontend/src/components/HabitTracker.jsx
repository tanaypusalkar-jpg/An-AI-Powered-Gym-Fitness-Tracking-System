import React, { useState } from "react";
import { postJSON } from "../api.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitTracker() {
  const [days, setDays] = useState([true, true, false, true, false, false, true]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function toggleDay(i) {
    const next = [...days];
    next[i] = !next[i];
    setDays(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await postJSON("/habits/predict", { last_7_days: days });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>AI Fitness Habit Tracker</h2>
      <p>Toggle which of the last 7 days you worked out, then predict skip risk.</p>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 12 }}>
        {DAYS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={days[i] ? "active" : ""}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", cursor: "pointer" }}
            onClick={() => toggleDay(i)}
          >
            {label}: {days[i] ? "✅" : "❌"}
          </button>
        ))}
      </div>
      <button className="submit" onClick={handleSubmit}>Predict Skip Risk</button>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
