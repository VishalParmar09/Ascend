// src/components/EvaluationTab.jsx

export default function EvaluationTab({ level, hunterRank, onChallengeExam, onDevSetLevel }) {
  // 1. Progression milestones strictly mapped to the Hunter's current official Rank
  const rankProgression = {
    E: { targetRank: 'D-Rank', requiredLevel: 10 },
    D: { targetRank: 'C-Rank', requiredLevel: 25 },
    C: { targetRank: 'B-Rank', requiredLevel: 50 },
    B: { targetRank: 'A-Rank', requiredLevel: 75 },
    A: { targetRank: 'S-Rank', requiredLevel: 90 },
  };

  const currentRankKey = hunterRank?.rank || 'E';
  const milestone = rankProgression[currentRankKey] || rankProgression.E;

  const nextExamLevel = milestone.requiredLevel;
  const targetRank = milestone.targetRank;

  // 2. Eligibility check: Gate is unlocked if current level >= required level for target rank
  const isEligible = level >= nextExamLevel;

  // Progress percentage toward the exam gate
  const progressPercent = Math.min(100, Math.round((level / nextExamLevel) * 100));

  return (
    <section className="evaluation-panel">
      {/* Header with Bureau tag and current rank badge */}
      <div className="eval-header">
        <div>
          <span className="eval-tag">HUNTER ASSOCIATION // EVALUATION BUREAU</span>
          <h2>Rank Advancement Gate</h2>
        </div>
        <div 
          className="current-rank-pill" 
          style={{ color: hunterRank.color, borderColor: hunterRank.color }}
        >
          CURRENT: {hunterRank.rank}-RANK
        </div>
      </div>

      {/* Main Dungeon Gate Card */}
      <div className={`gate-card ${isEligible ? 'gate-unlocked-card' : ''}`}>
        <div className={`gate-status-badge ${isEligible ? 'unlocked' : 'locked'}`}>
          {isEligible ? '⚡ EXAM GATE UNLOCKED // ACCESS GRANTED' : '🔒 GATE SEALED // LEVEL REQUIREMENT NOT MET'}
        </div>

        <h3>Challenge the {targetRank} Promotion Dungeon</h3>
        <p>
          Rank evaluations are strictly regulated by the Hunter Association. To advance your rank and
          re-calibrate your core attributes, you must reach <strong>Level {nextExamLevel}</strong>.
        </p>

        {/* Progress Bar showing how close the hunter is to Level 10 */}
        <div className="exam-progress-bar">
          <div 
            className="exam-progress-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        <span className="exam-progress-text">{level} / {nextExamLevel} LEVELS REQUIRED ({progressPercent}%)</span>

        {/* Action Button: Disabled if level < nextExamLevel */}
        <button
          className={`challenge-btn ${isEligible ? 'unlocked' : 'locked'}`}
          disabled={!isEligible}
          onClick={onChallengeExam}
        >
          {isEligible 
            ? `INITIATE ${targetRank.toUpperCase()} PROMOTION EXAM ⚔️` 
            : `LOCKED UNTIL LEVEL ${nextExamLevel}`}
        </button>
      </div>

      {/* Developer Sandbox Controls (Helps you test level 10 without grind) */}
      {onDevSetLevel && (
        <div className="dev-test-box">
          <span>🛠️ DEV TEST CONTROLS:</span>
          <button 
            className="dev-level-btn"
            onClick={() => onDevSetLevel(level >= 10 ? 1 : 10)}
          >
            {level >= 10 ? '↩️ Revert to Level 1' : '⚡ Simulate Level 10 (Unlock Gate)'}
          </button>
        </div>
      )}
    </section>
  );
}