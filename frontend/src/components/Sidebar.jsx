// File: frontend/src/components/Sidebar.jsx
export default function Sidebar({ isOpen, modules, activeModule, onSelectModule }) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col h-screen overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isOpen ? 'AI GYM' : '🏋️'}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Home Button */}
          <button
            onClick={() => onSelectModule('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeModule === 'home'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-400'
                : 'hover:bg-slate-700/50 text-slate-300'
            }`}
          >
            <span className="text-xl">🏠</span>
            {isOpen && <span className="font-medium">Dashboard</span>}
          </button>

          {/* Divider */}
          {isOpen && <div className="my-4 border-t border-slate-700"></div>}

          {/* Module Items */}
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === module.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-400'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100'
              }`}
              title={module.name}
            >
              <span className="text-xl">{module.icon}</span>
              {isOpen && <span className="font-medium text-sm">{module.name}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200" title="Settings">
            <span className="text-xl">⚙️</span>
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200" title="Help">
            <span className="text-xl">❓</span>
            {isOpen && <span className="text-sm font-medium">Help</span>}
          </button>
        </div>
      </aside>
    </>
  );
}