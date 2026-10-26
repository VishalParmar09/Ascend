// src/components/SystemWalkthroughModal.jsx
import { useState } from 'react';

export default function SystemWalkthroughModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [slide, setSlide] = useState(1);

    const slides = [
        {
            step: 1,
            tag: 'SYSTEM PROTOCOL // RULE 1',
            title: 'Hunter Ranks & Progression',
            icon: '📊',
            content: 'You begin as an E-Rank Hunter. Every workout, study session, and habit completed awards EXP. As your level rises, your Hunter Rank will scale all the way to S-Rank, unlocking glowing aura titles and prestige.'
        },
        {
            step: 2,
            tag: 'SYSTEM PROTOCOL // RULE 2',
            title: 'Daily Quests & Discipline',
            icon: '📜',
            content: 'Every morning at local midnight, The System assigns daily physical and mental quests. Complete them to earn EXP and level up your core attributes: STR, AGI, VIT, INT, and PER.'
        },
        {
            step: 3,
            tag: 'SYSTEM PROTOCOL // RULE 3',
            title: 'The Midnight Deadline & Penalties',
            icon: '⚠️',
            content: 'Discipline has high stakes. If mandatory daily quests are not cleared before 00:00 midnight, The System flags your account and issues a mandatory Penalty Survival Challenge.'
        },
        {
            step: 4,
            tag: 'SYSTEM PROTOCOL // RULE 4',
            title: 'Streaks & Promotion Dungeons',
            icon: '🔥',
            content: 'Clear ALL daily quests in a single day to increase your active Hunter Streak. Reaching milestone levels (Level 10, 25, 50) unlocks the Hunter Association Rank Advancement Dungeons.'
        }
    ];

    const current = slides[slide - 1];

    return (
        <div className="modal-backdrop">
            <div className="walkthrough-modal">
                <div className="walkthrough-header">
                    <span className="walkthrough-tag">{current.tag}</span>
                    <span className="walkthrough-counter">{slide} / 4</span>
                </div>

                <div className="walkthrough-body">
                    <div className="walkthrough-icon">{current.icon}</div>
                    <h2 className="walkthrough-title">{current.title}</h2>
                    <p className="walkthrough-desc">{current.content}</p>
                </div>

                <div className="walkthrough-footer">
                    <button className="walkthrough-skip" onClick={onClose}>
                        Skip Briefing
                    </button>

                    {slide < 4 ? (
                        <button className="walkthrough-next" onClick={() => setSlide(slide + 1)}>
                            CONTINUE →
                        </button>
                    ) : (
                        <button className="walkthrough-confirm" onClick={onClose}>
                            I UNDERSTAND THE RULES // ENTER SYSTEM ⚔️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}