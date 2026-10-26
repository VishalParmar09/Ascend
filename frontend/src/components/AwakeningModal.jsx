// src/components/AwakeningModal.jsx
import { useState } from 'react';
import { calculateAwakenedStats } from '../utils/calibrationMath';

export default function AwakeningModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);

  // Form State (Strings for height/weight to prevent the 060 backspace bug!)
  const [answers, setAnswers] = useState({
    gender: 'male',
    goal: 'aesthetic',
    pushups: 'intermediate',
    cardio: 'moderate',
    mentalFocus: 'moderate',
    height: '175',
    heightUnit: 'cm', // 'cm' | 'ft'
    weight: '70',
    weightUnit: 'kg', // 'kg' | 'lbs'
  });

  const [result, setResult] = useState(null);

  // Step 1: Gender & Identity
  const genderOptions = [
    { id: 'male', label: 'Male Hunter', icon: '⚡' },
    { id: 'female', label: 'Female Hunter', icon: '✨' },
    { id: 'other', label: 'Non-Binary / Other', icon: '⚔️' },
  ];

  // Step 2: Primary Fitness Objective
  const goalOptions = [
    { id: 'aesthetic', title: 'Athletic & Aesthetic (Lean Muscle)', desc: 'Build functional agility, sharp definition, and a Jin-woo physique' },
    { id: 'strength', title: 'Maximum Strength & Mass', desc: 'Heavy lifting, pure muscle hypertrophy, and size' },
    { id: 'fatloss', title: 'Fat Loss & Conditioning', desc: 'Burn calories, enhance stamina, and strip body fat' },
    { id: 'health', title: 'Healthy Student Routine', desc: 'Maintain energy, fix posture, and stay active without an extreme diet' },
  ];

  // Step 3: Push-ups (No stat spoilers!)
  const pushupOptions = [
    { id: 'beginner', title: '0 – 5 Push-ups', desc: 'Currently building foundational upper-body strength' },
    { id: 'intermediate', title: '10 – 25 Push-ups', desc: 'Can perform clean sets with consistent form' },
    { id: 'advanced', title: '30 – 50 Push-ups', desc: 'High muscular endurance and pressing power' },
    { id: 'elite', title: '50+ Push-ups', desc: 'Elite bodyweight control and calisthenics capacity' },
  ];

  // Step 4: Cardio (No stat spoilers!)
  const cardioOptions = [
    { id: 'sedentary', title: 'Under 1 km', desc: 'Rarely run; get out of breath quickly' },
    { id: 'moderate', title: '1 – 3 km Continuous', desc: 'Can sustain a light jog or brisk pace' },
    { id: 'runner', title: '5 – 10 km Comfortably', desc: 'Regular runner with solid lung endurance' },
    { id: 'athlete', title: '10+ km / High Pace', desc: 'Competitive runner or endurance athlete' },
  ];

  // Step 5: Mental Focus (No stat spoilers!)
  const mentalOptions = [
    { id: 'low', title: 'Under 1 Hour / Day', desc: 'Easily distracted; struggle with prolonged focus' },
    { id: 'moderate', title: '1 – 2 Hours / Day', desc: 'Consistent focus for college classes or tasks' },
    { id: 'high', title: '3 – 5 Hours / Day', desc: 'High cognitive stamina; regular coding or reading' },
    { id: 'scholar', title: '6+ Hours / Day', desc: 'Intense deep work, competitive study, or research' },
  ];

  function handleCalculate() {
    const calc = calculateAwakenedStats(answers);
    setResult(calc);
    setStep(7); // Final reveal step
  }

  function handleFinalConfirm() {
    if (result) {
      onComplete(result);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="calibration-modal">
        
        {/* Header */}
        <div className="calibration-header">
          <div>
            <span className="calibration-tag">SYSTEM CALIBRATION PROTOCOL</span>
            <h2 className="calibration-title">
              {step < 7 ? `PHASE ${step}: SYSTEM ASSESSMENT` : 'AWAKENING COMPLETE'}
            </h2>
          </div>
          <span className="step-counter">
            {step < 7 ? `STEP ${step} OF 6` : 'VERIFICATION'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="calibration-progress-track">
          <div 
            className="calibration-progress-fill" 
            style={{ width: `${(step / 7) * 100}%` }} 
          />
        </div>

        {/* ================= STEP 1: GENDER ================= */}
        {step === 1 && (
          <div className="step-content">
            <h3 className="step-heading">Step 1: Hunter Identity</h3>
            <p className="step-subtext">Used by the System to calculate BMR and recovery baselines.</p>

            <div className="option-grid">
              {genderOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${answers.gender === opt.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, gender: opt.id })}
                >
                  <div className="opt-title">{opt.icon} {opt.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 2: GOAL ================= */}
        {step === 2 && (
          <div className="step-content">
            <h3 className="step-heading">Step 2: Primary Training Directive</h3>
            <p className="step-subtext">What physique or capability are you training to achieve?</p>

            <div className="option-grid">
              {goalOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${answers.goal === opt.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, goal: opt.id })}
                >
                  <div className="opt-title">{opt.title}</div>
                  <div className="opt-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 3: PUSH-UPS ================= */}
        {step === 3 && (
          <div className="step-content">
            <h3 className="step-heading">Step 3: Upper-Body Push Strength</h3>
            <p className="step-subtext">How many consecutive, clean push-ups can you perform right now?</p>

            <div className="option-grid">
              {pushupOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${answers.pushups === opt.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, pushups: opt.id })}
                >
                  <div className="opt-title">{opt.title}</div>
                  <div className="opt-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 4: CARDIO ================= */}
        {step === 4 && (
          <div className="step-content">
            <h3 className="step-heading">Step 4: Continuous Running Endurance</h3>
            <p className="step-subtext">How far can you run without walking or taking a break?</p>

            <div className="option-grid">
              {cardioOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${answers.cardio === opt.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, cardio: opt.id })}
                >
                  <div className="opt-title">{opt.title}</div>
                  <div className="opt-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 5: MENTAL FOCUS ================= */}
        {step === 5 && (
          <div className="step-content">
            <h3 className="step-heading">Step 5: Daily Cognitive Focus & Study</h3>
            <p className="step-subtext">How many hours of daily uninterrupted deep work, coding, or reading?</p>

            <div className="option-grid">
              {mentalOptions.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${answers.mentalFocus === opt.id ? 'selected' : ''}`}
                  onClick={() => setAnswers({ ...answers, mentalFocus: opt.id })}
                >
                  <div className="opt-title">{opt.title}</div>
                  <div className="opt-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 6: HEIGHT & WEIGHT WITH UNIT TOGGLES ================= */}
        {step === 6 && (
          <div className="step-content">
            <h3 className="step-heading">Step 6: Physical Vessel Metrics</h3>
            <p className="step-subtext">Used to calculate your starting BMI and volume capacity.</p>

            <div className="metrics-form">
              {/* Height Field */}
              <div className="metric-field">
                <div className="metric-label-row">
                  <label>HEIGHT</label>
                  <div className="unit-toggle">
                    <button 
                      type="button"
                      className={answers.heightUnit === 'cm' ? 'active' : ''}
                      onClick={() => setAnswers({ ...answers, heightUnit: 'cm', height: '175' })}
                    >
                      CM
                    </button>
                    <button 
                      type="button"
                      className={answers.heightUnit === 'ft' ? 'active' : ''}
                      onClick={() => setAnswers({ ...answers, heightUnit: 'ft', height: '5.8' })}
                    >
                      FT
                    </button>
                  </div>
                </div>
                <input 
                  type="number"
                  step="any"
                  value={answers.height}
                  onChange={(e) => setAnswers({ ...answers, height: e.target.value })}
                  placeholder={answers.heightUnit === 'cm' ? '175' : '5.9'}
                />
              </div>

              {/* Weight Field */}
              <div className="metric-field">
                <div className="metric-label-row">
                  <label>BODY WEIGHT</label>
                  <div className="unit-toggle">
                    <button 
                      type="button"
                      className={answers.weightUnit === 'kg' ? 'active' : ''}
                      onClick={() => setAnswers({ ...answers, weightUnit: 'kg', weight: '70' })}
                    >
                      KG
                    </button>
                    <button 
                      type="button"
                      className={answers.weightUnit === 'lbs' ? 'active' : ''}
                      onClick={() => setAnswers({ ...answers, weightUnit: 'lbs', weight: '154' })}
                    >
                      LBS
                    </button>
                  </div>
                </div>
                <input 
                  type="number"
                  step="any"
                  value={answers.weight}
                  onChange={(e) => setAnswers({ ...answers, weight: e.target.value })}
                  placeholder={answers.weightUnit === 'kg' ? '70' : '155'}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: RESULTS REVEAL ================= */}
        {step === 7 && result && (
          <div className="step-content results-view">
            <div className="awakening-badge">⚡ AWAKENING COMPLETE</div>
            <h3 className="results-title">Your Hunter Attributes Have Been Evaluated</h3>
            <p className="step-subtext">
              Body Profile: <strong>{result.profile.bmi} BMI</strong> ({result.profile.bmiCategory})
            </p>

            <div className="calculated-stats-row">
              <div className="stat-pill"><span className="tag">STR</span><strong>{result.stats.strength}</strong></div>
              <div className="stat-pill"><span className="tag">AGI</span><strong>{result.stats.agility}</strong></div>
              <div className="stat-pill"><span className="tag">VIT</span><strong>{result.stats.vitality}</strong></div>
              <div className="stat-pill"><span className="tag">INT</span><strong>{result.stats.intelligence}</strong></div>
              <div className="stat-pill"><span className="tag">PER</span><strong>{result.stats.perception}</strong></div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="calibration-footer">
          {step > 1 && step < 7 && (
            <button className="cal-btn-back" onClick={() => setStep(step - 1)}>
              ← PREVIOUS
            </button>
          )}

          {step < 6 && (
            <button className="cal-btn-next" onClick={() => setStep(step + 1)}>
              PROCEED →
            </button>
          )}

          {step === 6 && (
            <button 
              className="cal-btn-next" 
              onClick={handleCalculate}
              disabled={!answers.height || !answers.weight}
            >
              CALCULATE ATTRIBUTES ⚡
            </button>
          )}

          {step === 7 && (
            <button className="cal-btn-confirm" onClick={handleFinalConfirm}>
              ENTER THE SYSTEM ⚔️
            </button>
          )}

          {onClose && (
            <button className="cal-btn-cancel" onClick={onClose}>
              Dismiss
            </button>
          )}
        </div>

      </div>
    </div>
  );
}