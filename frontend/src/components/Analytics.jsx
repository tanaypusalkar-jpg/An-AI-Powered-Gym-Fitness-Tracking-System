import { useEffect, useState } from "react";
import { getAnalytics } from "../api";

/* Simple inline SVG bar chart — no external deps needed */
function BarChart({ data, label }) {
  if (!data || data.length === 0) return null;
  const max    = Math.max(...data.map((d) => d.value), 1);
  const recent = data.slice(-10);

  return (
    <div className="chart-card">
      <h3>{label}</h3>
      <div className="chart-bars">
        {recent.map((d, i) => {
          const h = Math.round((d.value / max) * 100);
          return (
            <div key={i} className="chart-bar-wrap">
              <div
                className="chart-bar"
                style={{ height: `${h}%` }}
                title={`${d.label}: ${d.value}`}
              />
              <span className="chart-bar-label">
                {d.label?.split(" ")[0] ?? i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Simple stat card */
function Stat({ label, value, color }) {
  return (
    <div className="analytics-stat">
      <strong style={{ color }}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((r) => { setData(r); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  /* Compute summary stats */
  const formScores   = data?.form_score_trend    ?? [];
  const calories     = data?.calorie_trend       ?? [];
  const performance  = data?.performance_trend   ?? [];

  const avgForm = formScores.length
    ? Math.round(formScores.reduce((s, d) => s + d.value, 0) / formScores.length)
    : null;
  const totalSessions = formScores.length;
  const bestScore     = formScores.length ? Math.max(...formScores.map((d) => d.value)) : null;

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="mod-header" style={{ marginBottom: 24 }}>
        <div className="mod-icon-wrap" style={{ background: "rgba(123,95,255,0.15)", borderColor: "rgba(123,95,255,0.3)" }}>
          📊
        </div>
        <div className="mod-header-text">
          <h1 style={{ fontFamily: "Orbitron, sans-serif", fontSize: 22, fontWeight: 700 }}>Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Your fitness trends and performance history.
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>
          <span className="spin" />
          Loading analytics…
        </div>
      )}

      {error && (
        <div className="mod-error">⚠ {error}</div>
      )}

      {data && !error && (
        <>
          {/* Summary stats row */}
          {(avgForm != null || totalSessions > 0) && (
            <div className="analytics-stat-row" style={{ marginBottom: 20 }}>
              {totalSessions > 0 && (
                <Stat label="Total Sessions" value={totalSessions} color="var(--neon-cyan)" />
              )}
              {avgForm != null && (
                <Stat label="Avg Form Score" value={`${avgForm}/100`} color="var(--neon-purple)" />
              )}
              {bestScore != null && (
                <Stat label="Best Score" value={`${bestScore}/100`} color="var(--neon-green)" />
              )}
            </div>
          )}

          {/* Charts */}
          <div className="analytics-grid">
            {formScores.length > 0 && (
              <BarChart data={formScores} label="Form Score Trend" />
            )}
            {calories.length > 0 && (
              <BarChart data={calories} label="Calorie Trend" />
            )}
            {performance.length > 0 && (
              <BarChart data={performance} label="Performance Trend" />
            )}
          </div>

          {/* Fallback: if backend returned something else */}
          {formScores.length === 0 && calories.length === 0 && performance.length === 0 && (
            <div className="mod-result">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
