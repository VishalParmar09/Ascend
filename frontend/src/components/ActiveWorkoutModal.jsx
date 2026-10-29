// src/components/ActiveWorkoutModal.jsx
import { useState, useEffect, useRef } from 'react';
import { playSetCompleteSound, playRestTimerCompleteSound, playVictoryFanfareSound } from '../utils/soundEffects';

export default function ActiveWorkoutModal({
  isOpen,
  workout,
  onClose,
  onFinishSession
}) {
  if (!isOpen || !workout) return null;

  // 1. Elapsed Session Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // 2. Exercise & Sets State Initialization
  const [exerciseLogs, setExerciseLogs] = useState(() => {
    return (workout.exercises || []).map((ex, exIdx) => {
      const restSeconds = parseInt(ex.rest) || 60;
      const numSets = Number(ex.sets) || 3;
      return {
        id: exIdx,
        name: ex.name,
        stat: ex.stat || 'STR',
        restTime: restSeconds,
        targetReps: ex.reps || '10 - 12',
        sets: Array.from({ length: numSets }, (_, sIdx) => ({
          setNum: sIdx + 1,
          weight: '',
          reps: ex.reps ? ex.reps.split('-')[0].trim() : '10',
          done: false
        }))
      };
    });
  });

  // 3. Tactical Rest Timer State
  const [restTimer, setRestTimer] = useState({
    active: false,
    secondsRemaining: 0,
    totalSeconds: 60,
    exerciseName: ''
  });

  useEffect(() => {
    if (!restTimer.active || restTimer.secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev.secondsRemaining <= 1) {
          playRestTimerCompleteSound();
          return { ...prev, active: false, secondsRemaining: 0 };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.secondsRemaining]);

  function startRestTimer(seconds, exName) {
    setRestTimer({
      active: true,
      secondsRemaining: seconds,
      totalSeconds: seconds,
      exerciseName: exName
    });
  }

  function adjustRestTimer(delta) {
    setRestTimer(prev => {
      const nextRemaining = Math.max(0, prev.secondsRemaining + delta);
      const nextTotal = Math.max(nextRemaining, prev.totalSeconds + (delta > 0 ? delta : 0));
      return {
        ...prev,
        secondsRemaining: nextRemaining,
        totalSeconds: nextTotal,
        active: nextRemaining > 0
      };
    });
  }

  function skipRestTimer() {
    setRestTimer(prev => ({ ...prev, active: false, secondsRemaining: 0 }));
  }

  // 4. Set Interaction Handlers (Pure & Immutable)
  function toggleSetDone(exIdx, setIdx) {
    const currentDone = exerciseLogs[exIdx]?.sets[setIdx]?.done;
    const nextDone = !currentDone;

    setExerciseLogs(prevLogs =>
      prevLogs.map((ex, eI) => {
        if (eI !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, sI) => {
            if (sI !== setIdx) return s;
            return { ...s, done: nextDone };
          })
        };
      })
    );

    if (nextDone) {
      playSetCompleteSound();
      startRestTimer(exerciseLogs[exIdx].restTime, exerciseLogs[exIdx].name);
    }
  }

  function updateSetField(exIdx, setIdx, field, value) {
    setExerciseLogs(prevLogs =>
      prevLogs.map((ex, eI) => {
        if (eI !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, sI) => {
            if (sI !== setIdx) return s;
            return { ...s, [field]: value };
          })
        };
      })
    );
  }

  function addSetToExercise(exIdx) {
    setExerciseLogs(prevLogs =>
      prevLogs.map((ex, eI) => {
        if (eI !== exIdx) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNum: ex.sets.length + 1,
              weight: lastSet ? lastSet.weight : '',
              reps: lastSet ? lastSet.reps : '10',
              done: false
            }
          ]
        };
      })
    );
  }

  // 5. Completion & Victory State
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [calculatedSummary, setCalculatedSummary] = useState(null);

  function handleTriggerFinish() {
    const totalSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = exerciseLogs.reduce(
      (acc, ex) => acc + ex.sets.filter(s => s.done).length,
      0
    );

    const summary = {
      workoutName: workout.dayName,
      durationSeconds: elapsedSeconds,
      completedSets,
      totalSets,
      xpGained: 100,
      exercises: exerciseLogs.map(ex => ({
        name: ex.name,
        stat: ex.stat,
        completedSets: ex.sets.filter(s => s.done).length,
        totalSets: ex.sets.length
      }))
    };

    setCalculatedSummary(summary);
    setShowVictoryModal(true);
    playVictoryFanfareSound();
  }

  function handleConfirmClaim() {
    if (calculatedSummary) {
      onFinishSession(calculatedSummary);
    }
  }

  function handleDiscard() {
    if (window.confirm("Discard current workout session? Unsaved progress will be lost.")) {
      onClose();
    }
  }

  // Calculate overall session progress percentage
  const totalSetsCount = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSetsCount = exerciseLogs.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.done).length,
    0
  );
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  return (
    <div className="active-workout-overlay">
      <div className="active-workout-window">
        {/* Top Header Bar */}
        <header className="active-workout-header">
          <div className="header-left">
            <span className="live-pulse-badge">
              <span className="pulse-dot"></span> LIVE DUNGEON RUN
            </span>
            <h3 className="workout-active-title">{workout.dayName}</h3>
          </div>

          <div className="header-center">
            <div className="stopwatch-display">
              <span className="stopwatch-label">ELAPSED TIME</span>
              <strong className="stopwatch-digits">{formatTime(elapsedSeconds)}</strong>
            </div>
          </div>

          <div className="header-right">
            <button className="discard-session-btn" onClick={handleDiscard}>
              Discard
            </button>
            <button className="finish-workout-btn" onClick={handleTriggerFinish}>
              FINISH WORKOUT 🏆
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="workout-progress-bar-track">
          <div
            className="workout-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
          <span className="progress-bar-label">
            {completedSetsCount} / {totalSetsCount} Sets Completed ({progressPercent}%)
          </span>
        </div>

        {/* Main Workout Exercises List */}
        <div className="active-exercises-scroll">
          {exerciseLogs.map((ex, exIdx) => (
            <div key={ex.id} className="active-exercise-card">
              <div className="active-exercise-header">
                <div>
                  <h4 className="active-ex-name">{ex.name}</h4>
                  <div className="active-ex-meta">
                    <span className="ex-stat-tag">Attribute: <strong>+{ex.stat}</strong></span>
                    <span className="ex-target-tag">Target: {ex.targetReps} reps</span>
                    <span className="ex-rest-tag">Rest: {ex.restTime}s</span>
                  </div>
                </div>

                <button
                  className="add-set-pill-btn"
                  onClick={() => addSetToExercise(exIdx)}
                  title="Add an extra set to this exercise"
                >
                  + Add Set
                </button>
              </div>

              {/* Set-by-Set Logging Table */}
              <div className="sets-table">
                <div className="sets-table-header">
                  <span className="col-set">SET</span>
                  <span className="col-prev">TARGET</span>
                  <span className="col-weight">KG / LBS</span>
                  <span className="col-reps">REPS</span>
                  <span className="col-check">CHECK</span>
                </div>

                {ex.sets.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className={`set-row ${s.done ? 'set-completed' : ''}`}
                  >
                    <span className="col-set set-num-badge">{s.setNum}</span>
                    <span className="col-prev target-text">{ex.targetReps}</span>
                    
                    <div className="col-weight input-container">
                      <input
                        type="number"
                        placeholder="0"
                        className="set-input weight-input"
                        value={s.weight}
                        onChange={(e) => updateSetField(exIdx, sIdx, 'weight', e.target.value)}
                      />
                    </div>

                    <div className="col-reps input-container">
                      <input
                        type="number"
                        placeholder="10"
                        className="set-input reps-input"
                        value={s.reps}
                        onChange={(e) => updateSetField(exIdx, sIdx, 'reps', e.target.value)}
                      />
                    </div>

                    <div className="col-check">
                      <button
                        className={`set-check-btn ${s.done ? 'checked' : ''}`}
                        onClick={() => toggleSetDone(exIdx, sIdx)}
                        title={s.done ? 'Mark set incomplete' : 'Mark set complete'}
                      >
                        {s.done ? '✓' : '○'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Tactical Rest Timer HUD */}
        {restTimer.active && (
          <div className="tactical-rest-dock">
            <div className="rest-dock-left">
              <span className="rest-pulsing-icon">⏳</span>
              <div>
                <span className="rest-dock-tag">TACTICAL RECOVERY // {restTimer.exerciseName}</span>
                <strong className="rest-dock-digits">{formatTime(restTimer.secondsRemaining)}</strong>
              </div>
            </div>

            <div className="rest-dock-controls">
              <button className="rest-adjust-btn" onClick={() => adjustRestTimer(-15)}>-15s</button>
              <button className="rest-adjust-btn" onClick={() => adjustRestTimer(30)}>+30s</button>
              <button className="rest-skip-btn" onClick={skipRestTimer}>Skip Rest ⏭️</button>
            </div>
          </div>
        )}

        {/* ================= VICTORY / DUNGEON CLEARED MODAL ================= */}
        {showVictoryModal && calculatedSummary && (
          <div className="victory-modal-overlay">
            <div className="victory-modal-card">
              <div className="victory-banner-tag">
                ⚔️ SYSTEM ANNOUNCEMENT // DUNGEON CLEARED
              </div>

              <h2 className="victory-title">WORKOUT DIRECTIVE COMPLETED!</h2>
              <p className="victory-subtitle">The System acknowledges your physical exertion and discipline.</p>

              <div className="victory-metrics-grid">
                <div className="v-metric-card">
                  <span className="v-metric-label">TIME ELAPSED</span>
                  <strong className="v-metric-val">{formatTime(calculatedSummary.durationSeconds)}</strong>
                </div>

                <div className="v-metric-card">
                  <span className="v-metric-label">SETS CLEARED</span>
                  <strong className="v-metric-val">
                    {calculatedSummary.completedSets} / {calculatedSummary.totalSets}
                  </strong>
                </div>

                <div className="v-metric-card xp-highlight">
                  <span className="v-metric-label">HUNTER EXP</span>
                  <strong className="v-metric-val">+{calculatedSummary.xpGained} XP</strong>
                </div>

                <div className="v-metric-card quest-highlight">
                  <span className="v-metric-label">DAILY QUEST</span>
                  <strong className="v-metric-val">CLEARED ✓</strong>
                </div>
              </div>

              <div className="stat-growth-callout">
                <span>⚡ Physical exertion logged. <strong>+100 EXP</strong> harvested toward Hunter Level advancement and the Level 10 Rank Evaluation Gate!</span>
              </div>

              <button className="claim-victory-btn" onClick={handleConfirmClaim}>
                CLAIM REWARDS & RETURN TO BASE ⚔️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
