import { useState } from "react";
import { postJSON } from "../api.js";
import CountUp from "./countUp.jsx";
import "../results.css";

/* ---------- helpers (used only if the backend did not send these fields) ---------- */

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "#4C8DFF" };
  if (bmi < 25)   return { label: "Normal",      color: "#39FF8A" };
  if (bmi < 30)   return { label: "Overweight",  color: "#FFB800" };
  return                 { label: "Obese",       color: "#FF5B6E" };
}

function deriveMacros(targetKcal, weightKg, goal) {
  const perKg = goal === "lose" ? 2.0 : goal === "gain" ? 1.8 : 1.6;
  const protein = Math.round(weightKg * perKg);
  const fat = Math.round((targetKcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));
  return { protein_g: protein, carbs_g: carbs, fat_g: fat };
}

const MEAL_SPLIT = [
  { name: "Breakfast", icon: "🍳", pct: 0.25 },
  { name: "Lunch",     icon: "🍛", pct: 0.35 },
  { name: "Snack",     icon: "🍎", pct: 0.10 },
  { name: "Dinner",    icon: "🥗", pct: 0.30 },
];

const GOAL_LABELS = { lose: "Weight Loss 🔥", maintain: "Maintain ⚖️", gain: "Muscle Gain 💪" };

/* ---------- result view ---------- */

function DietResult({ data, req }) {
  const [checked, setChecked] = useState({});

  const bmi = data.bmi;
  const cat = bmiCategory(bmi);
  const markerPct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));

  const macros = data.macros || deriveMacros(data.target_calories, req.weight_kg, req.goal);
  const kcalP = macros.protein_g * 4;
  const kcalC = macros.carbs_g * 4;
  const kcalF = macros.fat_g * 9;
  const kcalTotal = kcalP + kcalC + kcalF || 1;
  const pP = (kcalP / kcalTotal) * 100;
  const pC = (kcalC / kcalTotal) * 100;

  const delta = data.target_calories - data.maintenance_calories;
  const deltaText =
    delta === 0 ? "Same as maintenance"
    : delta < 0 ? `${Math.abs(delta)} kcal deficit / day`
    : `${delta} kcal surplus / day`;

  const warning = data.warning ||
    (data.target_calories < (req.gender === "male" ? 1500 : 1200)
      ? "Target calories are very low. Do not go this low without a doctor or dietician."
      : (req.goal === "lose" && bmi < 18.5)
        ? "Your BMI is already underweight. Losing weight is not advised."
        : null);

  const macroRows = [
    { name: "Protein", g: macros.protein_g, color: "#00D4FF", pct: pP },
    { name: "Carbs",   g: macros.carbs_g,   color: "#7B5FFF", pct: pC },
    { name: "Fat",     g: macros.fat_g,     color: "#FFB800", pct: 100 - pP - pC },
  ];

  const groceries = data.grocery_list || [];

  return (
    <div className="dyn-wrap">
      <div>
        <span className="dyn-badge">{GOAL_LABELS[req.goal] || req.goal}</span>
      </div>

      {warning && <div className="dyn-note">⚠ {warning}</div>}

      {/* Top stats */}
      <div className="dyn-stats">
        <div className="dyn-stat hero">
          <div className="dyn-stat-label">Daily Target</div>
          <div className="dyn-stat-value" style={{ color: "var(--neon-cyan)" }}>
            <CountUp value={data.target_calories} /><small>kcal</small>
          </div>
          <div className="dyn-stat-sub">{deltaText}</div>
        </div>
        <div className="dyn-stat">
          <div className="dyn-stat-label">Maintenance</div>
          <div className="dyn-stat-value">
            <CountUp value={data.maintenance_calories} /><small>kcal</small>
          </div>
          <div className="dyn-stat-sub">Calories to hold current weight</div>
        </div>
        <div className="dyn-stat">
          <div className="dyn-stat-label">BMI</div>
          <div className="dyn-stat-value" style={{ color: cat.color }}>
            <CountUp value={bmi} decimals={1} />
          </div>
          <div className="dyn-stat-sub" style={{ color: cat.color }}>{cat.label}</div>
        </div>
      </div>

      {/* BMI scale */}
      <div className="dyn-panel">
        <div className="dyn-section-title">Where you are on the BMI scale</div>
        <div className="dyn-bmi-bar">
          <div className="dyn-bmi-marker" style={{ left: `${markerPct}%` }} />
        </div>
        <div className="dyn-bmi-legend">
          <span>Under 18.5</span><span>18.5 – 24.9</span><span>25 – 29.9</span><span>30+</span>
        </div>
      </div>

      {/* Macros */}
      <div className="dyn-panel">
        <div className="dyn-section-title">Daily macros</div>
        <div className="dyn-macro-grid">
          <div
            className="dyn-donut"
            style={{
              background: `conic-gradient(#00D4FF 0 ${pP}%, #7B5FFF ${pP}% ${pP + pC}%, #FFB800 ${pP + pC}% 100%)`,
            }}
          >
            <div className="dyn-donut-center">
              <b>{data.target_calories}</b>kcal
            </div>
          </div>
          <div className="dyn-macro-list">
            {macroRows.map((m) => (
              <div key={m.name}>
                <div className="dyn-macro-row-top">
                  <span>{m.name}</span>
                  <span><b style={{ color: "var(--text-primary)" }}>{m.g}g</b> · {Math.round(m.pct)}%</span>
                </div>
                <div className="dyn-track">
                  <div className="dyn-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal split */}
      <div className="dyn-panel">
        <div className="dyn-section-title">Calories per meal</div>
        <div className="dyn-meals">
          {MEAL_SPLIT.map((m) => (
            <div className="dyn-meal" key={m.name}>
              <div className="dyn-meal-name">{m.icon} {m.name}</div>
              <div className="dyn-meal-kcal">
                {Math.round(data.target_calories * m.pct)} <small>kcal</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grocery list */}
      {groceries.length > 0 && (
        <div className="dyn-panel">
          <div className="dyn-section-title">
            Grocery list · {Object.values(checked).filter(Boolean).length}/{groceries.length} picked
          </div>
          <div className="dyn-chips">
            {groceries.map((item) => (
              <span
                key={item}
                className={`dyn-chip ${checked[item] ? "done" : ""}`}
                onClick={() => setChecked((c) => ({ ...c, [item]: !c[item] }))}
              >
                {checked[item] ? "✓ " : ""}{item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- main component ---------- */

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
    const req = {
      weight_kg: Number(weight),
      height_cm: Number(height),
      age: Number(age),
      gender,
      goal,
      activity_level: activity,
    };
    try {
      const data = await postJSON("/diet/plan", req);
      // keep a snapshot of what was asked, so the result does not change when the user edits the form
      setResult({ data, req });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const valid =
    result && !result.data.error &&
    typeof result.data.target_calories === "number" &&
    typeof result.data.bmi === "number";

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

      {result?.data?.error && <div className="mod-error">⚠ {String(result.data.error)}</div>}

      {valid && <DietResult data={result.data} req={result.req} />}
    </div>
  );
}