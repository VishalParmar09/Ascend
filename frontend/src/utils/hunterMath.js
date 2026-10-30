export const RANK_METADATA = {
  S: { rank: 'S', label: 'S-Rank Hunter', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' },
  A: { rank: 'A', label: 'A-Rank Hunter', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' },
  B: { rank: 'B', label: 'B-Rank Hunter', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' },
  C: { rank: 'C', label: 'C-Rank Hunter', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' },
  D: { rank: 'D', label: 'D-Rank Hunter', color: '#fb923c', glow: 'rgba(251, 146, 60, 0.6)' },
  E: { rank: 'E', label: 'E-Rank Hunter', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' },
};

export function getHunterRank(level, officialRank = 'E') {
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  
  let levelRank = 'E';
  if (level >= 90) levelRank = 'S';
  else if (level >= 76) levelRank = 'A';
  else if (level >= 51) levelRank = 'B';
  else if (level >= 26) levelRank = 'C';
  else if (level >= 11) levelRank = 'D';

  const officialIdx = rankOrder.indexOf(officialRank) >= 0 ? rankOrder.indexOf(officialRank) : 0;
  const levelIdx = rankOrder.indexOf(levelRank);

  const highestRankKey = rankOrder[Math.max(officialIdx, levelIdx)];
  return RANK_METADATA[highestRankKey] || RANK_METADATA.E;
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