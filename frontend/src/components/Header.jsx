export default function Header({ onToggleSidebar, activeModuleName }) {
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="icon-btn mobile-menu" onClick={onToggleSidebar} style={{ fontSize: 18 }}>
          ☰
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <b>/</b>
          <strong>{activeModuleName}</strong>
        </div>
      </div>

      <div className="top-actions">
        <label className="search-box">
          <span style={{ opacity: 0.5, fontSize: 15 }}>⌕</span>
          <input placeholder="Search anything..." />
        </label>
        <button className="icon-btn" title="Notifications">
          <span style={{ fontSize: 14 }}>🔔</span>
        </button>
        <button className="user-button">
          <span className="avatar small">TP</span>
          <span style={{ fontSize: 12 }}>Tanay</span>
          <span style={{ fontSize: 10, opacity: 0.5 }}>⌄</span>
        </button>
      </div>
    </header>
  );
}
