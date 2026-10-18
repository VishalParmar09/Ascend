export function getHunterRank(level) {
  if (level >= 90) return { rank: 'S', label: 'S-Rank Hunter', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' };
  if (level >= 76) return { rank: 'A', label: 'A-Rank Hunter', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' };
  if (level >= 51) return { rank: 'B', label: 'B-Rank Hunter', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' };
  if (level >= 26) return { rank: 'C', label: 'C-Rank Hunter', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' };
  if (level >= 11) return { rank: 'D', label: 'D-Rank Hunter', color: '#fb923c', glow: 'rgba(251, 146, 60, 0.6)' };
  return { rank: 'E', label: 'E-Rank Hunter', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' };
}

export function calculateLevelProgress(totalXP) {
  let level = 1;
  let xpForNextLevel = 500;
  let xpRemaining = totalXP;

  while (xpRemaining >= xpForNextLevel) {
    xpRemaining -= xpForNextLevel;
    level += 1;
    xpForNextLevel = 500 + (level - 1) * 250;
  }

  const currentXP = xpRemaining;
  const remainingXP = xpForNextLevel - currentXP;
  const progress = (currentXP / xpForNextLevel) * 100;

  return { level, xpForNextLevel, currentXP, remainingXP, progress };
}