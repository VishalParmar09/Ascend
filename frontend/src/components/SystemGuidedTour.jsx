// src/components/SystemGuidedTour.jsx
import { useState, useEffect, useRef } from 'react';

export default function SystemGuidedTour({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState(null);
  const tooltipRef = useRef(null);

  const tourSteps = [
    {
      targetId: 'tour-hud',
      title: '1. Hunter Status & Ranks',
      desc: 'Your character sheet. Tracks your Level, current Hunter Rank (E to S), and EXP curve. Leveling up requires progressively more discipline.',
      position: 'bottom'
    },
    {
      targetId: 'tour-attributes',
      title: '2. Core Attributes (STR, AGI, VIT, INT, PER)',
      desc: 'Your physical and mental baseline ratings. These attributes level up through real-life workouts, habits, and Rank Promotion Dungeons.',
      position: 'bottom' // Placed below so stats are 100% visible!
    },
    {
      targetId: 'tour-streak',
      title: '3. Hunter Streak Multiplier',
      desc: 'Consistency is everything. Clear ALL daily quests in a single day to increase your streak. If midnight passes without completing them, your streak resets!',
      position: 'bottom'
    },
    {
      targetId: 'tour-quests',
      title: '4. Daily Quests Board',
      desc: 'Your daily missions. Click "COMPLETE" after finishing your workout or study session to harvest EXP and advance your Hunter Level.',
      position: 'top' // Placed cleanly above the panel with zero overlap!
    },
    {
      targetId: 'tour-eval-tab',
      title: '5. Rank Advancement Dungeons',
      desc: 'Reaching milestone levels (Level 10, 25, 50) unlocks Promotion Exams. Pass the physical benchmarks to break through into higher Hunter Tiers!',
      position: 'bottom'
    }
  ];

  const step = tourSteps[currentStep];

  useEffect(() => {
    function calculatePosition() {
      const el = document.getElementById(step.targetId);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const rect = el.getBoundingClientRect();
      const target = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX,
      };

      // Measure actual rendered tooltip dimensions
      const tooltipWidth = tooltipRef.current ? tooltipRef.current.offsetWidth : 360;
      const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 230;

      const targetCenterX = target.left + target.width / 2;

      // 1. Horizontal Calculation
      let left = targetCenterX - tooltipWidth / 2;

      // If target is far to the right (like the streak badge), align right edges!
      if (target.right > window.innerWidth - 150) {
        left = target.right - tooltipWidth;
      }

      // Clamp within screen boundaries
      left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

      // 2. Arrow Horizontal Position (points directly at target center)
      let arrowX = targetCenterX - left;
      arrowX = Math.max(20, Math.min(tooltipWidth - 28, arrowX));

      // 3. Vertical Calculation (100% overlap-free)
      let top = 0;
      let actualPosition = step.position;

      if (actualPosition === 'bottom') {
        top = target.bottom + 16;
      } else {
        // 'top' position: bottom of tooltip sits 16px above target top!
        top = target.top - tooltipHeight - 16;
        // Safety: If not enough room at the top of the screen, flip to bottom
        if (top < window.scrollY + 10) {
          top = target.bottom + 16;
          actualPosition = 'bottom';
        }
      }

      setCoords({
        target,
        tooltip: { top, left, arrowX, position: actualPosition }
      });
    }

    // Measure immediately, and once more after smooth scroll settles
    calculatePosition();
    const timer = setTimeout(calculatePosition, 320);

    window.addEventListener('resize', calculatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [currentStep, step.targetId, step.position]);

  return (
    <div className="tour-overlay-root">
      {/* 1. Glowing Spotlight Cutout around the Target Element */}
      {coords && (
        <div 
          className="tour-spotlight-box"
          style={{
            top: `${coords.target.top - 8}px`,
            left: `${coords.target.left - 8}px`,
            width: `${coords.target.width + 16}px`,
            height: `${coords.target.height + 16}px`,
          }}
        />
      )}

      {/* 2. Floating Holographic Tooltip with Pointer Arrow */}
      {coords && (
        <div 
          ref={tooltipRef}
          className={`tour-tooltip ${coords.tooltip.position}`}
          style={{
            top: `${coords.tooltip.top}px`,
            left: `${coords.tooltip.left}px`,
          }}
        >
          {/* Glowing Arrow pointing to target */}
          <div 
            className="tour-tooltip-arrow" 
            style={{ left: `${coords.tooltip.arrowX}px` }}
          />

          <div className="tour-tooltip-tag">SYSTEM TUTORIAL // STEP {currentStep + 1} OF {tourSteps.length}</div>
          <h4 className="tour-tooltip-title">{step.title}</h4>
          <p className="tour-tooltip-desc">{step.desc}</p>

          <div className="tour-tooltip-actions">
            <button className="tour-skip-btn" onClick={onClose}>
              Skip Tour
            </button>

            <div className="tour-nav-btns">
              {currentStep > 0 && (
                <button className="tour-btn-prev" onClick={() => setCurrentStep(prev => prev - 1)}>
                  ← Prev
                </button>
              )}

              {currentStep < tourSteps.length - 1 ? (
                <button className="tour-btn-next" onClick={() => setCurrentStep(prev => prev + 1)}>
                  Next Step →
                </button>
              ) : (
                <button className="tour-btn-finish" onClick={onClose}>
                  GOT IT // ENTER SYSTEM ⚔️
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}