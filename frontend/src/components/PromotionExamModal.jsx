// src/components/PromotionExamModal.jsx
import { useState, useEffect } from 'react';
import { playSetCompleteSound, playVictoryFanfareSound } from '../utils/soundEffects';

export default function PromotionExamModal({ isOpen, currentStats, onClose, onPromoteHunter }) {
  if (!isOpen) return null;

  // 1. Stage tracker: 1 = Pushups, 2 = Plank, 3 = Cardio, 4 = Ceremony
  const [stage, setStage] = useState(1);

  // 2. Performance Inputs
  const [pushupReps, setPushupReps] = useState(25);
  const [plankSeconds, setPlankSeconds] = useState(45);
  const [isPlankRunning, setIsPlankRunning] = useState(false);
  const [cardioLevel, setCardioLevel] = useState('moderate');

  // 3. Dual-Mode Toggle: Sensor/Manual vs AI Camera Vision (Phase 7 Preview)
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'camera_preview'

  // 4. Live Plank Stopwatch
  useEffect(() => {
    let interval = null;
    if (isPlankRunning) {
      interval = setInterval(() => {
        setPlankSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlankRunning]);

  // Recalibration Algorithm for D-Rank
  function computeUpgradedStats() {
    const upgraded = { ...currentStats };
    
    // STR upgrade based on Push-ups
    const reps = Number(pushupReps);
    if (reps >= 35) upgraded.strength = Math.max(upgraded.strength, 22);
    else if (reps >= 25) upgraded.strength = Math.max(upgraded.strength, 19);
    else if (reps >= 15) upgraded.strength = Math.max(upgraded.strength, 16);
    else upgraded.strength = Math.max(upgraded.strength, 13);

    // VIT upgrade based on Plank hold
    const plank = Number(plankSeconds);
    if (plank >= 90) upgraded.vitality = Math.max(upgraded.vitality, 20);
    else if (plank >= 60) upgraded.vitality = Math.max(upgraded.vitality, 17);
    else if (plank >= 30) upgraded.vitality = Math.max(upgraded.vitality, 14);
    else upgraded.vitality = Math.max(upgraded.vitality, 12);

    // AGI upgrade based on Cardio
    const agiMap = { sedentary: 12, moderate: 16, runner: 20, athlete: 24 };
    upgraded.agility = Math.max(upgraded.agility, agiMap[cardioLevel] || 15);

    // Perception & Intelligence passive growth from mental discipline
    upgraded.perception = Math.max(upgraded.perception, upgraded.perception + 2);
    upgraded.intelligence = Math.max(upgraded.intelligence, upgraded.intelligence + 2);

    return upgraded;
  }

  const [finalStats, setFinalStats] = useState(null);

  function handleNextStage() {
    playSetCompleteSound();
    setStage(prev => prev + 1);
  }

  function handleFinishTrials() {
    const upgraded = computeUpgradedStats();
    setFinalStats(upgraded);
    setStage(4); // Move to Rank Breakthrough Ceremony!
    playVictoryFanfareSound();
  }

  function handleClaimBreakthrough() {
    if (finalStats) {
      onPromoteHunter({
        newRank: 'D',
        newStats: finalStats,
        benchmarks: { pushupReps, plankSeconds, cardioLevel }
      });
    }
  }

  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal-window">
        {/* Header */}
        <div className="exam-modal-header">
          <div className="exam-bureau-tag">HUNTER ASSOCIATION // OFFICIAL PROMOTION EXAM</div>
          <h2>D-Rank Rank Advancement Dungeon</h2>

          {stage <= 3 && (
            <div className="exam-step-indicator">
              <span className={`step-dot ${stage === 1 ? 'active' : stage > 1 ? 'done' : ''}`}>1. PUSH-UP MAX</span>
              <span className={`step-dot ${stage === 2 ? 'active' : stage > 2 ? 'done' : ''}`}>2. CORE PLANK</span>
              <span className={`step-dot ${stage === 3 ? 'active' : ''}`}>3. CARDIO AGILITY</span>
            </div>
          )}
        </div>

        {/* ================= TRIAL 1: PUSH-UP MAX ================= */}
        {stage === 1 && (
          <div className="exam-stage-card">
            <div className="trial-mode-switch">
              <button 
                className={`mode-switch-btn ${inputMode === 'manual' ? 'active' : ''}`}
                onClick={() => setInputMode('manual')}
              >
                📝 Sensor / Manual Log
              </button>
              <button 
                className={`mode-switch-btn ${inputMode === 'camera_preview' ? 'active' : ''}`}
                onClick={() => setInputMode('camera_preview')}
              >
                📷 AI Camera Vision (Phase 7 Preview)
              </button>
            </div>

            {inputMode === 'manual' ? (
              <div className="trial-content-body">
                <h3>Trial 1: Upper-Body Maximum Output</h3>
                <p>Perform as many continuous standard push-ups as possible until muscular failure.</p>
                
                <div className="reps-input-box">
                  <label>RECORD COMPLETED REPETITIONS</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={pushupReps}
                    onChange={(e) => setPushupReps(e.target.value)}
                    className="exam-num-input"
                  />
                  <span className="reps-benchmark-hint">
                    {pushupReps < 15 ? 'Target: At least 15 reps recommended for D-Rank' : '✓ D-Rank Benchmark Satisfied!'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="camera-preview-placeholder">
                <div className="cam-radar-scan">
                  <div className="cam-scan-line"></div>
                  <span className="cam-status">AI POSE ESTIMATION MODULE LOADED</span>
                </div>
                <p>Camera Pose Estimation is queued for <strong>Phase 7 (MediaPipe / WebGL)</strong>.</p>
                <div className="reps-input-box">
                  <label>MANUAL BACKUP REPS</label>
                  <input
                    type="number"
                    value={pushupReps}
                    onChange={(e) => setPushupReps(e.target.value)}
                    className="exam-num-input"
                  />
                </div>
              </div>
            )}

            <button className="exam-next-btn" onClick={handleNextStage}>
              Proceed to Trial 2 (Core Stability) →
            </button>
          </div>
        )}

        {/* ================= TRIAL 2: PLANK HOLD STOPWATCH ================= */}
        {stage === 2 && (
          <div className="exam-stage-card">
            <h3>Trial 2: Core Stability & Willpower</h3>
            <p>Assume a rigid forearm plank position. Start the live stopwatch to time your endurance.</p>
            
            <div className="plank-timer-dock">
              <div className="plank-digits">
                {Math.floor(plankSeconds / 60)}:{String(plankSeconds % 60).padStart(2, '0')}
              </div>
              <div className="timer-controls">
                <button 
                  className={`timer-toggle-btn ${isPlankRunning ? 'stop' : 'start'}`}
                  onClick={() => setIsPlankRunning(!isPlankRunning)}
                >
                  {isPlankRunning ? '⏸️ Stop Timer' : '▶️ Start Live Plank Timer'}
                </button>
                <button 
                  className="timer-reset-btn"
                  onClick={() => { setIsPlankRunning(false); setPlankSeconds(0); }}
                >
                  Reset
                </button>
              </div>
            </div>

            <button className="exam-next-btn" onClick={handleNextStage}>
              Proceed to Trial 3 (Cardio Stamina) →
            </button>
          </div>
        )}

        {/* ================= TRIAL 3: CARDIO & RECOVERY ================= */}
        {stage === 3 && (
          <div className="exam-stage-card">
            <h3>Trial 3: Cardiovascular Endurance</h3>
            <p>Select your current continuous running / aerobic stamina benchmark:</p>
            
            <div className="cardio-selection-list">
              {[
                { id: 'sedentary', label: '1km Light Jog / Walking', sub: 'Tires quickly, takes time to recover' },
                { id: 'moderate', label: '2km - 3km Steady Running', sub: 'Solid cardiovascular base and breathing control' },
                { id: 'runner', label: '5km Continuous Distance Run', sub: 'Strong stamina, capable of long skirmishes' },
                { id: 'athlete', label: '10km+ Long Distance or High-Intensity HIIT', sub: 'Superior athletic engine' }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`cardio-choice-box ${cardioLevel === opt.id ? 'active' : ''}`}
                  onClick={() => setCardioLevel(opt.id)}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.sub}</span>
                </div>
              ))}
            </div>

            <button className="exam-finish-btn" onClick={handleFinishTrials}>
              SUBMIT PHYSICAL BENCHMARKS TO BUREAU ⚔️
            </button>
          </div>
        )}

        {/* ================= STAGE 4: RANK BREAKTHROUGH CEREMONY ================= */}
        {stage === 4 && finalStats && (
          <div className="ceremony-card">
            <div className="ceremony-badge">⚡ HUNTER PROMOTION CONFIRMED</div>
            <h2 className="ceremony-title">RANK ADVANCEMENT BREAKTHROUGH!</h2>
            <p className="ceremony-subtitle">
              The Hunter Association officially registers your physical evolution.
            </p>

            <div className="rank-evolution-banner">
              <span className="old-rank">E-RANK</span>
              <span className="rank-arrow">➔</span>
              <span className="new-rank">D-RANK HUNTER</span>
            </div>

            {/* Stat Recalibration Matrix */}
            <div className="stat-matrix-header">RECALIBRATED ATTRIBUTE MATRIX</div>
            <div className="stat-growth-grid">
              {[
                { label: 'STR', oldVal: currentStats.strength, newVal: finalStats.strength },
                { label: 'AGI', oldVal: currentStats.agility, newVal: finalStats.agility },
                { label: 'VIT', oldVal: currentStats.vitality, newVal: finalStats.vitality },
                { label: 'INT', oldVal: currentStats.intelligence, newVal: finalStats.intelligence },
                { label: 'PER', oldVal: currentStats.perception, newVal: finalStats.perception },
              ].map(st => (
                <div key={st.label} className="stat-growth-card">
                  <span className="stat-name">{st.label}</span>
                  <div className="stat-values">
                    <span className="old-val">{st.oldVal}</span>
                    <span className="arrow">➔</span>
                    <strong className="new-val">{st.newVal}</strong>
                  </div>
                  <span className="gain-tag">+{st.newVal - st.oldVal}</span>
                </div>
              ))}
            </div>

            {/* Progressive Overload Callout */}
            <div className="plan-upgrade-callout">
              <span className="callout-icon">⚔️</span>
              <div>
                <strong>SYSTEM DIRECTIVE OVERHAULED:</strong>
                <p>Your active training routine has been upgraded to <strong>[TIER II: D-RANK INTENSITY]</strong> (+1 Set to compound lifts & progressive rep overload)!</p>
              </div>
            </div>

            <button className="claim-rank-btn" onClick={handleClaimBreakthrough}>
              ACCEPT D-RANK LICENSE & ASCEND ⚔️
            </button>
          </div>
        )}

        {stage < 4 && (
          <button className="exam-exit-text-btn" onClick={onClose}>
            Abort Exam & Return
          </button>
        )}
      </div>
    </div>
  );
}
