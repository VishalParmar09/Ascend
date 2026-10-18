export default function QuestsPanel({ quests, onCompleteQuest }) {
  const completedCount = quests.filter(q => q.completed).length;

  return (
    <section className='quests-panel'>
      <div className='quests-header'>
        <h2>Daily Quests</h2>
        <span className='quests-count'>
          {completedCount} / {quests.length} COMPLETED
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
                onClick={() => onCompleteQuest(quest.id)}
                disabled={quest.completed}
              >
                {quest.completed ? 'CLAIMED' : 'COMPLETE'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}