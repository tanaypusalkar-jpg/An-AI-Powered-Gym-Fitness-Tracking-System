import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function SmartGym() {
  const [equipmentId, setEquipmentId] = useState("Treadmill-01");
  const [load, setLoad] = useState(20);
  const [reps, setReps] = useState(10);
  const [heartRate, setHeartRate] = useState(140);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await postJSON("/smartgym/status", {
        equipment_id: equipmentId,
        current_load_kg: Number(load),
        reps_completed: Number(reps),
        heart_rate: Number(heartRate),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Smart Gym Assistant (AI + IoT)</h2>
      <p>Simulates a reading coming from IoT-enabled gym equipment over MQTT.</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Equipment ID</label>
          <input value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} />
        </div>
        <div className="row">
          <div className="field">
            <label>Current Load (kg)</label>
            <input type="number" value={load} onChange={(e) => setLoad(e.target.value)} />
          </div>
          <div className="field">
            <label>Reps Completed</label>
            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
          </div>
          <div className="field">
            <label>Heart Rate</label>
            <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />
          </div>
        </div>
        <button className="submit" type="submit">Check Status</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result, null, 2)}</div>}
    </div>
  );
}
