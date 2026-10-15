import { useState } from "react";
import { postJSON } from "../api.js";

const GOAL_OPTIONS = [
  { value: "weight loss",    label: "Weight Loss 🔥" },
  { value: "muscle gain",    label: "Muscle Gain 💪" },
  { value: "general fitness",label: "General Fitness ⚡" },
];

export default function GymRecommender() {
  const [city,    setCity]    = useState("Nashik");
  const [goal,    setGoal]    = useState("general fitness");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON("/recommend/gyms", { city, goal });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Parse gyms from result — backend may return array or object
  const gyms = Array.isArray(result?.gyms)
    ? result.gyms
    : Array.isArray(result)
    ? result
    : null;

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(0,212,255,0.1)", borderColor: "rgba(0,212,255,0.3)" }}>
          🗺️
        </div>
        <div className="mod-header-text">
          <h1>Gym Recommender & Planner</h1>
          <p>Find the best gyms in your city tailored to your fitness goal.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mod-row">
          <div className="mod-field">
            <label>City</label>
            <input
              className="mod-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city…"
            />
          </div>
          <div className="mod-field">
            <label>Fitness Goal</label>
            <select className="mod-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="mod-btn mod-btn-full" disabled={loading}
          style={{ background: "linear-gradient(135deg, #006080, var(--neon-cyan))" }}>
          {loading ? <><span className="spin" /> Searching...</> : "📍 Get Recommendations"}
        </button>
      </form>

      {error && <div className="mod-error">⚠ {error}</div>}

      {result && !error && (
        <div style={{ marginTop: 20 }}>
          {gyms ? (
            <div className="gym-cards">
              {gyms.map((gym, i) => (
                <div className="gym-card" key={i}>
                  <h4>{gym.name || gym.gym_name || `Gym ${i + 1}`}</h4>
                  {gym.address && <p>📍 {gym.address}</p>}
                  {gym.features && <p>🏷 {gym.features}</p>}
                  {gym.rating && <p>⭐ {gym.rating}</p>}
                  {gym.reason && <p style={{ marginTop: 6, fontStyle: "italic" }}>{gym.reason}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="mod-result">
              {result.recommendation && (
                <div className="result-feedback">{result.recommendation}</div>
              )}
              {!result.recommendation && (
                <pre>{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
