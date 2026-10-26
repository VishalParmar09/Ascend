// src/components/Header.jsx

export default function Header({ streak, activeTab, setActiveTab }) {
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
          <div className="system-pill">
            <span className="pulsing-dot"></span>
            ASCEND PROTOCOL // SYSTEM ONLINE
          </div>
          <h1 className="brand-title">THE SYSTEM</h1>
        </div>

        {/* Hunter Streak Counter */}
        <div id="tour-streak" className="streak-badge" title="Consecutive active days">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">{streak} DAY STREAK</span>
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