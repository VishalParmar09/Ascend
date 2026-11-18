// src/components/Header.jsx

export default function Header({
  streak,
  activeTab,
  setActiveTab,
  isBackendConnected,
  currentHunter,
  hunterRank,
  onLogout
}) {
  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'training', label: 'TRAINING PLAN' },
    { id: 'evaluation', label: 'EVALUATION' },
    { id: 'leaderboard', label: 'LEADERBOARD' },
  ];

  return (
    <header className="app-navbar">
      {/* Brand & System Status */}
      <div className="navbar-top">
        <div className="brand-group">
          <div className={`system-pill ${isBackendConnected ? 'connected' : 'offline'}`}>
            <span className="pulsing-dot"></span>
            {isBackendConnected
              ? 'GATEWAY LINK // ONLINE (NEON POSTGRES)'
              : 'GATEWAY LINK // LOCAL FALLBACK'}
          </div>
          <h1 className="brand-title">THE SYSTEM</h1>
        </div>

        {/* User Identity & Controls Dock */}
        <div className="header-user-dock">
          {/* Hunter Streak Counter */}
          <div id="tour-streak" className="streak-badge" title="Consecutive active days">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">{streak} DAY STREAK</span>
          </div>

          {/* Current Hunter License Tag */}
          {currentHunter && (
            <div className="hunter-profile-pill">
              <span
                className="hunter-rank-tag"
                style={{ color: hunterRank?.color || '#38bdf8' }}
              >
                [{hunterRank?.rank || 'E'}-RANK]
              </span>
              <span className="hunter-codename">{currentHunter}</span>
            </div>
          )}

          {/* Switch / Logout Action */}
          {onLogout && (
            <button
              type="button"
              className="hunter-logout-btn"
              title="Logout or switch to another Hunter profile"
              onClick={onLogout}
            >
              LOGOUT ⏻
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={tab.id === 'evaluation' ? 'tour-eval-tab' : undefined}
            className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
