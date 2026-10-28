// src/components/TrainingPlanTab.jsx
import { useState, useEffect } from 'react';
import { generateWorkoutPlan } from '../utils/trainingPlanGenerator';

export default function TrainingPlanTab({
    activePlan,
    setActivePlan,
    currentDayIndex,
    setCurrentDayIndex,
    isWorkoutCompletedToday,
    onCompleteWorkout
}) {
    // If user has no plan, default to 'select' wizard screen!
    const [viewMode, setViewMode] = useState(activePlan ? 'view' : 'select');

    // Generator Form State (Days committed + Equipment)
    const [genDays, setGenDays] = useState(4); // 3, 4, 5, 6
    const [genEquip, setGenEquip] = useState('gym'); // 'gym', 'dumbbell', 'bodyweight'

    // Custom Builder Form State
    const [customName, setCustomName] = useState('My Custom Split');
    const [customDays, setCustomDays] = useState([
        {
            dayName: 'Day 1: Upper Body Focus',
            muscleGroup: 'Upper',
            exercises: [
                { name: 'Bench Press', sets: 4, reps: '8 - 10', rest: '90s', stat: 'STR' },
                { name: 'Pull-ups', sets: 4, reps: '8 - 10', rest: '90s', stat: 'STR' }
            ]
        },
        {
            dayName: 'Day 2: Lower Body Focus',
            muscleGroup: 'Lower',
            exercises: [
                { name: 'Squats', sets: 4, reps: '8 - 10', rest: '90s', stat: 'VIT' },
                { name: 'Calf Raises', sets: 4, reps: '15 - 20', rest: '45s', stat: 'VIT' }
            ]
        }
    ]);

    const [selectedDayView, setSelectedDayView] = useState(currentDayIndex || 0);
    const [checkedExercises, setCheckedExercises] = useState({});

    // Synchronize selected day view with currentDayIndex when active day changes
    useEffect(() => {
        if (currentDayIndex !== undefined && currentDayIndex !== null) {
            setSelectedDayView(currentDayIndex);
        }
    }, [currentDayIndex]);

    function handleGenerateSubmit() {
        const plan = generateWorkoutPlan(genDays, genEquip);
        setActivePlan(plan);
        if (setCurrentDayIndex) setCurrentDayIndex(0);
        setViewMode('view');
        setSelectedDayView(0);
    }

    function handleCustomSubmit() {
        if (!customName.trim()) return;
        const plan = {
            id: 'custom-' + Date.now(),
            name: customName,
            type: 'custom',
            schedule: customDays
        };
        setActivePlan(plan);
        if (setCurrentDayIndex) setCurrentDayIndex(0);
        setViewMode('view');
        setSelectedDayView(0);
    }

    function addCustomDay() {
        setCustomDays([
            ...customDays,
            {
                dayName: `Day ${customDays.length + 1}: Custom Focus`,
                muscleGroup: 'General',
                exercises: [{ name: 'Exercise 1', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' }]
            }
        ]);
    }

    function addExerciseToDay(dayIdx) {
        const updated = [...customDays];
        updated[dayIdx].exercises.push({
            name: 'New Exercise',
            sets: 3,
            reps: '10 - 12',
            rest: '60s',
            stat: 'STR'
        });
        setCustomDays(updated);
    }

    const activeWorkout = activePlan?.schedule?.[selectedDayView] || activePlan?.schedule?.[0];

    return (
        <section className="training-panel">
            {/* Header */}
            <div className="training-header">
                <div>
                    <span className="training-tag">SYSTEM TRAINING MODULE // LEVEL ADAPTIVE</span>
                    <h2>Tactical Training Program</h2>
                </div>
                {activePlan && viewMode === 'view' && (
                    <button className="change-plan-btn" onClick={() => setViewMode('select')}>
                        🔄 Switch / Edit Program
                    </button>
                )}
            </div>

            {/* ================= 1. FIRST-TIME SELECTOR SCREEN ================= */}
            {viewMode === 'select' && (
                <div className="wizard-intro-box">
                    <div className="wizard-header">
                        <h3>⚡ Initialize Your Training Directive</h3>
                        <p>To calibrate your daily quests, The System needs your weekly training schedule.</p>
                    </div>

                    <div className="mode-selection-grid">
                        <div className="mode-card" onClick={() => setViewMode('generator')}>
                            <div className="mode-icon">⚡</div>
                            <h3>System Generator (Recommended)</h3>
                            <p>Formulate an adaptive workout plan based on your weekly commitment and available equipment.</p>
                            <button className="mode-action-btn">Configure Schedule →</button>
                        </div>

                        <div className="mode-card" onClick={() => setViewMode('custom')}>
                            <div className="mode-icon">✍️</div>
                            <h3>Custom Program Builder</h3>
                            <p>Input your existing gym split and specific exercises to track through The System.</p>
                            <button className="mode-action-btn">Build Custom Split →</button>
                        </div>
                    </div>

                    {activePlan && (
                        <button className="text-cancel-btn" onClick={() => setViewMode('view')}>
                            ← Keep Current Routine
                        </button>
                    )}
                </div>
            )}

            {/* ================= 2. GENERATOR WIZARD ================= */}
            {viewMode === 'generator' && (
                <div className="generator-form-box">
                    <div className="form-header">
                        <h3>⚡ System Generator Setup</h3>
                        <button className="text-cancel-btn" onClick={() => setViewMode(activePlan ? 'view' : 'select')}>Cancel</button>
                    </div>

                    {/* Question 1: Days per week */}
                    <div className="form-group-block">
                        <label>1. WEEKLY FREQUENCY (HOW MANY DAYS CAN YOU COMMIT?)</label>
                        <div className="days-selector-row">
                            {[
                                { days: 3, label: '3 Days / Week', sub: 'Full Body Conditioning' },
                                { days: 4, label: '4 Days / Week', sub: 'Upper / Lower Split' },
                                { days: 5, label: '5 Days / Week', sub: 'Body-Part Hunter Split' },
                                { days: 6, label: '6 Days / Week', sub: 'Push / Pull / Legs (PPL)' },
                            ].map(d => (
                                <div
                                    key={d.days}
                                    className={`toggle-box ${genDays === d.days ? 'active' : ''}`}
                                    onClick={() => setGenDays(d.days)}
                                >
                                    <strong>{d.label}</strong>
                                    <span>{d.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question 2: Equipment */}
                    <div className="form-group-block">
                        <label>2. AVAILABLE EQUIPMENT</label>
                        <div className="toggle-options-grid">
                            {[
                                { id: 'gym', label: 'Full Gym', sub: 'Barbells, Dumbbells, Cables, Machines' },
                                { id: 'dumbbell', label: 'Dumbbells Only', sub: 'Home setup with adjustable dumbbells' },
                                { id: 'bodyweight', label: 'Calisthenics', sub: 'Bodyweight only (Pull-up bar / Floor)' },
                            ].map(eq => (
                                <div
                                    key={eq.id}
                                    className={`toggle-box ${genEquip === eq.id ? 'active' : ''}`}
                                    onClick={() => setGenEquip(eq.id)}
                                >
                                    <strong>{eq.label}</strong>
                                    <span>{eq.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="submit-plan-btn" onClick={handleGenerateSubmit}>
                        ACTIVATE TRAINING DIRECTIVE ⚔️
                    </button>
                </div>
            )}

            {/* ================= 3. CUSTOM BUILDER ================= */}
            {viewMode === 'custom' && (
                <div className="generator-form-box">
                    <div className="form-header">
                        <h3>✍️ Custom Program Builder</h3>
                        <button className="text-cancel-btn" onClick={() => setViewMode(activePlan ? 'view' : 'select')}>Cancel</button>
                    </div>

                    <div className="metric-field">
                        <label>PROGRAM NAME</label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. My 4-Day Gym Routine"
                        />
                    </div>

                    <div className="custom-days-container">
                        {customDays.map((d, dIdx) => (
                            <div key={dIdx} className="custom-day-card">
                                <input
                                    type="text"
                                    className="day-title-input"
                                    value={d.dayName}
                                    onChange={(e) => {
                                        const updated = [...customDays];
                                        updated[dIdx].dayName = e.target.value;
                                        setCustomDays(updated);
                                    }}
                                />

                                <div className="custom-exercises-list">
                                    {d.exercises.map((ex, exIdx) => (
                                        <div key={exIdx} className="custom-ex-row">
                                            <input
                                                type="text"
                                                placeholder="Exercise name"
                                                value={ex.name}
                                                onChange={(e) => {
                                                    const updated = [...customDays];
                                                    updated[dIdx].exercises[exIdx].name = e.target.value;
                                                    setCustomDays(updated);
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Sets"
                                                className="small-num-input"
                                                value={ex.sets}
                                                onChange={(e) => {
                                                    const updated = [...customDays];
                                                    updated[dIdx].exercises[exIdx].sets = Number(e.target.value);
                                                    setCustomDays(updated);
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Reps"
                                                className="small-text-input"
                                                value={ex.reps}
                                                onChange={(e) => {
                                                    const updated = [...customDays];
                                                    updated[dIdx].exercises[exIdx].reps = e.target.value;
                                                    setCustomDays(updated);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button className="add-ex-btn" onClick={() => addExerciseToDay(dIdx)}>
                                        + Add Exercise
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="add-day-btn" onClick={addCustomDay}>
                            + Add Workout Day
                        </button>
                    </div>

                    <button className="submit-plan-btn" onClick={handleCustomSubmit}>
                        SAVE & ACTIVATE CUSTOM PROGRAM ⚔️
                    </button>
                </div>
            )}

            {/* ================= 4. ACTIVE WORKOUT SCHEDULE (SHOWN ONCE ACTIVATED) ================= */}
            {viewMode === 'view' && activePlan && (
                <div className="active-plan-view">
                    <div className="plan-banner">
                        <div>
                            <span className="active-indicator">● ACTIVE DIRECTIVE ({activePlan.schedule?.length || 0} DAYS / WEEK)</span>
                            <h3 className="plan-title">{activePlan.name}</h3>
                        </div>
                        <div className={`workout-status-badge ${isWorkoutCompletedToday ? 'completed' : 'pending'}`}>
                            {isWorkoutCompletedToday ? '✓ TODAY\'S SESSION COMPLETE' : '⏳ WORKOUT PENDING TODAY'}
                        </div>
                    </div>

                    {/* Day Tabs */}
                    <div className="schedule-day-tabs">
                        {activePlan.schedule.map((day, idx) => (
                            <button
                                key={idx}
                                className={`schedule-tab-btn ${selectedDayView === idx ? 'active' : ''} ${currentDayIndex === idx ? 'current-day-highlight' : ''}`}
                                onClick={() => setSelectedDayView(idx)}
                            >
                                <span>{day.muscleGroup || `Day ${idx + 1}`}</span>
                                {currentDayIndex === idx && <small>(TODAY)</small>}
                            </button>
                        ))}
                    </div>

                    {/* Exercise Checklist */}
                    {activeWorkout && (
                        <div className="workout-day-card">
                            <div className="workout-day-header">
                                <div>
                                    <h4>{activeWorkout.dayName}</h4>
                                    <span className="ex-count">{activeWorkout.exercises.length} Exercises Planned</span>
                                </div>

                                <div className="header-actions">
                                    {selectedDayView !== currentDayIndex && (
                                        <button
                                            className="set-active-day-btn"
                                            onClick={() => setCurrentDayIndex && setCurrentDayIndex(selectedDayView)}
                                            title="Set this day as today's target workout"
                                        >
                                            🎯 Set as Today's Focus
                                        </button>
                                    )}

                                    {selectedDayView === currentDayIndex && (
                                        <button
                                            className={`finish-session-btn ${isWorkoutCompletedToday ? 'completed' : ''}`}
                                            disabled={isWorkoutCompletedToday}
                                            onClick={onCompleteWorkout}
                                        >
                                            {isWorkoutCompletedToday ? '✓ WORKOUT COMPLETED (+100 XP CLAIMED)' : 'COMPLETE WORKOUT SESSION (+100 XP) 🏆'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="exercises-table">
                                {activeWorkout.exercises.map((ex, idx) => {
                                    const isChecked = !!checkedExercises[`${selectedDayView}-${idx}`];
                                    return (
                                        <div
                                            key={idx}
                                            className={`exercise-row ${isChecked ? 'done' : ''}`}
                                            onClick={() => setCheckedExercises({
                                                ...checkedExercises,
                                                [`${selectedDayView}-${idx}`]: !isChecked
                                            })}
                                        >
                                            <div className="ex-check">
                                                {isChecked ? '✓' : '○'}
                                            </div>
                                            <div className="ex-info">
                                                <span className="ex-name">{ex.name}</span>
                                                <span className="ex-stat">Attribute: <strong className="text-cyan-400">+{ex.stat || 'STR'}</strong></span>
                                            </div>
                                            <div className="ex-metrics">
                                                <span className="metric-pill">{ex.sets} Sets</span>
                                                <span className="metric-pill">{ex.reps} Reps</span>
                                                {ex.rest && <span className="rest-pill">{ex.rest} Rest</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}