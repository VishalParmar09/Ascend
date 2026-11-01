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
import { ascendApi } from './services/ascendApi';
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
  const [isBackendConnected, setIsBackendConnected] = useState(false);

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

  const [isWorkoutCompletedToday, setIsWorkoutCompletedToday] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastWorkoutDate = localStorage.getItem('ascend_last_workout_date');
    return lastWorkoutDate === today;
  });

  // 3. Daily Quests
  const [quests, setQuests] = useState(() => {
    const savedQuests = localStorage.getItem('ascend_quests');
    const workoutTitle = getWorkoutQuestTitle(activePlan, currentWorkoutDayIndex);
    const defaultQuests = [
      { id: 1, title: workoutTitle, category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ];
    if (savedQuests) {
      try {
        return JSON.parse(savedQuests);
      } catch {
        return defaultQuests;
      }
    }
    return defaultQuests;
  });

  // --- Initial Client-Server Synchronization with Spring Boot / Neon PostgreSQL ---
  useEffect(() => {
    let isMounted = true;

    async function syncBackend() {
      try {
        const isOnline = await ascendApi.checkHealth();
        if (!isMounted) return;
        setIsBackendConnected(isOnline);

        if (isOnline) {
          // 1. Fetch Authoritative Profile from Neon PostgreSQL
          const profile = await ascendApi.getProfile('ShadowMonarch');
          if (profile && isMounted) {
            setTotalXP(profile.totalXp);
            setStats({
              strength: profile.strength,
              agility: profile.agility,
              vitality: profile.vitality,
              intelligence: profile.intelligence,
              perception: profile.perception,
            });
            setOfficialRank(profile.rank);
            setStreak(profile.streak);
            setIsAwakened(true); // ShadowMonarch is an awakened hunter in DB
          }

          // 2. Fetch Authoritative Daily Quests from Neon PostgreSQL
          const serverQuests = await ascendApi.getTodayQuests('ShadowMonarch');
          if (serverQuests && serverQuests.length > 0 && isMounted) {
            setQuests(serverQuests.map(q => ({
              id: q.id,
              title: q.title,
              category: q.category,
              xp: q.xpReward,
              completed: q.completed,
              statTarget: q.statTarget,
            })));
          }
        }
      } catch (err) {
        console.warn('Backend sync failed, maintaining local persistence:', err);
        if (isMounted) setIsBackendConnected(false);
      }
    }

    syncBackend();

    return () => { isMounted = false; };
  }, []);

  // Sync to LocalStorage (as resilience cache)
  useEffect(() => { localStorage.setItem('ascend_total_xp', totalXP); }, [totalXP]);
  useEffect(() => { localStorage.setItem('ascend_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('ascend_official_rank', officialRank); }, [officialRank]);
  useEffect(() => { localStorage.setItem('ascend_quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('ascend_streak', streak); }, [streak]);
  useEffect(() => { localStorage.setItem('ascend_active_plan', JSON.stringify(activePlan)); }, [activePlan]);
  useEffect(() => { localStorage.setItem('ascend_workout_day_index', currentWorkoutDayIndex); }, [currentWorkoutDayIndex]);

  // Derived Progression
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level, officialRank);

  // Complete Quest Handler (with Real Backend Dispatch)
  async function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    // Optimistic UI update
    const updatedQuests = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updatedQuests);
    const reward = target.xp || target.xpReward || 50;
    setTotalXP(prev => prev + reward);

    // Sync to Spring Boot Backend
    if (isBackendConnected) {
      try {
        const result = await ascendApi.completeQuest(questId, 'ShadowMonarch');
        if (result?.hunterProfile) {
          setTotalXP(result.hunterProfile.totalXp);
          setStreak(result.hunterProfile.streak);
        }
      } catch (err) {
        console.warn('Backend quest completion failed; maintaining local state:', err);
      }
    }

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

  // Complete Workout Session (with Real Backend Dispatch to Neon PostgreSQL)
  async function handleCompleteWorkoutSession(summary) {
    if (isWorkoutCompletedToday) return;

    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    setIsWorkoutCompletedToday(true);
    localStorage.setItem('ascend_last_workout_date', today);

    // Mark the dashboard workout quest (id: 1) as completed
    handleCompleteQuest(1);

    const workoutName = summary?.workoutName || activePlan?.schedule?.[currentWorkoutDayIndex]?.dayName || 'Workout Session';
    const durationSeconds = summary?.durationSeconds || 0;
    const completedSets = summary?.completedSets || 0;
    const totalSets = summary?.totalSets || 0;

    // Record to workout logs history locally
    try {
      const saved = localStorage.getItem('ascend_workout_history');
      const history = saved ? JSON.parse(saved) : [];
      history.unshift({
        id: 'log_' + Date.now(),
        date: today,
        timestamp: new Date().toISOString(),
        workoutName,
        durationSeconds,
        completedSets,
        totalSets,
        xpGained: 100
      });
      localStorage.setItem('ascend_workout_history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save workout history log", e);
    }

    // Dispatch to Spring Boot backend -> Neon PostgreSQL!
    if (isBackendConnected) {
      try {
        const logPayload = {
          workoutName,
          durationSeconds,
          completedSets,
          totalSets,
          xpEarned: 100
        };
        const result = await ascendApi.logWorkout(logPayload, 'ShadowMonarch');
        if (result?.hunterProfile) {
          setTotalXP(result.hunterProfile.totalXp);
        }
      } catch (err) {
        console.warn('Failed to dispatch workout log to backend:', err);
      }
    }

    // Advance to next day in cycle for tomorrow
    if (activePlan?.schedule?.length > 0) {
      const nextIndex = (currentWorkoutDayIndex + 1) % activePlan.schedule.length;
      setCurrentWorkoutDayIndex(nextIndex);
    }
  }

  async function handleAwakeningComplete(calibrationData) {
    setStats(calibrationData.stats);
    setIsAwakened(true);
    localStorage.setItem('ascend_is_awakened', 'true');
    localStorage.setItem('ascend_user_profile', JSON.stringify(calibrationData.profile));
    setShowCalibrationModal(false);
    setShowWalkthrough(true);

    if (isBackendConnected) {
      try {
        await ascendApi.recalibrateHunter({
          rank: 'E',
          strength: calibrationData.stats.strength,
          agility: calibrationData.stats.agility,
          vitality: calibrationData.stats.vitality,
          intelligence: calibrationData.stats.intelligence,
          perception: calibrationData.stats.perception
        }, 'ShadowMonarch');
      } catch (err) {
        console.warn('Failed to dispatch awakening stats to backend:', err);
      }
    }
  }

  // Official Hunter Rank Advancement & Progressive Overload Plan Scaling
  async function handlePromotionSuccess({ newRank, newStats, benchmarks }) {
    setOfficialRank(newRank);
    setStats(newStats);

    // Scale workout plan for progressive overload based on new rank tier
    if (activePlan) {
      const upgradedPlan = scalePlanForRank(activePlan, newRank);
      setActivePlan(upgradedPlan);
    }

    // Dispatch Recalibration to Spring Boot backend -> Neon PostgreSQL!
    if (isBackendConnected) {
      try {
        await ascendApi.recalibrateHunter({
          rank: newRank,
          strength: newStats.strength,
          agility: newStats.agility,
          vitality: newStats.vitality,
          intelligence: newStats.intelligence,
          perception: newStats.perception
        }, 'ShadowMonarch');
      } catch (err) {
        console.warn('Failed to dispatch rank recalibration to backend:', err);
      }
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
            isBackendConnected={isBackendConnected}
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
              currentWorkoutDayIndex={currentWorkoutDayIndex}
              isWorkoutCompletedToday={isWorkoutCompletedToday}
              onCompleteWorkoutSession={handleCompleteWorkoutSession}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationTab
              stats={stats}
              hunterRank={hunterRank}
              level={level}
              onTriggerPromotionExam={() => setShowPromotionModal(true)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <section className="leaderboard-placeholder">
              <h2>GLOBAL HUNTER LEADERBOARD</h2>
              <p>Hunter Registry synchronized with Association Database.</p>
            </section>
          )}

          {showPromotionModal && (
            <PromotionExamModal
              currentRank={hunterRank.rank}
              currentStats={stats}
              onClose={() => setShowPromotionModal(false)}
              onSuccess={handlePromotionSuccess}
            />
          )}

          {showWalkthrough && (
            <SystemGuidedTour
              onFinish={() => setShowWalkthrough(false)}
            />
          )}
        </>
      )}

      {showCalibrationModal && (
        <AwakeningModal
          onClose={() => setShowCalibrationModal(false)}
          onComplete={handleAwakeningComplete}
        />
      )}
    </main>
  );
}