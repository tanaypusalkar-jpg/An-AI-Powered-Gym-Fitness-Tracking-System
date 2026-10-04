import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GymTrainer from './pages/modules/GymTrainer';
import DietCoach from './pages/modules/DietCoach';
import SmartGym from './pages/modules/SmartGym';
import HabitTracker from './pages/modules/HabitTracker';
import ChatCompanion from './pages/modules/ChatCompanion';
import PerformanceScore from './pages/modules/PerformanceScore';
import GymRecommender from './pages/modules/GymRecommender';
import Analytics from './pages/modules/Analytics';
import './styles/globals.css';

export default function App() {
  const [activeModule, setActiveModule] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    { id: 'gym-trainer', name: 'Gym Trainer', icon: '🏋️', color: 'from-cyan-500 to-blue-500' },
    { id: 'diet-coach', name: 'Diet Coach', icon: '🥗', color: 'from-green-500 to-emerald-500' },
    { id: 'smart-gym', name: 'Smart Gym', icon: '⚙️', color: 'from-purple-500 to-pink-500' },
    { id: 'habit-tracker', name: 'Habit Tracker', icon: '📊', color: 'from-orange-500 to-red-500' },
    { id: 'chat-companion', name: 'Gym Buddy Chat', icon: '💬', color: 'from-blue-500 to-cyan-500' },
    { id: 'performance', name: 'Performance', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { id: 'recommender', name: 'Gym Recommender', icon: '🎯', color: 'from-pink-500 to-rose-500' },
    { id: 'analytics', name: 'Analytics', icon: '📈', color: 'from-indigo-500 to-purple-500' },
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'gym-trainer': return <GymTrainer />;
      case 'diet-coach': return <DietCoach />;
      case 'smart-gym': return <SmartGym />;
      case 'habit-tracker': return <HabitTracker />;
      case 'chat-companion': return <ChatCompanion />;
      case 'performance': return <PerformanceScore />;
      case 'recommender': return <GymRecommender />;
      case 'analytics': return <Analytics />;
      default: return <Home modules={modules} onSelectModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        modules={modules}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeModuleName={activeModule === 'home' ? 'Dashboard' : modules.find(m => m.id === activeModule)?.name || 'Module'}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}

// Home Dashboard Component
function Home({ modules, onSelectModule }) {
  return (
    <div className="p-8 space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Gym & Fitness Assistant
        </h1>
        <p className="text-slate-300 text-lg">
          Your unified AI-powered fitness ecosystem — trainer, dietician, motivator, and manager.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Workouts', value: '3/5', icon: '🏋️' },
          { label: 'Streak', value: '12 days', icon: '🔥' },
          { label: 'Cal Burned', value: '2,450', icon: '🔥' },
          { label: 'Next Goal', value: 'Squat 100kg', icon: '🎯' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-700 hover:border-cyan-500/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold group-hover:text-cyan-400 transition-colors">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className="group relative overflow-hidden rounded-xl p-6 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20 text-left"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

              {/* Content */}
              <div className="relative z-10">
                <span className="text-4xl block mb-3">{module.icon}</span>
                <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">{module.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}