// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import QuestsPanel from './components/QuestsPanel';
import { getHunterRank, calculateLevelProgress } from './utils/hunterMath';
import './App.css';

export default function App() {
  // 1. Persistent State
  const [totalXP, setTotalXP] = useState(() => {
    const saved = localStorage.getItem('ascend_total_xp');
    return saved !== null ? Number(saved) : 350;
  });

  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('ascend_quests');
    return saved !== null ? JSON.parse(saved) : [
      { id: 1, title: 'Complete a workout', category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read for 20 minutes', category: 'DISCIPLINE', xp: 25, completed: false },
    ];
  });

  // 2. Synchronize with localStorage
  useEffect(() => {
    localStorage.setItem('ascend_total_xp', totalXP);
  }, [totalXP]);

  useEffect(() => {
    localStorage.setItem('ascend_quests', JSON.stringify(quests));
  }, [quests]);

  // 3. Derived Math
  const { level, xpForNextLevel, currentXP, remainingXP, progress } = calculateLevelProgress(totalXP);
  const hunterRank = getHunterRank(level);

  // 4. Handlers
  function handleCompleteQuest(questId) {
    const target = quests.find(q => q.id === questId);
    if (!target || target.completed) return;

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
    setTotalXP(prev => prev + target.xp);
  }

  function handleResetProgress() {
    localStorage.removeItem('ascend_total_xp');
    localStorage.removeItem('ascend_quests');
    setTotalXP(350);
    setQuests([
      { id: 1, title: 'Complete a workout', category: 'FITNESS', xp: 100, completed: false },
      { id: 2, title: 'Study for 1 hour', category: 'KNOWLEDGE', xp: 75, completed: false },
      { id: 3, title: 'Read for 20 minutes', category: 'DISCIPLINE', xp: 25, completed: false },
    ]);
  }
  return (
    <main>
      <Header />

      <StatusPanel
        hunterRank={hunterRank}
        level={level}
        totalXP={totalXP}
        currentXP={currentXP}
        xpForNextLevel={xpForNextLevel}
        remainingXP={remainingXP}
        progress={progress}
        onEarnXP={() => setTotalXP(prev => prev + 50)}
        onResetProgress={handleResetProgress}
      />

      <QuestsPanel
        quests={quests}
        onCompleteQuest={handleCompleteQuest}
      />
    </main>
  );
}