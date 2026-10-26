// src/components/SystemGuidedTour.jsx
import { useState, useEffect } from 'react';

export default function SystemGuidedTour({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

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
            position: 'top'
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
            position: 'top'
        },
        {
            targetId: 'tour-eval-tab',
            title: '5. Rank Advancement Dungeons',
            desc: 'Reaching milestone levels (Level 10, 25, 50) unlocks Promotion Exams. Pass the physical benchmarks to break through into higher Hunter Tiers!',
            position: 'bottom'
        }
    ];

    const step = tourSteps[currentStep];

    // Update target bounding box and auto-scroll
    useEffect(() => {
        function updatePosition() {
            const el = document.getElementById(step.targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const rect = el.getBoundingClientRect();
                setTargetRect({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom + window.scrollY
                });
            }
        }

        // Small delay to allow smooth scroll and layout
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [currentStep, step.targetId]);

    return (
        <div className="tour-overlay-root">
            {/* 1. Spotlight Cutout Box over the Target Element */}
            {targetRect && (
                <div
                    className="tour-spotlight-box"
                    style={{
                        top: `${targetRect.top - 8}px`,
                        left: `${targetRect.left - 8}px`,
                        width: `${targetRect.width + 16}px`,
                        height: `${targetRect.height + 16}px`,
                    }}
                />
            )}

            {/* 2. Floating Holographic Tooltip */}
            {targetRect && (
                <div
                    className={`tour-tooltip ${step.position}`}
                    style={{
                        top: step.position === 'bottom'
                            ? `${targetRect.bottom + 20}px`
                            : `${Math.max(10, targetRect.top - 180)}px`,
                        left: `${Math.max(16, Math.min(window.innerWidth - 360, targetRect.left))}px`
                    }}
                >
                    <div className="tour-tooltip-arrow" />
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