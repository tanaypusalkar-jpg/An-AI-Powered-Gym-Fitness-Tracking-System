import { useState } from "react";
import { analyzeWorkout } from "../api";

export default function GymTrainer() {
  const [exercise, setExercise] = useState("squat");
  const [reps, setReps] = useState(10);
  const [formScore, setFormScore] = useState(80);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await analyzeWorkout({
        exercise,
        reps_detected: Number(reps),
        form_score: Number(formScore),
      });

      setResult(data);
    } catch (error) {
      setResult({
        error: error.message || "Failed to analyze workout",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">AI Gym Trainer</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Exercise
          </label>

          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
          >
            <option value="squat">Squat</option>
            <option value="pushup">Push-up</option>
            <option value="lunge">Lunge</option>
            <option value="bicep curl">Bicep Curl</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Reps
          </label>

          <input
            type="number"
            min="0"
            max="1000"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Form Score
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={formScore}
            onChange={(e) => setFormScore(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg p-3 font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze Workout"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Result</h2>

              <p>
                <strong>Exercise:</strong> {result.exercise}
              </p>

              <p>
                <strong>Reps:</strong> {result.reps_detected}
              </p>

              <p>
                <strong>Form Score:</strong> {result.form_score}/100
              </p>

              <p className="mt-3 text-cyan-400">
                {result.feedback}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}