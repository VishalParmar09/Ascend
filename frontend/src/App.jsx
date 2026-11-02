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

  // 3. Daily Quests (Resilient state)
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
  // RULE OF AUTHORITY: Neon PostgreSQL is the Single Source of Truth; localStorage is offline cache.
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
            setIsAwakened(true); // ShadowMonarch is an active awakened hunter in DB
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

            // Synchronize workout completion status based on today's FITNESS quest
            const fitnessQuest = serverQuests.find(q => q.category === 'FITNESS');
            if (fitnessQuest?.completed) {
              setIsWorkoutCompletedToday(true);
            }
          }
        }
      } catch (err) {
        console.warn('Backend sync failed, maintaining local offline cache:', err);
        if (isMounted) setIsBackendConnected(false);
      }
    }

    syncBackend();

    return () => { isMounted = false; };
  }, []);

  // Sync to LocalStorage (as offline resilience fallback cache)
  useEffect(() => { localStorage.setItem('ascend_total_xp', totalXP); }, [totalXP]);
  useEffect(() => { localStorage.setItem('ascend_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('ascend_official_rank', officialRank); }, [officialRank]);
  useEffect(() => { localStorage.setItem('ascend_quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('ascend_streak', streak); }, [streak]);
  useEffect(() => { localStorage.setItem('ascend_active_plan', JSON.stringify(activePlan)); }, [activePlan]);
  useEffect(() => { localStorage.setItem('ascend_workout_day_index', currentWorkoutDayIndex); }, [currentWorkoutDayIndex]);

  // Synchronize Daily Workout Quest Title dynamically by CATEGORY (not fixed ID)
  useEffect(() => {
    const expectedTitle = getWorkoutQuestTitle(activePlan, currentWorkoutDayIndex);
    setQuests(prevQuests => {
      const fitnessQuest = prevQuests.find(q => q.category === 'FITNESS');
      if (fitnessQuest && fitnessQuest.title !== expectedTitle) {
        return prevQuests.map(q => q.category === 'FITNESS' ? { ...q, title: expectedTitle } : q);
      }
      return prevQuests;
    });
  }, [activePlan, currentWorkoutDayIndex]);

  // Derived Progression
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level, officialRank);

  // Complete Quest Handler with Optimistic UI & Atomic Rollback
  async function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    // 1. Snapshot prior state for atomic rollback on failure
    const prevQuests = quests;
    const prevTotalXP = totalXP;
    const prevStreak = streak;
    const prevWorkoutCompleted = isWorkoutCompletedToday;
    const reward = target.xp || target.xpReward || 50;

    // 2. Optimistic UI update
    const updatedQuests = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updatedQuests);
    setTotalXP(prev => prev + reward);

    // If FITNESS quest was manually completed, mark workout as completed today
    if (target.category === 'FITNESS') {
      const today = new Intl.DateTimeFormat('en-CA').format(new Date());
      setIsWorkoutCompletedToday(true);
      localStorage.setItem('ascend_last_workout_date', today);
    }

    // 3. Sync to Spring Boot Backend (Authoritative Server Engine)
    if (isBackendConnected) {
      try {
        const result = await ascendApi.completeQuest(questId, 'ShadowMonarch');
        if (result?.hunterProfile) {
          // Reconcile with authoritative server state
          setTotalXP(result.hunterProfile.totalXp);
          setStreak(result.hunterProfile.streak);
        }
      } catch (err) {
        console.warn('Backend quest completion failed; rolling back optimistic update:', err);
        // Rollback to snapshot
        setQuests(prevQuests);
        setTotalXP(prevTotalXP);
        setStreak(prevStreak);
        setIsWorkoutCompletedToday(prevWorkoutCompleted);
        if (!prevWorkoutCompleted) {
          localStorage.removeItem('ascend_last_workout_date');
        }
        alert('⚠️ System Link Error: Quest completion could not be verified by the Association Server. State restored.');
      }
    }
  }

  // Complete Workout Session with Idempotency Key, Single Dispatch, and Atomic Rollback
  async function handleCompleteWorkoutSession(summary) {
    if (isWorkoutCompletedToday) return;

    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const workoutName = summary?.workoutName || activePlan?.schedule?.[currentWorkoutDayIndex]?.dayName || 'Workout Session';
    const durationSeconds = summary?.durationSeconds || 0;
    const completedSets = summary?.completedSets || 0;
    const totalSets = summary?.totalSets || 0;
    const xpReward = 100;
    const idempotencyKey = 'workout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    // 1. Snapshot prior state for atomic rollback on failure
    const prevQuests = quests;
    const prevTotalXP = totalXP;
    const prevStreak = streak;
    const prevWorkoutCompleted = isWorkoutCompletedToday;
    const prevDayIndex = currentWorkoutDayIndex;

    // 2. Optimistic Local State Update
    setIsWorkoutCompletedToday(true);
    localStorage.setItem('ascend_last_workout_date', today);
    setQuests(prev => prev.map(q => q.category === 'FITNESS' ? { ...q, completed: true } : q));
    setTotalXP(prev => prev + xpReward);

    if (activePlan?.schedule?.length > 0) {
      const nextIndex = (currentWorkoutDayIndex + 1) % activePlan.schedule.length;
      setCurrentWorkoutDayIndex(nextIndex);
    }

    // 3. Dispatch to Spring Boot Backend
    if (isBackendConnected) {
      try {
        const logPayload = {
          workoutName,
          durationSeconds,
          completedSets,
          totalSets,
          xpEarned: xpReward,
          idempotencyKey
        };
        const result = await ascendApi.logWorkout(logPayload, 'ShadowMonarch');

        if (result?.hunterProfile) {
          // Authoritative server state takes absolute precedence
          setTotalXP(result.hunterProfile.totalXp);
          setStreak(result.hunterProfile.streak);
        }
        if (result?.completedQuest) {
          setQuests(prev => prev.map(q => q.id === result.completedQuest.id ? { ...q, completed: true } : q));
        }

        // Record confirmed session to local history cache
        const saved = localStorage.getItem('ascend_workout_history');
        const history = saved ? JSON.parse(saved) : [];
        history.unshift({
          id: result?.workoutLog?.id || ('log_' + Date.now()),
          date: today,
          timestamp: new Date().toISOString(),
          workoutName,
          durationSeconds,
          completedSets,
          totalSets,
          xpGained: result?.workoutLog?.xpEarned ?? xpReward
        });
        localStorage.setItem('ascend_workout_history', JSON.stringify(history));

      } catch (err) {
        console.warn('Failed to dispatch workout log to backend; rolling back optimistic state:', err);
        // Atomic rollback
        setQuests(prevQuests);
        setTotalXP(prevTotalXP);
        setStreak(prevStreak);
        setIsWorkoutCompletedToday(prevWorkoutCompleted);
        setCurrentWorkoutDayIndex(prevDayIndex);
        if (!prevWorkoutCompleted) {
          localStorage.removeItem('ascend_last_workout_date');
        }
        alert('⚠️ System Link Error: Workout session could not be synchronized with PostgreSQL. Session restored for retry.');
      }
    } else {
      // Offline fallback: Save session directly to local cache
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
        xpGained: xpReward
      });
      localStorage.setItem('ascend_workout_history', JSON.stringify(history));
    }
  }

  // Awakening Assessment with Backend Synchronization & Rollback
  async function handleAwakeningComplete(calibrationData) {
    const prevStats = stats;
    const prevAwakened = isAwakened;

    setStats(calibrationData.stats);
    setIsAwakened(true);
    localStorage.setItem('ascend_is_awakened', 'true');
    localStorage.setItem('ascend_user_profile', JSON.stringify(calibrationData.profile));

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
        console.warn('Failed to dispatch awakening stats to backend; rolling back:', err);
        setStats(prevStats);
        setIsAwakened(prevAwakened);
        localStorage.setItem('ascend_is_awakened', String(prevAwakened));
        alert('⚠️ System Error: Awakening assessment could not be saved to server. Please try again.');
        return;
      }
    }

    setShowCalibrationModal(false);
    setShowWalkthrough(true);
  }

  // Official Hunter Rank Advancement with Backend Synchronization & Rollback
  async function handlePromotionSuccess({ newRank, newStats, benchmarks }) {
    const prevRank = officialRank;
    const prevStats = stats;
    const prevPlan = activePlan;

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
        console.warn('Failed to dispatch rank recalibration to backend; rolling back:', err);
        setOfficialRank(prevRank);
        setStats(prevStats);
        setActivePlan(prevPlan);
        alert('⚠️ System Error: Rank Promotion could not be registered with the Association Server. State restored.');
        return;
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
                onOpenCalibration={() => setShowCalibrationModal(true)}
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
              currentWorkoutDayIndex={currentWorkoutDayIndex}
              setCurrentDayIndex={setCurrentWorkoutDayIndex}
              setCurrentWorkoutDayIndex={setCurrentWorkoutDayIndex}
              isWorkoutCompletedToday={isWorkoutCompletedToday}
              onCompleteWorkout={handleCompleteWorkoutSession}
              onCompleteWorkoutSession={handleCompleteWorkoutSession}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationTab
              stats={stats}
              hunterRank={hunterRank}
              level={level}
              onChallengeExam={() => setShowPromotionModal(true)}
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
              isOpen={showPromotionModal}
              currentRank={hunterRank.rank}
              currentStats={stats}
              onClose={() => setShowPromotionModal(false)}
              onSuccess={handlePromotionSuccess}
              onPromoteHunter={handlePromotionSuccess}
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
          isOpen={showCalibrationModal}
          onClose={() => setShowCalibrationModal(false)}
          onComplete={handleAwakeningComplete}
        />
      )}
    </main>
  );
}
