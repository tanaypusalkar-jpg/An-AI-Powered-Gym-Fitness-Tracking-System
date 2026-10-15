import { useState } from "react";
import { postJSON } from "../api.js";

export default function DietCoach() {
  const [weight,   setWeight]   = useState(70);
  const [height,   setHeight]   = useState(170);
  const [age,      setAge]      = useState(25);
  const [gender,   setGender]   = useState("male");
  const [goal,     setGoal]     = useState("lose");
  const [activity, setActivity] = useState("moderate");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON("/diet/plan", {
        weight_kg: Number(weight),
        height_cm: Number(height),
        age: Number(age),
        gender,
        goal,
        activity_level: activity,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const goalLabels = { lose: "Weight Loss 🔥", maintain: "Maintain ⚖️", gain: "Muscle Gain 💪" };

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(0,212,255,0.12)", borderColor: "rgba(0,212,255,0.3)" }}>
          🥗
        </div>
        <div className="mod-header-text">
          <h1>AI Dietician & Calorie Coach</h1>
          <p>Get a personalised nutrition plan based on your body metrics and goals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mod-row">
          <div className="mod-field">
            <label>Weight (kg)</label>
            <input className="mod-input" type="number" value={weight}
              onChange={(e) => setWeight(e.target.value)} placeholder="70" />
          </div>
          <div className="mod-field">
            <label>Height (cm)</label>
            <input className="mod-input" type="number" value={height}
              onChange={(e) => setHeight(e.target.value)} placeholder="170" />
          </div>
          <div className="mod-field">
            <label>Age</label>
            <input className="mod-input" type="number" value={age}
              onChange={(e) => setAge(e.target.value)} placeholder="25" />
          </div>
        </div>

        <div className="mod-row">
          <div className="mod-field">
            <label>Gender</label>
            <select className="mod-input" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="mod-field">
            <label>Goal</label>
            <select className="mod-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>
          <div className="mod-field">
            <label>Activity Level</label>
            <select className="mod-input" value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <button type="submit" className="mod-btn mod-btn-full" disabled={loading}
          style={{ background: "linear-gradient(135deg, #0EA5E9, #00D4FF)" }}>
          {loading ? <><span className="spin" /> Calculating...</> : "🥦 Get Diet Plan"}
        </button>
      </form>

      {error && <div className="mod-error">⚠ {error}</div>}

      {result && !result.error && (
        <div className="mod-result">
          {/* Goal badge */}
          <div style={{ marginBottom: 14 }}>
            <span style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 20,
              background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--neon-cyan)", fontSize: 12, fontWeight: 600
            }}>
              {goalLabels[goal] || goal}
            </span>
          </div>

          {result.calories_target && (
            <div className="result-row">
              <span className="result-label">Daily Calories</span>
              <span className="result-value" style={{ color: "var(--neon-cyan)" }}>
                {result.calories_target} kcal
              </span>
            </div>
          )}
          {result.protein_g && (
            <div className="result-row">
              <span className="result-label">Protein</span>
              <span className="result-value">{result.protein_g}g</span>
            </div>
          )}
          {result.carbs_g && (
            <div className="result-row">
              <span className="result-label">Carbs</span>
              <span className="result-value">{result.carbs_g}g</span>
            </div>
          )}
          {result.fat_g && (
            <div className="result-row">
              <span className="result-label">Fat</span>
              <span className="result-value">{result.fat_g}g</span>
            </div>
          )}
          {result.advice && <div className="result-feedback">{result.advice}</div>}

          {/* Fallback: show full JSON if fields aren't structured */}
          {!result.calories_target && (
            <pre className="mod-result" style={{ marginTop: 0 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
