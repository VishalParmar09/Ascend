import { useState } from 'react'
import './App.css'

function App() {
  const [totalXP, setTotalXP] = useState(350)

  let level = 1
  let xpForNextLevel = 500
  let xpRemaining = totalXP

  while (xpRemaining >= xpForNextLevel) {
    xpRemaining -= xpForNextLevel
    level += 1
    xpForNextLevel = 500 + (level - 1) * 250
  }

  const currentXP = xpRemaining
  const remainingXP = xpForNextLevel - currentXP
  const progress = (currentXP / xpForNextLevel) * 100

  const [quests, setQuests] = useState([
    {
      id: 1,
      title: 'Complete a workout',
      category: 'FITNESS',
      xp: 100,
      completed: false,
    },
    {
      id: 2,
      title: 'Study for 1 hour',
      category: 'KNOWLEDGE',
      xp: 75,
      completed: false,
    },
    {
      id: 3,
      title: 'Read for 20 minutes',
      category: 'DISCIPLINE',
      xp: 25,
      completed: false,
    },])


  function completeQuest(questId) {
    const targetQuest = quests.find((q) => q.id === questId)

    if (!targetQuest || targetQuest.completed) {
      return
    }

    setQuests((previousQuests) =>
      previousQuests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      )
    )

    setTotalXP((previousXP) => previousXP + targetQuest.xp)
  }
  return (
    <main>
      <header>
        <p>ASCEND // THE SYSTEM</p>
        <h1>Your journey begins here.</h1>
        <p>Every day is an opportunity to level up.</p>
      </header>


      <section className="status-panel">
        <h2>Hunter Status</h2>

        <div className="stats-grid">
          <article className="stat-card">
            <p className="stat-label">CURRENT RANK</p>
            <p className="stat-value">E</p>
            <p className="stat-description">Hunter Grade</p>
          </article>

          <article className="stat-card">
            <p className="stat-label">LEVEL</p>
            <p className="stat-value">{level}</p>
            <p className="stat-description">Current Level</p>
          </article>

          <article className="stat-card">
            <p className="stat-label">EXPERIENCE</p>
            <p className="stat-value">{totalXP} <span>XP</span></p>
            <p className="stat-description">Total Experience</p>
          </article>
        </div>

        <div className='xp-section'>
          <div className='xp-heading'>
            <p>LEVEL {level} PROGRESS</p>
            <p>{currentXP} / {xpForNextLevel} XP</p>
          </div>

          <div className="xp-track"
            role='progressbar'
            aria-label='Experience progress'
            aria-valuenow={currentXP}
            aria-valuemin={0}
            aria-valuemax={xpForNextLevel}>
            <div
              className='xp-fill'
              style={{ width: `${progress}%` }} />

          </div>

          <p className='xp-remaining'>
            {remainingXP} XP until Level {level + 1}
          </p>

          <button onClick={() => setTotalXP(totalXP + 50)}>
            Earn 50 XP
          </button>
        </div>
      </section>

      <section className='quests-panel'>
        <div className='quests-header'>
          <h2>Daily Quests</h2>
          <span className='quests-count'>
            {quests.filter(q => q.completed).length} / {quests.length} COMPLETED
          </span>
        </div>

        <div className='quests-list'>
          {quests.map((quest) => (
            <article
              className={`quest-card ${quest.completed ? 'completed' : ''}`}
              key={quest.id}
            >
              <div className='quest-info'>
                <p className='quest-category'>{quest.category}</p>
                <h3>{quest.title}</h3>
              </div>

              <div className='quest-actions'>
                <span className='quest-reward'>+{quest.xp} XP</span>

                <button
                  className='quest-btn'
                  onClick={() => completeQuest(quest.id)}
                  disabled={quest.completed}
                >
                  {quest.completed ? 'CLAIMED' : 'COMPLETE'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
