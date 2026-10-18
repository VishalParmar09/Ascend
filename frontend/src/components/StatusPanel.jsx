export default function StatusPanel({
    hunterRank,
    level,
    totalXP,
    currentXP,
    xpForNextLevel,
    remainingXP,
    progress,
    onEarnXP,
    onResetProgress
}) {
    return (
        <section className="status-panel">
            <h2>Hunter Status</h2>

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

                <p className='xp-remaining'>
                    {remainingXP} XP until Level {level + 1}
                </p>

                <div className="xp-actions">
                    <button onClick={onEarnXP}>
                        Earn 50 XP
                    </button>

                    <button onClick={onResetProgress} className="reset-btn">
                        Reset Progress
                    </button>
                </div>
            </div>
        </section>
    );
}