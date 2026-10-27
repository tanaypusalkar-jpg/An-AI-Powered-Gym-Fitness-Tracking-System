import { useEffect, useState } from "react";
import { postJSON } from "../api.js";
import "../results.css";

/* ---------- helpers ---------- */

// Heart-rate zones (absolute bpm, same 160 limit your backend uses)
const HR_MIN = 60;
const HR_MAX = 200;
const HR_ZONES = [
  { name: "Light",    from: 60,  to: 100, color: "#4C8DFF" },
  { name: "Moderate", from: 100, to: 140, color: "#39FF8A" },
  { name: "Hard",     from: 140, to: 160, color: "#FFB800" },
  { name: "Max",      from: 160, to: 200, color: "#FF5B6E" },
];

// Target rep range used by the backend: <=5 too hard, >=15 too easy
const REP_MIN = 0;
const REP_MAX = 20;

function pct(value, min, max) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function zoneOf(hr) {
  return HR_ZONES.find((z) => hr >= z.from && hr < z.to) || HR_ZONES[HR_ZONES.length - 1];
}

const VERDICTS = {
  ok:       { icon: "✅", title: "Keep going",         color: "#39FF8A" },
  increase: { icon: "⬆️", title: "Increase resistance", color: "#00D4FF" },
  decrease: { icon: "⬇️", title: "Lower resistance",    color: "#FFB800" },
  alert:    { icon: "🚨", title: "Heart rate too high", color: "#FF5B6E" },
};

// Use backend "status" if present, otherwise work it out from the numbers
function getStatus(d) {
  if (d.status && VERDICTS[d.status]) return d.status;
  if (d.heart_rate != null && d.heart_rate > 160) return "alert";
  if (d.reps_completed >= 15) return "increase";
  if (d.reps_completed <= 5) return "decrease";
  return "ok";
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/* ---------- rest timer ---------- */

function RestTimer({ seconds, resetKey }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  // new result -> new timer
  useEffect(() => {
    setLeft(seconds);
    setRunning(false);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const done = left === 0;
  const progress = seconds > 0 ? (left / seconds) * 100 : 0;

  return (
    <div className="dyn-panel">
      <div className="dyn-section-title">Rest timer</div>
      <div className="dyn-timer">
        <div
          className="dyn-timer-ring"
          style={{
            background: `conic-gradient(${done ? "#39FF8A" : "#00D4FF"} ${progress}%, rgba(255,255,255,0.06) ${progress}%)`,
          }}
        >
          <div className="dyn-timer-time" style={{ color: done ? "var(--neon-green)" : undefined }}>
            {done ? "Go!" : fmtTime(left)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
            Suggested rest: <b style={{ color: "var(--text-primary)" }}>{seconds} seconds</b>
          </div>
          <div className="dyn-timer-actions">
            <button type="button" className="dyn-btn-sm" onClick={() => setRunning((r) => !r)} disabled={done}>
              {running ? "⏸ Pause" : "▶ Start rest"}
            </button>
            <button type="button" className="dyn-btn-sm" onClick={() => { setLeft(seconds); setRunning(false); }}>
              ↺ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- result view ---------- */

function GymResult({ data, resultId }) {
  const status = getStatus(data);
  const v = VERDICTS[status];
  const hr = data.heart_rate;
  const zone = hr != null ? zoneOf(hr) : null;
  const rest = data.suggested_rest_seconds ?? 60;

  return (
    <div className="dyn-wrap">
      {/* Verdict */}
      <div className={`dyn-verdict ${status}`}>
        <div className="dyn-verdict-icon">{v.icon}</div>
        <div>
          <div className="dyn-verdict-title" style={{ color: v.color }}>{v.title}</div>
          <div className="dyn-verdict-text">{data.recommendation}</div>
          <div className="dyn-verdict-text" style={{ marginTop: 6 }}>
            Equipment: <b style={{ color: "var(--text-primary)" }}>{data.equipment_id}</b>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="dyn-gauges">
        {/* Heart rate zones */}
        <div className="dyn-panel">
          <div className="dyn-section-title">Heart rate zone</div>
          {hr != null ? (
            <>
              <div className="dyn-gauge-head">
                <b style={{ color: zone.color }}>{hr} bpm</b>
                <span>{zone.name} zone</span>
              </div>
              <div className="dyn-zone-bar">
                {HR_ZONES.map((z) => (
                  <div key={z.name} style={{ width: `${((z.to - z.from) / (HR_MAX - HR_MIN)) * 100}%`, background: z.color, opacity: 0.85 }} />
                ))}
                <div className="dyn-zone-pin" style={{ left: `${pct(hr, HR_MIN, HR_MAX)}%` }} />
              </div>
              <div className="dyn-zone-legend">
                {HR_ZONES.map((z) => <span key={z.name}>{z.name}</span>)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No heart-rate reading sent.</div>
          )}
        </div>

        {/* Reps gauge */}
        <div className="dyn-panel">
          <div className="dyn-section-title">Reps vs target range</div>
          <div className="dyn-gauge-head">
            <b>{data.reps_completed} reps</b>
            <span>at {data.current_load_kg} kg</span>
          </div>
          <div className="dyn-zone-bar">
            <div style={{ width: `${pct(6, REP_MIN, REP_MAX)}%`, background: "#FFB800", opacity: 0.85 }} />
            <div style={{ width: `${pct(15, REP_MIN, REP_MAX) - pct(6, REP_MIN, REP_MAX)}%`, background: "#39FF8A", opacity: 0.85 }} />
            <div style={{ width: `${100 - pct(15, REP_MIN, REP_MAX)}%`, background: "#00D4FF", opacity: 0.85 }} />
            <div className="dyn-zone-pin" style={{ left: `${pct(data.reps_completed, REP_MIN, REP_MAX)}%` }} />
          </div>
          <div className="dyn-zone-legend">
            <span>≤5 too heavy</span><span>6–14 good</span><span>15+ too easy</span>
          </div>
        </div>
      </div>

      <RestTimer seconds={rest} resetKey={resultId} />
    </div>
  );
}

/* ---------- session log ---------- */

function SessionLog({ items }) {
  if (items.length === 0) return null;
  return (
    <div className="dyn-panel" style={{ marginTop: 16 }}>
      <div className="dyn-section-title">This session · last {items.length} checks</div>
      <div className="dyn-log-row head">
        <span>Equipment</span><span>Load</span><span>Reps</span><span>HR</span><span>Verdict</span>
      </div>
      {items.map((it) => {
        const s = getStatus(it.data);
        return (
          <div className="dyn-log-row" key={it.id}>
            <span>{it.data.equipment_id}</span>
            <span>{it.data.current_load_kg} kg</span>
            <span>{it.data.reps_completed}</span>
            <span>{it.data.heart_rate ?? "–"}</span>
            <span><i className="dyn-dot" style={{ background: VERDICTS[s].color }} />{VERDICTS[s].title}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- main component ---------- */

export default function SmartGym() {
  const [equipmentId, setEquipmentId] = useState("Treadmill-01");
  const [load,        setLoad]        = useState(20);
  const [reps,        setReps]        = useState(10);
  const [heartRate,   setHeartRate]   = useState(140);
  const [result,      setResult]      = useState(null);
  const [history,     setHistory]     = useState([]);
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
      const entry = { id: Date.now(), data };
      setResult(entry);
      setHistory((h) => [entry, ...h].slice(0, 5));
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

      {result && typeof result.data === "object" && result.data.recommendation && (
        <GymResult data={result.data} resultId={result.id} />
      )}

      <SessionLog items={history} />
    </div>
  );
}