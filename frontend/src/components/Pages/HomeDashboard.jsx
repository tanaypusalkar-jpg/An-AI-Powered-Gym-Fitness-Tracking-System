import { useEffect, useState } from "react";
import FeatureCard from "../components/dashboard/FeatureCard";

/**
 * Home dashboard for the AI Gym & Fitness Assistant.
 * Layout modeled on the "File Recovery" reference mock:
 *   header -> hero progress card -> feature grid.
 *
 * Wire `onOpenModule` to your router (e.g. navigate(`/modules/${key}`)),
 * and swap `fetchTodaySummary` for a real call to your FastAPI backend
 * once you have an endpoint for it — it falls back to sample numbers so
 * the screen renders correctly either way.
 */

const MODULES = [
  {
    key: "workout_trainer",
    label: "Gym Trainer",
    icon: "🏋️",
    bg: "#e9edfb",
    iconBg: "#dbe3fb",
  },
  {
    key: "diet_coach",
    label: "AI Dietician",
    icon: "🥗",
    bg: "#e6f6ee",
    iconBg: "#c9eedb",
  },
  {
    key: "habit_tracker",
    label: "Habit Tracker",
    icon: "✅",
    bg: "#fdeee0",
    iconBg: "#fbdcc0",
  },
  {
    key: "chat_companion",
    label: "Gym Buddy",
    icon: "💬",
    bg: "#fbe8ee",
    iconBg: "#f8d0dd",
  },
  {
    key: "smart_gym",
    label: "Smart Gym (IoT)",
    icon: "📡",
    bg: "#e7f2fb",
    iconBg: "#cde6f8",
  },
  {
    key: "performance_analyzer",
    label: "Pose Analyzer",
    icon: "📈",
    bg: "#f2eefb",
    iconBg: "#e1d7f8",
  },
  {
    key: "gym_recommender",
    label: "Gym Recommender",
    icon: "🎯",
    bg: "#fdf3d9",
    iconBg: "#fbe7ad",
  },
];

async function fetchTodaySummary() {
  // TODO: replace with your real endpoint, e.g.:
  // const res = await api.get("/analytics/today");
  // return res.data;
  return { workoutsDone: 3, workoutsGoal: 5, minutesActive: 42 };
}

export default function HomeDashboard({ onOpenModule, onOpenProgress }) {
  const [summary, setSummary] = useState({
    workoutsDone: 0,
    workoutsGoal: 5,
    minutesActive: 0,
  });

  useEffect(() => {
    let alive = true;
    fetchTodaySummary().then((data) => {
      if (alive) setSummary(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const pct = Math.min(
    100,
    Math.round((summary.workoutsDone / summary.workoutsGoal) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="mx-auto max-w-md px-5 pt-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            Fitness Assistant
          </h1>
          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ⚙️
          </button>
        </div>

        {/* Hero progress card */}
        <button
          type="button"
          onClick={onOpenProgress}
          className="mb-6 flex w-full items-center justify-between rounded-2xl bg-indigo-500 p-5 text-left text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-600"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">
              📊
            </span>
            <div>
              <p className="text-base font-semibold">Today's Activity</p>
              <p className="text-sm text-indigo-100">
                {summary.workoutsDone} / {summary.workoutsGoal} workouts ·{" "}
                {summary.minutesActive} min
              </p>
              <div className="mt-2 h-2 w-40 rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <span className="text-xl text-white/80">›</span>
        </button>

        {/* Feature grid */}
        <h2 className="mb-3 text-base font-bold text-slate-900">Modules</h2>
        <div className="grid grid-cols-2 gap-4">
          {MODULES.map((m) => (
            <FeatureCard
              key={m.key}
              icon={m.icon}
              label={m.label}
              bg={m.bg}
              iconBg={m.iconBg}
              onClick={() => onOpenModule?.(m.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}