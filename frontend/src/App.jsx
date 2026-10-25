// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import QuestsPanel from './components/QuestsPanel';
import { getHunterRank, calculateLevelProgress } from './utils/hunterMath';
import './App.css';

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. Streak State
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('ascend_streak');
    return saved !== null ? Number(saved) : 1;
  });

  // 2. Persistent Total XP
  const [totalXP, setTotalXP] = useState(() => {
    const saved = localStorage.getItem('ascend_total_xp');
    return saved !== null ? Number(saved) : 350;
  });

  // 3. Persistent Hunter Attributes (STR, AGI, VIT, INT, PER)
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('ascend_stats');
    return saved !== null ? JSON.parse(saved) : {
      strength: 10,
      agility: 10,
      vitality: 10,
      intelligence: 10,
      perception: 10,
    };
  });

  // 4. Quests with Automatic Daily Midnight Reset
  const [quests, setQuests] = useState(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const lastActiveDate = localStorage.getItem('ascend_last_active_date');
    const savedQuests = localStorage.getItem('ascend_quests');

    const defaultQuests = [
      { id: 1, title: 'Complete a workout session', category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ];

    // If it's a new day, automatically refresh all daily quests!
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

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ascend_total_xp', totalXP);
  }, [totalXP]);

  useEffect(() => {
    localStorage.setItem('ascend_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ascend_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('ascend_streak', streak);
  }, [streak]);

  // Derived Progression
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level);

  // Handlers
  function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
    setTotalXP(prev => prev + target.xp);
  }

  function handleResetProgress() {
    if (!window.confirm("Are you sure you want to reset all System data?")) return;
    localStorage.clear();
    setTotalXP(350);
    setStreak(1);
    setStats({ strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 });
    setQuests([
      { id: 1, title: 'Complete a workout session', category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Deep Work / Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read 15 pages of a book', category: 'DISCIPLINE', xp: 25, completed: false },
    ]);
  }

  return (
    <main>
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

      {activeTab !== 'dashboard' && (
        <section className="coming-soon-panel">
          <h2>[ SYSTEM MODULE: {activeTab.toUpperCase().replace('-', ' ')} ]</h2>
          <p>Training Engine module initialization in progress...</p>
        </section>
      )}
    </main>
  );
}