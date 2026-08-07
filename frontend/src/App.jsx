import React, { useState } from "react";
import WorkoutTrainer from "./components/WorkoutTrainer.jsx";
import DietCoach from "./components/DietCoach.jsx";
import SmartGym from "./components/SmartGym.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import ChatCompanion from "./components/ChatCompanion.jsx";
import PerformanceAnalyzer from "./components/PerformanceAnalyzer.jsx";
import GymRecommender from "./components/GymRecommender.jsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.jsx";

const TABS = [
  { key: "trainer", label: "Gym Trainer", component: WorkoutTrainer },
  { key: "diet", label: "Diet Coach", component: DietCoach },
  { key: "smartgym", label: "Smart Gym", component: SmartGym },
  { key: "habits", label: "Habit Tracker", component: HabitTracker },
  { key: "chat", label: "Gym Buddy Chat", component: ChatCompanion },
  { key: "performance", label: "Performance Score", component: PerformanceAnalyzer },
  { key: "recommend", label: "Gym Recommender", component: GymRecommender },
  { key: "analytics", label: "Analytics", component: AnalyticsDashboard },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("trainer");
  const ActiveComponent = TABS.find((t) => t.key === activeTab).component;

  return (
    <div className="app">
      <header>
        <h1>AI Gym & Fitness Assistant</h1>
        <p>A unified AI-powered fitness ecosystem — trainer, dietician, motivator, and manager.</p>
      </header>

      <nav>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <ActiveComponent />
    </div>
  );
}
