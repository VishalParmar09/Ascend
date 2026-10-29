// src/utils/soundEffects.js

/**
 * Native Web Audio API sound generator for Ascend HUD
 * Synthesizes sci-fi holographic chimes without external audio assets.
 */

function getAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
  } catch (e) {
    return null;
  }
}

// 1. High-tech Set Complete Blip
export function playSetCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.08); // G5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Autoplay policy fallback
  }
}

// 2. Tactical Rest Timer Complete Chime (D5 -> A5 double pulse)
export function playRestTimerCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.24); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start();
    osc.stop(now + 0.45);
  } catch (e) {
    // Autoplay policy fallback
  }
}

// 3. Dungeon Cleared Victory Fanfare
export function playVictoryFanfareSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 440, t: 0.0 }, // A4
      { f: 554.37, t: 0.12 }, // C#5
      { f: 659.25, t: 0.24 }, // E5
      { f: 880, t: 0.38 } // A5
    ];

    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);

      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    });
  } catch (e) {
    // Autoplay policy fallback
  }
}
