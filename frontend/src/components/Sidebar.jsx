export default function Sidebar({ isOpen, modules, activeModule, onSelectModule }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Brand */}
      <div className="brand">
        <span className="brand-mark">A</span>
        {isOpen && (
          <div>
            <strong>AI GYM</strong>
            <small>FITNESS COACH</small>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeModule === "home" ? "active" : ""}`}
          onClick={() => onSelectModule("home")}
        >
          <span className="nav-icon">⌂</span>
          {isOpen && "Overview"}
        </button>

        {isOpen && <div className="nav-label">Coaching</div>}
        {modules.slice(0, 5).map((m) => (
          <button
            key={m.id}
            className={`nav-item ${activeModule === m.id ? "active" : ""}`}
            onClick={() => onSelectModule(m.id)}
          >
            <span className="nav-icon">{m.icon}</span>
            {isOpen && m.name}
          </button>
        ))}

        {isOpen && <div className="nav-label">Insights</div>}
        {modules.slice(5).map((m) => (
          <button
            key={m.id}
            className={`nav-item ${activeModule === m.id ? "active" : ""}`}
            onClick={() => onSelectModule(m.id)}
          >
            <span className="nav-icon">{m.icon}</span>
            {isOpen && m.name}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="nav-item">
          <span className="nav-icon">⚙</span>
          {isOpen && "Settings"}
        </button>
        <div className="profile-chip">
          <div className="avatar">TP</div>
          {isOpen && (
            <div>
              <strong>Tanay</strong>
              <small>Personal plan</small>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
