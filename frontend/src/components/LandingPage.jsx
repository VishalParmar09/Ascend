// src/components/LandingPage.jsx

export default function LandingPage({ onStartAwakening, onOpenAuth }) {
  const pillars = [
    {
      icon: '📊',
      title: 'Hunter Status Window',
      desc: 'Real-time attribute progression (STR, AGI, VIT, INT, PER). Watch your rank advance from E-Rank to S-Rank as you build discipline.'
    },
    {
      icon: '🏋️',
      title: 'Adaptive Training Engine',
      desc: 'Custom progressive workout splits generated specifically for your body, equipment, and personal aesthetic goals.'
    },
    {
      icon: '⚡',
      title: 'Midnight Penalty Deadlines',
      desc: 'High-stakes accountability. Complete your daily mandatory quests before midnight, or face survival penalty challenges.'
    }
  ];

  return (
    <div className="landing-container">
      {/* Top Minimal Navbar */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="brand-dot"></span>
          ASCEND // THE SYSTEM
        </div>
        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-nav-login-btn"
            onClick={() => onOpenAuth ? onOpenAuth('login') : onStartAwakening()}
          >
            ACCESS GATE (LOGIN)
          </button>
          <button
            type="button"
            className="landing-nav-btn"
            onClick={() => onOpenAuth ? onOpenAuth('register') : onStartAwakening()}
          >
            AWAKEN NOW ⚡
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill">SYSTEM INITIALIZATION READY</div>
        <h1 className="hero-title">
          TURN REAL-LIFE DISCIPLINE INTO AN <span className="highlight-text">S-RANK RPG</span>.
        </h1>
        <p className="hero-subtitle">
          Stop using boring habit trackers. Ascend transforms your daily gym sessions, 
          running mileage, and study hours into a high-stakes hunter progression system.
        </p>

        <div className="hero-actions">
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => onOpenAuth ? onOpenAuth('register') : onStartAwakening()}
          >
            INITIATE AWAKENING ASSESSMENT ⚔️
          </button>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="landing-pillars">
        {pillars.map((p, idx) => (
          <div key={idx} className="pillar-card">
            <div className="pillar-icon">{p.icon}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
