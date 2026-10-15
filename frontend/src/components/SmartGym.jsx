import { useState } from "react";
import { postJSON } from "../api.js";

export default function SmartGym() {
  const [equipmentId, setEquipmentId] = useState("Treadmill-01");
  const [load,        setLoad]        = useState(20);
  const [reps,        setReps]        = useState(10);
  const [heartRate,   setHeartRate]   = useState(140);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
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
    } finally {
      setLoading(false);
    }
  }

  const hrStatus = heartRate > 160 ? "warn" : "safe";
  const hrLabel  = heartRate > 160 ? "⚠ Elevated" : "✓ Normal";

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(57,255,138,0.1)", borderColor: "rgba(57,255,138,0.3)" }}>
          ⚙️
        </div>
        <div className="mod-header-text">
          <h1>Smart Gym Assistant</h1>
          <p>Simulates live IoT sensor readings from gym equipment over MQTT.</p>
        </div>
      </div>

      {/* Live metric preview */}
      <div className="iot-metrics">
        <div className="iot-chip">
          <div className="iot-val">{load}<span style={{ fontSize: 11 }}>kg</span></div>
          <div className="iot-label">Load</div>
        </div>
        <div className="iot-chip">
          <div className="iot-val">{reps}</div>
          <div className="iot-label">Reps</div>
        </div>
        <div className="iot-chip">
          <div className="iot-val" style={{ color: heartRate > 160 ? "#FFB800" : "var(--neon-green)" }}>
            {heartRate}
          </div>
          <div className="iot-label">Heart Rate</div>
        </div>
        <div className="iot-chip" style={{ alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className={`iot-status ${hrStatus}`}>
            <span className="pulse-dot" style={{ background: heartRate > 160 ? "#FFB800" : undefined }} />
            {hrLabel}
          </span>
          <div className="iot-label" style={{ marginTop: 6 }}>HR Status</div>
        </div>
      </div>

      <div className="mod-divider" />

      <form onSubmit={handleSubmit}>
        <div className="mod-field">
          <label>Equipment ID</label>
          <input className="mod-input" value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)} placeholder="Treadmill-01" />
        </div>
        <div className="mod-row">
          <div className="mod-field">
            <label>Load (kg)</label>
            <input className="mod-input" type="number" value={load}
              onChange={(e) => setLoad(e.target.value)} />
          </div>
          <div className="mod-field">
            <label>Reps Completed</label>
            <input className="mod-input" type="number" value={reps}
              onChange={(e) => setReps(e.target.value)} />
          </div>
          <div className="mod-field">
            <label>Heart Rate (bpm)</label>
            <input className="mod-input" type="number" value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="mod-btn mod-btn-full" disabled={loading}
          style={{ background: "linear-gradient(135deg, #1a7a4a, var(--neon-green))" }}>
          {loading ? <><span className="spin" /> Reading Sensors...</> : "📡 Check Status"}
        </button>
      </form>

      {error && <div className="mod-error">⚠ {error}</div>}

      {result && (
        <div className="mod-result">
          {result.status && (
            <div className="result-row">
              <span className="result-label">Status</span>
              <span className="result-value" style={{ color: "var(--neon-green)" }}>{result.status}</span>
            </div>
          )}
          {result.recommendation && <div className="result-feedback">{result.recommendation}</div>}
          {!result.status && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
