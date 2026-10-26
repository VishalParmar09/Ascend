// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import QuestsPanel from './components/QuestsPanel';
import LandingPage from './components/LandingPage';
import AwakeningModal from './components/AwakeningModal';
import SystemGuidedTour from './components/SystemGuidedTour';
import EvaluationTab from './components/EvaluationTab';
import { getHunterRank, calculateLevelProgress } from './utils/hunterMath';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isAwakened, setIsAwakened] = useState(() => {
    return localStorage.getItem('ascend_is_awakened') === 'true';
  });
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // 1. Authentic Streak State (Defaults to 0!)
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

  // Daily Quests
  const [quests, setQuests] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastActiveDate = localStorage.getItem('ascend_last_active_date');
    const savedQuests = localStorage.getItem('ascend_quests');

    const defaultQuests = [
      { id: 1, title: 'Complete a workout session', category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ];

    if (lastActiveDate !== today) {
      localStorage.setItem('ascend_last_active_date', today);
      if (savedQuests) {
        const parsed = JSON.parse(savedQuests);
        return parsed.map(q => ({ ...q, completed: false }));
      }
      return defaultQuests;
    }

    return savedQuests !== null ? JSON.parse(savedQuests) : defaultQuests;
  });

  // LocalStorage Sync
  useEffect(() => { localStorage.setItem('ascend_total_xp', totalXP); }, [totalXP]);
  useEffect(() => { localStorage.setItem('ascend_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('ascend_quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('ascend_streak', streak); }, [streak]);

  // Derived Progression
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level);

  // Handlers
  function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    const updatedQuests = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updatedQuests);
    setTotalXP(prev => prev + target.xp);

    // 🔥 Check if ALL quests for today are cleared
    const allCompleted = updatedQuests.every(q => q.completed);
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastStreakDate = localStorage.getItem('ascend_last_streak_date');

    if (allCompleted && lastStreakDate !== today) {
      setStreak(prev => prev + 1);
      localStorage.setItem('ascend_last_streak_date', today);
    }
  }

  function handleAwakeningComplete(calibrationData) {
    setStats(calibrationData.stats);
    setIsAwakened(true);
    localStorage.setItem('ascend_is_awakened', 'true');
    localStorage.setItem('ascend_user_profile', JSON.stringify(calibrationData.profile));
    setShowCalibrationModal(false);
    setShowWalkthrough(true); // Open the System Briefing on first awakening!
  }

  function handleResetProgress() {
    if (!window.confirm("Reset all data and return to the Home screen?")) return;
    localStorage.clear();
    setTotalXP(350);
    setStreak(0); // Reset to 0
    setIsAwakened(false);
    setShowCalibrationModal(false);
    setShowWalkthrough(false);
    setStats({ strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 });
    setQuests([
      { id: 1, title: 'Complete a workout session', category: 'FITNESS', xp: 100, completed: false },
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

          {activeTab === 'evaluation' && (
            <EvaluationTab
              level={level}
              hunterRank={hunterRank}
              onChallengeExam={() => setShowCalibrationModal(true)}
            />
          )}

          {activeTab !== 'dashboard' && activeTab !== 'evaluation' && (
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
    </main>
  );
}