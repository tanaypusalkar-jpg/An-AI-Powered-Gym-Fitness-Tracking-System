import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function GymRecommender() {
  const [city, setCity] = useState("Nashik");
  const [goal, setGoal] = useState("general fitness");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await postJSON("/recommend/gyms", { city, goal });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Gym Recommender & Planner</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="field">
            <label>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="field">
            <label>Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="weight loss">Weight loss</option>
              <option value="muscle gain">Muscle gain</option>
              <option value="general fitness">General fitness</option>
            </select>
          </div>
        </div>
        <button className="submit" type="submit">Get Recommendations</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
