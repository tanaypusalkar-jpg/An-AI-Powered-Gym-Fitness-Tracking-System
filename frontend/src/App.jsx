import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import GymTrainer from "./components/GymTrainer";
import DietCoach from "./components/DietCoach";
import SmartGym from "./components/SmartGym";
import HabitTracker from "./components/HabitTracker";
import ChatCompanion from "./components/ChatCompanion";
import PerformanceScore from "./components/PerformanceScore";
import GymRecommender from "./components/GymRecommender";
import Analytics from "./components/Analytics";
import "./styles.css";

const modules = [
  { id: "gym-trainer",    name: "Gym Trainer",  icon: "🏋️" },
  { id: "diet-coach",     name: "Diet Coach",   icon: "🥗" },
  { id: "smart-gym",      name: "Smart Gym",    icon: "⚙️" },
  { id: "habit-tracker",  name: "Habit Tracker",icon: "✓"  },
  { id: "chat-companion", name: "Gym Buddy",    icon: "💬" },
  { id: "performance",    name: "Performance",  icon: "📈" },
  { id: "recommender",    name: "Gym Finder",   icon: "🗺️" },
  { id: "analytics",      name: "Analytics",    icon: "📊" },
];

const descriptions = [
  "Personalised training",
  "Smart meal guidance",
  "Connected equipment",
  "Build daily consistency",
  "Talk to your AI coach",
  "Track your performance",
  "Find your ideal gym",
  "Insights & trends",
];

function Home({ onSelectModule }) {
  const stats = [
    ["Workouts",    "3 / 5",   "this week"],
    ["Active time", "42 min",  "today"],
    ["Streak",      "12 days", "personal best"],
    ["Next goal",   "100 kg",  "back squat"],
  ];

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <section className="welcome">
        <div>
          <span className="eyebrow">YOUR PERSONAL FITNESS COACH</span>
          <h1>
            Train smarter.<br />
            <em>Feel stronger.</em>
          </h1>
          <p>
            Your AI-powered fitness companion for workouts, nutrition, habits and
            measurable progress.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => onSelectModule("gym-trainer")}>
              Start workout <span>→</span>
            </button>
            <button className="ghost-btn" onClick={() => onSelectModule("performance")}>
              View progress
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-ring">
            <span>72<small>%</small></span>
            <label>FITNESS SCORE</label>
          </div>
          <div className="floating-card top">
            <strong>+18%</strong>
            <span>Strength this month</span>
          </div>
          <div className="floating-card bottom">
            <span className="pulse-dot" />
            AI coach is ready
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        {stats.map(([label, value, note]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>

      {/* Module grid */}
      <section className="section-head">
        <div>
          <span className="eyebrow">EXPLORE</span>
          <h2>Your fitness toolkit</h2>
        </div>
        <span className="section-note">8 intelligent tools</span>
      </section>
      <section className="module-grid">
        {modules.map((module, index) => (
          <button
            key={module.id}
            className={`module-card module-${index + 1}`}
            onClick={() => onSelectModule(module.id)}
          >
            <span className="module-icon">{module.icon}</span>
            <span className="module-copy">
              <strong>{module.name}</strong>
              <small>{descriptions[index]}</small>
            </span>
            <span className="arrow">↗</span>
          </button>
        ))}
      </section>

      {/* Coach banner */}
      <section className="coach-banner">
        <div>
          <span className="eyebrow">AI COACH</span>
          <h2>Need a little motivation?</h2>
          <p>Ask your AI companion about today's workout, recovery or nutrition.</p>
        </div>
        <button className="primary-btn" onClick={() => onSelectModule("chat-companion")}>
          Chat with coach →
        </button>
      </section>
    </div>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState("home");
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [sidebarPosition, setSidebarPosition] = useState("left");

  const moduleMap = {
    "gym-trainer":    <GymTrainer />,
    "diet-coach":     <DietCoach />,
    "smart-gym":      <SmartGym />,
    "habit-tracker":  <HabitTracker />,
    "chat-companion": <ChatCompanion />,
    performance:      <PerformanceScore />,
    recommender:      <GymRecommender />,
    analytics:        <Analytics />,
  };

  const activeModuleName =
    activeModule === "home"
      ? "Dashboard"
      : modules.find((m) => m.id === activeModule)?.name ?? "Module";

  const content = moduleMap[activeModule];

  return (
    <div className={`app-shell ${sidebarPosition === "right" ? "app-shell-right" : ""}`}>
      <Sidebar
        isOpen={sidebarOpen}
        position={sidebarPosition}
        modules={modules}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />
      <div className="app-main">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTogglePanelPosition={() =>
            setSidebarPosition((current) => (current === "left" ? "right" : "left"))
          }
          activeModuleName={activeModuleName}
        />
        <main className="content-area">
          {content ? (
            <div className="module-view">{content}</div>
          ) : (
            <Home onSelectModule={setActiveModule} />
          )}
        </main>
      </div>
    </div>
  );
}
