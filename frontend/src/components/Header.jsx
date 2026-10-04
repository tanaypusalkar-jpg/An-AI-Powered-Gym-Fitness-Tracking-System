// File: frontend/src/components/Header.jsx
export default function Header({ sidebarOpen, onToggleSidebar, activeModuleName }) {
  return (
    <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <p className="text-sm text-slate-400">Current Module</p>
            <p className="font-semibold text-slate-100">{activeModuleName}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600 focus-within:border-cyan-500/50">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search modules..."
              className="bg-transparent text-sm placeholder-slate-400 outline-none w-40"
            />
          </div>

          {/* Notification */}
          <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
            <span className="hidden md:block text-sm font-medium">You</span>
          </button>
        </div>
      </div>
    </header>
  );
}