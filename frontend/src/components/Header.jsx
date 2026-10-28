export default function Header({ onToggleSidebar, onTogglePanelPosition, activeModuleName }) {
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" className="icon-btn mobile-menu" onClick={onToggleSidebar} style={{ fontSize: 18 }} aria-label="Toggle navigation">
          ☰
        </button>
        <button
          type="button"
          className="icon-btn panel-position-toggle"
          onClick={onTogglePanelPosition}
          title="Toggle panel position"
          aria-label="Toggle panel position"
        >
          ⇄
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <b>/</b>
          <strong>{activeModuleName}</strong>
        </div>
      </div>

      <div className="top-actions">
        <label className="search-box" htmlFor="global-search">
          <span style={{ opacity: 0.5, fontSize: 15 }} aria-hidden="true">⌕</span>
          <input id="global-search" name="globalSearch" type="search" placeholder="Search anything..." />
        </label>
        <button type="button" className="icon-btn" title="Notifications" aria-label="Notifications">
          <span style={{ fontSize: 14 }}>🔔</span>
        </button>
        <button type="button" className="user-button" aria-label="User menu">
          <span className="avatar small">TP</span>
          <span style={{ fontSize: 12 }}>Tanay</span>
          <span style={{ fontSize: 10, opacity: 0.5 }}>⌄</span>
        </button>
      </div>
    </header>
  );
}
