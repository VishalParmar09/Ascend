import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

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
      <p className="stat-value">1</p>
      <p className="stat-description">Current Level</p>
    </article>

    <article className="stat-card">
      <p className="stat-label">EXPERIENCE</p>
      <p className="stat-value">0 <span>XP</span></p>
      <p className="stat-description">Total Experience</p>
    </article>
  </div>
</section>

    </main>
  )
}

export default App
