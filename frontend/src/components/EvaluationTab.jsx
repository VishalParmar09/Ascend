// src/components/EvaluationTab.jsx

export default function EvaluationTab({ level, hunterRank, onChallengeExam }) {
    // Promotion milestones
    const nextExamLevel = level < 10 ? 10 : level < 25 ? 25 : level < 50 ? 50 : 90;
    const targetRank = level < 10 ? 'D-Rank' : level < 25 ? 'C-Rank' : level < 50 ? 'B-Rank' : 'S-Rank';
    const isEligible = level >= nextExamLevel;

    return (
        <section className="evaluation-panel">
            <div className="eval-header">
                <div>
                    <span className="eval-tag">HUNTER ASSOCIATION // EVALUATION BUREAU</span>
                    <h2>Rank Advancement Gate</h2>
                </div>
                <div className="current-rank-pill" style={{ color: hunterRank.color, borderColor: hunterRank.color }}>
                    CURRENT: {hunterRank.rank}-RANK
                </div>
            </div>

            <div className="gate-card">
                <div className="gate-status-badge">
                    {isEligible ? '⚡ EXAM GATE UNLOCKED' : '🔒 GATE SEALED'}
                </div>

                <h3>Challenge the {targetRank} Promotion Dungeon</h3>
                <p>
                    Rank evaluations are strictly regulated by the Hunter Association. To advance your rank and
                    re-calibrate your core attributes, you must reach <strong>Level {nextExamLevel}</strong>.
                </p>

                <div className="exam-progress-bar">
                    <div className="exam-progress-fill" style={{ width: `${Math.min(100, (level / nextExamLevel) * 100)}%` }} />
                </div>
                <span className="exam-progress-text">{level} / {nextExamLevel} LEVELS REQUIRED</span>

                <button
                    className={`challenge-btn ${isEligible ? 'unlocked' : 'locked'}`}
                    disabled={!isEligible}
                    onClick={onChallengeExam}
                >
                    {isEligible ? `INITIATE ${targetRank.toUpperCase()} PROMOTION EXAM ⚔️` : `LOCKED UNTIL LEVEL ${nextExamLevel}`}
                </button>
            </div>
        </section>
    );
}