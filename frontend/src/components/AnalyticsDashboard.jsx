import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { getJSON } from "../api.js";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const result = await getJSON("/analytics/summary?limit=14");
      setData(result);
    } catch (err) {
      setError(err.message + " — try generating some data first (log a workout, diet plan, etc.)");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <h2>Analytics & Progress</h2>
      <p>Trends pulled from everything logged across the other modules.</p>
      <button className="submit" onClick={load} style={{ marginBottom: 16 }}>Refresh</button>
      {error && <div className="error">{error}</div>}

      {data && (
        <>
          <div className="row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
            <StatBox label="Workouts Logged" value={data.totals.total_workouts_logged} />
            <StatBox label="Diet Plans" value={data.totals.total_diet_plans_generated} />
            <StatBox label="Habit Checks" value={data.totals.total_habit_checks} />
            <StatBox label="Performance Scores" value={data.totals.total_performance_scores} />
          </div>

          <ChartBlock title="Form Score Trend">
            <LineChart data={data.form_score_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartBlock>

          <ChartBlock title="Calorie Targets">
            <BarChart data={data.calorie_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Legend />
              <Bar dataKey="maintenance" fill="#64748b" />
              <Bar dataKey="target" fill="#16a34a" />
            </BarChart>
          </ChartBlock>

          <ChartBlock title="Skip Risk Trend">
            <LineChart data={data.skip_probability_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 1]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="value" stroke="#f87171" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartBlock>

          <ChartBlock title="Performance Score Trend">
            <LineChart data={data.performance_score_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartBlock>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: "bold", color: "#2563eb" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
    </div>
  );
}

function ChartBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, color: "#e2e8f0", marginBottom: 8 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
