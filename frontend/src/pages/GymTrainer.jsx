// File: frontend/src/pages/modules/GymTrainer.jsx (EXAMPLE - Updated with new design)

import { useState } from 'react';

export default function GymTrainer() {
  const [exercise, setExercise] = useState('Squat');
  const [reps, setReps] = useState(12);
  const [formScore, setFormScore] = useState(80);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // API call here
      // const response = await postJSON('/workout/analyze', { exercise, reps });
      setFormScore(85);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gradient">
            🏋️ AI Gym Trainer
          </h1>
          <p className="text-slate-400 text-lg">
            Get real-time form feedback and rep counting using AI-powered pose detection
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Exercise
                </label>
                <select
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="input-field"
                >
                  <option>Squat</option>
                  <option>Bench Press</option>
                  <option>Deadlift</option>
                  <option>Bicep Curl</option>
                  <option>Push-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Target Reps
                </label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={60}
                  className="input-field"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`btn-primary w-full py-3 font-semibold transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Analyzing...
                  </span>
                ) : (
                  '▶ Analyze Workout'
                )}
              </button>

              <div className="border-t border-slate-700 pt-6 space-y-3">
                <h3 className="font-semibold text-slate-100">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>✓ Ensure good lighting</li>
                  <li>✓ Full body in frame</li>
                  <li>✓ Clear background</li>
                  <li>✓ Smooth movements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video/Camera Feed */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📹</span>
                  <p className="text-slate-400">Camera feed will appear here</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Reps Detected', value: '12', icon: '📊' },
                { label: 'Form Score', value: `${formScore}%`, icon: '⭐' },
                { label: 'Performance', value: '8.5/10', icon: '🎯' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="card p-4 text-center hover:border-cyan-500/50 transition-all group"
                >
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </span>
                  <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Detailed Feedback */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Form Analysis</h3>

              <div className="space-y-3">
                {[
                  { name: 'Knee Alignment', score: 85, status: 'Good' },
                  { name: 'Back Posture', score: 92, status: 'Excellent' },
                  { name: 'Depth Control', score: 78, status: 'Needs Work' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          item.score >= 90
                            ? 'bg-green-500/20 text-green-400'
                            : item.score >= 80
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">💡 Suggestions</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Lower your squats a bit more to achieve full depth</li>
                <li>• Keep your chest up throughout the movement</li>
                <li>• Next session, try increasing reps to 15</li>
              </ul>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr className="text-slate-400">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Exercise</th>
                  <th className="text-right py-2 px-4">Reps</th>
                  <th className="text-right py-2 px-4">Form Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { date: 'Oct 4, 2026', exercise: 'Squat', reps: 12, score: 85 },
                  { date: 'Oct 3, 2026', exercise: 'Bench Press', reps: 10, score: 82 },
                  { date: 'Oct 2, 2026', exercise: 'Deadlift', reps: 8, score: 88 },
                ].map((session, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-slate-300">{session.date}</td>
                    <td className="py-3 px-4 text-slate-300">{session.exercise}</td>
                    <td className="py-3 px-4 text-right text-slate-100 font-medium">{session.reps}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded">
                        {session.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}