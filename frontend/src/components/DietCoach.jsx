import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function DietCoach() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("male");
  const [goal, setGoal] = useState("lose");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
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
    }
  }

  return (
    <div className="card">
      <h2>AI Dietician & Calorie Coach</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="field">
            <label>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="field">
            <label>Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="field">
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="field">
            <label>Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>
          <div className="field">
            <label>Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <button className="submit" type="submit">Get Diet Plan</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
