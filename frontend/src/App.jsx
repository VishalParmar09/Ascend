// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import QuestsPanel from './components/QuestsPanel';
import LandingPage from './components/LandingPage';
import AwakeningModal from './components/AwakeningModal';
import SystemGuidedTour from './components/SystemGuidedTour';
import EvaluationTab from './components/EvaluationTab';
import TrainingPlanTab from './components/TrainingPlanTab';
import PromotionExamModal from './components/PromotionExamModal';
import { getHunterRank, calculateLevelProgress } from './utils/hunterMath';
import { generateWorkoutPlan, scalePlanForRank } from './utils/trainingPlanGenerator';
import './App.css';

// Helper to resolve clean, properly formatted Workout Daily Quest title
function getWorkoutQuestTitle(plan, dayIndex) {
  const dayName = plan?.schedule?.[dayIndex]?.dayName;
  if (dayName) {
    return `Workout: ${dayName}`;
  }
  return 'Workout: Initialize routine in Training Plan tab';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isAwakened, setIsAwakened] = useState(() => {
    return localStorage.getItem('ascend_is_awakened') === 'true';
  });
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // 1. Streak State
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('ascend_streak');
    return saved !== null ? Number(saved) : 0;
  });

  const [totalXP, setTotalXP] = useState(() => {
    const saved = localStorage.getItem('ascend_total_xp');
    return saved !== null ? Number(saved) : 350;
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('ascend_stats');
    return saved !== null ? JSON.parse(saved) : {
      strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10,
    };
  });

  // Official Hunter Association License Rank (Promoted via Evaluation Dungeon)
  const [officialRank, setOfficialRank] = useState(() => {
    return localStorage.getItem('ascend_official_rank') || 'E';
  });

  // 2. Active Training Plan & Day Cycle
  const [activePlan, setActivePlan] = useState(() => {
    const saved = localStorage.getItem('ascend_active_plan');
    return saved !== null ? JSON.parse(saved) : null;
  });

  const [currentWorkoutDayIndex, setCurrentWorkoutDayIndex] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastActiveDate = localStorage.getItem('ascend_last_active_date');
    const saved = localStorage.getItem('ascend_workout_day_index');
    let index = saved !== null ? Number(saved) : 0;

    // When day rolls over to tomorrow and yesterday's workout was finished, advance split!
    if (lastActiveDate && lastActiveDate !== today) {
      const lastWorkoutDate = localStorage.getItem('ascend_last_workout_date');
      const savedPlan = localStorage.getItem('ascend_active_plan');
      const plan = savedPlan ? JSON.parse(savedPlan) : null;
      if (lastWorkoutDate === lastActiveDate && plan?.schedule?.length > 0) {
        index = (index + 1) % plan.schedule.length;
        localStorage.setItem('ascend_workout_day_index', index);
      }
    }
    return index;
  });

  // Track if today's workout session has been finished
  const [isWorkoutCompletedToday, setIsWorkoutCompletedToday] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastWorkoutDate = localStorage.getItem('ascend_last_workout_date');
    return lastWorkoutDate === today;
  });

  // 3. Daily Quests (Synchronized with Active Training Plan!)
  const [quests, setQuests] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastActiveDate = localStorage.getItem('ascend_last_active_date');
    const savedQuests = localStorage.getItem('ascend_quests');

    const workoutTitle = getWorkoutQuestTitle(activePlan, currentWorkoutDayIndex);

    const defaultQuests = [
      { id: 1, title: workoutTitle, category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ];

    if (lastActiveDate !== today) {
      localStorage.setItem('ascend_last_active_date', today);
      if (savedQuests) {
        try {
          const parsed = JSON.parse(savedQuests);
          return parsed.map(q => ({
            ...q,
            completed: false,
            title: q.id === 1 ? workoutTitle : q.title
          }));
        } catch (e) {
          return defaultQuests;
        }
      }
      return defaultQuests;
    }

    if (savedQuests !== null) {
      try {
        const parsed = JSON.parse(savedQuests);
        // Automatically repair legacy "Workout: undefined" or duplicate "Workout: Workout:"
        return parsed.map(q => {
          if (q.id === 1 && (!q.title || q.title.includes('undefined') || q.title.startsWith('Workout: Workout:'))) {
            return { ...q, title: workoutTitle };
          }
          return q;
        });
      } catch (e) {
        return defaultQuests;
      }
    }

    return defaultQuests;
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('ascend_total_xp', totalXP); }, [totalXP]);
  useEffect(() => { localStorage.setItem('ascend_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('ascend_official_rank', officialRank); }, [officialRank]);
  useEffect(() => { localStorage.setItem('ascend_quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('ascend_streak', streak); }, [streak]);
  useEffect(() => { localStorage.setItem('ascend_active_plan', JSON.stringify(activePlan)); }, [activePlan]);
  useEffect(() => { localStorage.setItem('ascend_workout_day_index', currentWorkoutDayIndex); }, [currentWorkoutDayIndex]);

  // Synchronize Daily Workout Quest Title whenever Active Plan or Day Index changes
  useEffect(() => {
    const expectedTitle = getWorkoutQuestTitle(activePlan, currentWorkoutDayIndex);
    setQuests(prevQuests => {
      const workoutQuest = prevQuests.find(q => q.id === 1);
      if (!workoutQuest || workoutQuest.title !== expectedTitle || workoutQuest.title.includes('undefined')) {
        return prevQuests.map(q => q.id === 1 ? { ...q, title: expectedTitle } : q);
      }
      return prevQuests;
    });
  }, [activePlan, currentWorkoutDayIndex]);

  // Derived Progression
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level, officialRank);

  // Complete Quest Handler
  function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    const updatedQuests = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updatedQuests);
    setTotalXP(prev => prev + target.xp);

    // If workout quest was completed, mark workout as completed today
    if (questId === 1) {
      const today = new Intl.DateTimeFormat('en-CA').format(new Date());
      setIsWorkoutCompletedToday(true);
      localStorage.setItem('ascend_last_workout_date', today);
    }

    // Check if ALL daily quests are done -> Streak +1
    const allCompleted = updatedQuests.every(q => q.completed);
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastStreakDate = localStorage.getItem('ascend_last_streak_date');

    if (allCompleted && lastStreakDate !== today) {
      setStreak(prev => prev + 1);
      localStorage.setItem('ascend_last_streak_date', today);
    }
  }

  // Complete Workout from Training Plan Tab (Two-Way Sync + Level Progress + History Log!)
  function handleCompleteWorkoutSession(summary) {
    if (isWorkoutCompletedToday) return;

    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    setIsWorkoutCompletedToday(true);
    localStorage.setItem('ascend_last_workout_date', today);

    // Mark the dashboard workout quest (id: 1) as completed (+100 Hunter XP)
    handleCompleteQuest(1);

    // Record to workout logs history
    try {
      const saved = localStorage.getItem('ascend_workout_history');
      const history = saved ? JSON.parse(saved) : [];
      history.unshift({
        id: 'log_' + Date.now(),
        date: today,
        timestamp: new Date().toISOString(),
        workoutName: summary?.workoutName || activePlan?.schedule?.[currentWorkoutDayIndex]?.dayName || 'Workout Session',
        durationSeconds: summary?.durationSeconds || 0,
        completedSets: summary?.completedSets || 0,
        totalSets: summary?.totalSets || 0,
        xpGained: 100
      });
      localStorage.setItem('ascend_workout_history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save workout history log", e);
    }

    // Advance to next day in cycle for tomorrow
    if (activePlan?.schedule?.length > 0) {
      const nextIndex = (currentWorkoutDayIndex + 1) % activePlan.schedule.length;
      setCurrentWorkoutDayIndex(nextIndex);
    }
  }

  function handleAwakeningComplete(calibrationData) {
    setStats(calibrationData.stats);
    setIsAwakened(true);
    localStorage.setItem('ascend_is_awakened', 'true');
    localStorage.setItem('ascend_user_profile', JSON.stringify(calibrationData.profile));
    setShowCalibrationModal(false);
    setShowWalkthrough(true);
  }

  // Official Hunter Rank Advancement & Progressive Overload Plan Scaling
  function handlePromotionSuccess({ newRank, newStats, benchmarks }) {
    setOfficialRank(newRank);
    setStats(newStats);
    
    // Scale workout plan for progressive overload based on new rank tier
    if (activePlan) {
      const upgradedPlan = scalePlanForRank(activePlan, newRank);
      setActivePlan(upgradedPlan);
    }
    
    setShowPromotionModal(false);
  }

  function handleResetProgress() {
    if (!window.confirm("Reset all data and return to the Home screen?")) return;
    localStorage.clear();
    setTotalXP(350);
    setStreak(0);
    setIsAwakened(false);
    setOfficialRank('E');
    setShowCalibrationModal(false);
    setShowWalkthrough(false);
    setShowPromotionModal(false);
    setCurrentWorkoutDayIndex(0);
    setIsWorkoutCompletedToday(false);
    setStats({ strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 });
    setActivePlan(null);
    setQuests([
      { id: 1, title: getWorkoutQuestTitle(null, 0), category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ]);
  }

  return (
    <main>
      {!isAwakened ? (
        <LandingPage onStartAwakening={() => setShowCalibrationModal(true)} />
      ) : (
        <>
          <Header
            streak={streak}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === 'dashboard' && (
            <>
              <StatusPanel
                hunterRank={hunterRank}
                level={level}
                totalXP={totalXP}
                currentXP={currentXP}
                xpForNextLevel={xpForNextLevel}
                remainingXP={remainingXP}
                progress={progress}
                stats={stats}
                onResetProgress={handleResetProgress}
              />

              <QuestsPanel
                quests={quests}
                onCompleteQuest={handleCompleteQuest}
              />
            </>
          )}

          {activeTab === 'training' && (
            <TrainingPlanTab
              activePlan={activePlan}
              setActivePlan={setActivePlan}
              currentDayIndex={currentWorkoutDayIndex}
              setCurrentDayIndex={setCurrentWorkoutDayIndex}
              isWorkoutCompletedToday={isWorkoutCompletedToday}
              onCompleteWorkout={handleCompleteWorkoutSession}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationTab
              level={level}
              hunterRank={hunterRank}
              onChallengeExam={() => setShowPromotionModal(true)}
              onDevSetLevel={(simLevel) => setTotalXP(simLevel >= 10 ? 13500 : 350)}
            />
          )}

          {activeTab !== 'dashboard' && activeTab !== 'training' && activeTab !== 'evaluation' && (
            <section className="coming-soon-panel">
              <h2>[ SYSTEM MODULE: {activeTab.toUpperCase().replace('-', ' ')} ]</h2>
              <p>Module initialization in progress...</p>
            </section>
          )}
        </>
      )}

      {/* Awakening Calibration Modal */}
      <AwakeningModal
        isOpen={showCalibrationModal}
        onClose={() => setShowCalibrationModal(false)}
        onComplete={handleAwakeningComplete}
      />

      {/* Interactive Spotlight Tour on Dashboard */}
      <SystemGuidedTour
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
      />

      {/* Hunter Association Rank Advancement Exam Modal */}
      <PromotionExamModal
        isOpen={showPromotionModal}
        currentStats={stats}
        onClose={() => setShowPromotionModal(false)}
        onPromoteHunter={handlePromotionSuccess}
      />
    </main>
  );
}