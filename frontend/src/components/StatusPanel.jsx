// src/components/StatusPanel.jsx

export default function StatusPanel({
  hunterRank,
  level,
  totalXP,
  currentXP,
  xpForNextLevel,
  remainingXP,
  progress,
  stats,
  onResetProgress
}) {
  const attributeList = [
    { key: 'strength', label: 'STR', name: 'Strength', val: stats.strength, color: '#f97316' },
    { key: 'agility', label: 'AGI', name: 'Agility', val: stats.agility, color: '#eab308' },
    { key: 'vitality', label: 'VIT', name: 'Vitality', val: stats.vitality, color: '#10b981' },
    { key: 'intelligence', label: 'INT', name: 'Intelligence', val: stats.intelligence, color: '#06b6d4' },
    { key: 'perception', label: 'PER', name: 'Perception', val: stats.perception, color: '#a855f7' },
  ];

  return (
    <section className="status-panel">
      <div className="panel-header">
        <h2>Hunter Status</h2>
        <span className="system-id">STATUS WINDOW // ACTIVE</span>
      </div>

      {/* 3 Top HUD Cards */}
      <div className="stats-grid">
        {/* Card 1: Current Rank */}
        <article
          className="stat-card"
          style={{
            borderColor: `${hunterRank.color}55`,
            boxShadow: `0 0 20px ${hunterRank.color}15`
          }}
        >
          <p className="stat-label">CURRENT RANK</p>
          <p
            className="stat-value"
            style={{
              color: hunterRank.color,
              textShadow: `0 0 16px ${hunterRank.glow}`
            }}
          >
            {hunterRank.rank}
          </p>
          <span
            className="rank-badge"
            style={{
              color: hunterRank.color,
              background: `${hunterRank.color}15`,
              border: `1px solid ${hunterRank.color}40`
            }}
          >
            {hunterRank.label}
          </span>
        </article>

        {/* Card 2: Current Level */}
        <article
          className="stat-card"
          style={{
            borderColor: '#38bdf840',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.08)'
          }}
        >
          <p className="stat-label">CURRENT LEVEL</p>
          <p
            className="stat-value"
            style={{
              color: '#38bdf8',
              textShadow: '0 0 16px rgba(56, 189, 248, 0.5)'
            }}
          >
            {level}
          </p>
          <span
            className="rank-badge"
            style={{
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            Hunter Level
          </span>
        </article>

        {/* Card 3: Total Experience */}
        <article
          className="stat-card"
          style={{
            borderColor: '#818cf840',
            boxShadow: '0 0 20px rgba(129, 140, 248, 0.08)'
          }}
        >
          <p className="stat-label">EXPERIENCE</p>
          <p
            className="stat-value"
            style={{
              color: '#818cf8',
              textShadow: '0 0 16px rgba(129, 140, 248, 0.5)'
            }}
          >
            {totalXP} <span>XP</span>
          </p>
          <span
            className="rank-badge"
            style={{
              color: '#818cf8',
              background: 'rgba(129, 140, 248, 0.1)',
              border: '1px solid rgba(129, 140, 248, 0.3)'
            }}
          >
            Total Experience
          </span>
        </article>
      </div>

      {/* Core Attributes Sheet */}
      <div className="attributes-section">
        <p className="attributes-heading">CORE ATTRIBUTES</p>
        <div className="attributes-grid">
          {attributeList.map(attr => (
            <div key={attr.key} className="attribute-card">
              <span className="attr-tag" style={{ color: attr.color }}>{attr.label}</span>
              <span className="attr-name">{attr.name}</span>
              <span className="attr-value">{attr.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* XP Progress Section */}
      <div className='xp-section'>
        <div className='xp-heading'>
          <p>LEVEL {level} PROGRESS</p>
          <p>{currentXP} / {xpForNextLevel} XP</p>
        </div>

        <div
          className="xp-track"
          role='progressbar'
          aria-label='Experience progress'
          aria-valuenow={currentXP}
          aria-valuemin={0}
          aria-valuemax={xpForNextLevel}
        >
          <div className='xp-fill' style={{ width: `${progress}%` }} />
        </div>

        <div className="xp-footer">
          <p className='xp-remaining'>
            {remainingXP} XP until Level {level + 1}
          </p>
          <button onClick={onResetProgress} className="discrete-reset-btn">
            Reset Data
          </button>
        </div>
      </div>
    </section>
  );
}