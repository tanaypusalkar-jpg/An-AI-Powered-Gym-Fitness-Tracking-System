import { useState } from "react";
import { calculatePerformance } from "../api";

export default function PerformanceScore() {
  const [reps, setReps] = useState(10);
  const [duration, setDuration] = useState(30);
  const [formScore, setFormScore] = useState(80);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await calculatePerformance({
        reps: Number(reps),
        duration_minutes: Number(duration),
        form_score: Number(formScore),
      });

      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Performance Score
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5"
      >
        <input
          type="number"
          min="0"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
        />

        <input
          type="number"
          min="0"
          placeholder="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Form Score"
          value={formScore}
          onChange={(e) => setFormScore(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
        />

        <button
          className="w-full bg-yellow-600 hover:bg-yellow-500 rounded-lg p-3 font-semibold"
        >
          Calculate Score
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}