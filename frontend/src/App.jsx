import React, { useState } from "react";
import WorkoutTrainer from "./components/WorkoutTrainer.jsx";
import DietCoach from "./components/DietCoach.jsx";
import SmartGym from "./components/SmartGym.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import ChatCompanion from "./components/ChatCompanion.jsx";
import PerformanceAnalyzer from "./components/PerformanceAnalyzer.jsx";
import GymRecommender from "./components/GymRecommender.jsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.jsx";
import HomeDashboard from "./pages/HomeDashboard";
import ProgressDetails from "./pages/ProgressDetails";

// Map each HomeDashboard module key to the existing tab key it should open.
const MODULE_KEY_TO_TAB = {
  workout_trainer: "trainer",
  diet_coach: "diet",
  smart_gym: "smartgym",
  habit_tracker: "habits",
  chat_companion: "chat",
  performance_analyzer: "performance",
  gym_recommender: "recommend",
};

const TABS = [
  {
    key: "home",
    label: "Home",
    component: null, // rendered specially below, so it can receive nav props
  },
  { key: "trainer", label: "Gym Trainer", component: WorkoutTrainer },
  { key: "diet", label: "Diet Coach", component: DietCoach },
  { key: "smartgym", label: "Smart Gym", component: SmartGym },
  { key: "habits", label: "Habit Tracker", component: HabitTracker },
  { key: "chat", label: "Gym Buddy Chat", component: ChatCompanion },
  { key: "performance", label: "Performance Score", component: PerformanceAnalyzer },
  { key: "recommend", label: "Gym Recommender", component: GymRecommender },
  { key: "analytics", label: "Analytics", component: AnalyticsDashboard },
  {
    key: "progress",
    label: "Progress",
    component: null, // rendered specially below, same reason as "home"
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderActiveTab = () => {
    if (activeTab === "home") {
      return (
        <HomeDashboard
          onOpenModule={(key) => setActiveTab(MODULE_KEY_TO_TAB[key] ?? "trainer")}
          onOpenProgress={() => setActiveTab("progress")}
        />
      );
    }
    if (activeTab === "progress") {
      return <ProgressDetails onBack={() => setActiveTab("home")} />;
    }
    const ActiveComponent = TABS.find((t) => t.key === activeTab).component;
    return <ActiveComponent />;
  };

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

      {renderActiveTab()}
    </div>
  );
}