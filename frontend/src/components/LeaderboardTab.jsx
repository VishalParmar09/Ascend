// src/components/LeaderboardTab.jsx
import { useState, useEffect } from 'react';
import { ascendApi } from '../services/ascendApi';

const RANK_BADGE_COLORS = {
  S: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5' },
  A: { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#fdba74' },
  B: { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#d8b4fe' },
  C: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#93c5fd' },
  D: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#6ee7b7' },
  E: { bg: 'rgba(148, 163, 184, 0.2)', border: '#94a3b8', text: '#cbd5e1' },
};

// Fallback rival roster for offline / disconnected development
const OFFLINE_FALLBACK_ROSTER = [
  { position: 1, username: 'ThomasAndre', rank: 'S', level: 85, totalXp: 95000, streak: 42, combatPower: 560 },
  { position: 2, username: 'ChaHaeIn', rank: 'S', level: 64, totalXp: 52000, streak: 31, combatPower: 449 },
  { position: 3, username: 'BaekYoonho', rank: 'A', level: 48, totalXp: 26000, streak: 19, combatPower: 353 },
  { position: 4, username: 'ChoiJongIn', rank: 'A', level: 45, totalXp: 22500, streak: 14, combatPower: 357 },
  { position: 5, username: 'ShadowMonarch', rank: 'D', level: 12, totalXp: 3850, streak: 7, combatPower: 104 },
  { position: 6, username: 'PlayerOne', rank: 'E', level: 1, totalXp: 0, streak: 1, combatPower: 50 },
];

export default function LeaderboardTab({ currentHunter, isBackendConnected }) {
  const [selectedRank, setSelectedRank] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rankFilters = ['ALL', 'S', 'A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchLeaderboard() {
      if (isBackendConnected) {
        try {
          const data = await ascendApi.getLeaderboard(page, pageSize, selectedRank);
          if (isMounted) {
            setLeaderboardData(data);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.warn('Backend leaderboard fetch failed, switching to fallback:', err);
        }
      }

      // Offline / Local Fallback Mode
      if (isMounted) {
        let filtered = OFFLINE_FALLBACK_ROSTER;
        if (selectedRank !== 'ALL') {
          filtered = OFFLINE_FALLBACK_ROSTER.filter(h => h.rank === selectedRank);
        }
        const userEntry = OFFLINE_FALLBACK_ROSTER.find(h => h.username === currentHunter);
        setLeaderboardData({
          entries: filtered,
          currentPage: 0,
          totalPages: 1,
          totalHunters: filtered.length,
          myRankPosition: userEntry ? userEntry.position : null,
        });
        setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [page, selectedRank, isBackendConnected, currentHunter, pageSize]);

  function handleFilterClick(rank) {
    setSelectedRank(rank);
    setPage(0); // Reset to first page on filter change
  }

  const entries = leaderboardData?.entries || [];
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <section className="leaderboard-tab-container">
      {/* Header & Title */}
      <div className="leaderboard-header">
        <div className="leaderboard-tag">HUNTER ASSOCIATION // REGISTRY DATABASE</div>
        <h2 className="leaderboard-title">GLOBAL HUNTER RANKINGS</h2>
        <p className="leaderboard-subtitle">
          Official real-time power index synchronized across all Association monitoring gates.
        </p>
      </div>

      {/* Active User Rank Standing HUD */}
      <div className="user-standing-card">
        <div className="user-standing-left">
          <span className="user-standing-badge">YOUR STATUS</span>
          <span className="user-standing-name">{currentHunter || 'GUEST RECRUIT'}</span>
        </div>
        <div className="user-standing-right">
          <div className="standing-metric">
            <span className="metric-label">GLOBAL PLACEMENT</span>
            <span className="metric-value highlight">
              {leaderboardData?.myRankPosition ? `#${leaderboardData.myRankPosition}` : 'UNRANKED'}
            </span>
          </div>
          <div className="standing-metric">
            <span className="metric-label">TOTAL REGISTERED</span>
            <span className="metric-value">{leaderboardData?.totalHunters || 0} HUNTERS</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Shown only on first page when entries exist) */}
      {page === 0 && entries.length >= 3 && selectedRank === 'ALL' && (
        <div className="podium-container">
          {/* Rank 2 (Left / Silver) */}
          {top2 && (
            <div className="podium-card rank-2">
              <div className="podium-trophy">🥈</div>
              <div className="podium-rank-tag silver">#2 SILVER</div>
              <div className="podium-username">{top2.username}</div>
              <div className="podium-details">
                <span
                  className="hunter-pill"
                  style={{
                    backgroundColor: RANK_BADGE_COLORS[top2.rank]?.bg,
                    borderColor: RANK_BADGE_COLORS[top2.rank]?.border,
                    color: RANK_BADGE_COLORS[top2.rank]?.text,
                  }}
                >
                  [{top2.rank}-RANK]
                </span>
                <span className="podium-level">LVL {top2.level}</span>
              </div>
              <div className="podium-power">PWR {top2.combatPower}</div>
              <div className="podium-pedestal pedestal-2"></div>
            </div>
          )}

          {/* Rank 1 (Center / Gold - Tallest) */}
          {top1 && (
            <div className="podium-card rank-1">
              <div className="podium-crown">👑</div>
              <div className="podium-rank-tag gold">#1 CHAMPION</div>
              <div className="podium-username champion">{top1.username}</div>
              <div className="podium-details">
                <span
                  className="hunter-pill"
                  style={{
                    backgroundColor: RANK_BADGE_COLORS[top1.rank]?.bg,
                    borderColor: RANK_BADGE_COLORS[top1.rank]?.border,
                    color: RANK_BADGE_COLORS[top1.rank]?.text,
                  }}
                >
                  [{top1.rank}-RANK]
                </span>
                <span className="podium-level">LVL {top1.level}</span>
              </div>
              <div className="podium-power gold-text">PWR {top1.combatPower}</div>
              <div className="podium-pedestal pedestal-1"></div>
            </div>
          )}

          {/* Rank 3 (Right / Bronze) */}
          {top3 && (
            <div className="podium-card rank-3">
              <div className="podium-trophy">🥉</div>
              <div className="podium-rank-tag bronze">#3 BRONZE</div>
              <div className="podium-username">{top3.username}</div>
              <div className="podium-details">
                <span
                  className="hunter-pill"
                  style={{
                    backgroundColor: RANK_BADGE_COLORS[top3.rank]?.bg,
                    borderColor: RANK_BADGE_COLORS[top3.rank]?.border,
                    color: RANK_BADGE_COLORS[top3.rank]?.text,
                  }}
                >
                  [{top3.rank}-RANK]
                </span>
                <span className="podium-level">LVL {top3.level}</span>
              </div>
              <div className="podium-power">PWR {top3.combatPower}</div>
              <div className="podium-pedestal pedestal-3"></div>
            </div>
          )}
        </div>
      )}

      {/* Rank Filter Pills */}
      <div className="leaderboard-filter-bar">
        <span className="filter-label">LICENSE TIER:</span>
        <div className="filter-pills-group">
          {rankFilters.map(tier => (
            <button
              key={tier}
              type="button"
              className={`filter-pill-btn ${selectedRank === tier ? 'active' : ''}`}
              onClick={() => handleFilterClick(tier)}
            >
              {tier === 'ALL' ? 'ALL HUNTERS' : `${tier}-RANK`}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table-wrapper">
        {loading ? (
          <div className="leaderboard-loading">
            <span className="loading-spinner"></span>
            <span>SYNCHRONIZING ASSOCIATION REGISTRY...</span>
          </div>
        ) : error ? (
          <div className="leaderboard-error">{error}</div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-empty">
            No hunters found registered under Tier [{selectedRank}].
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="col-pos">RANK</th>
                <th className="col-hunter">HUNTER CODENAME</th>
                <th className="col-tier">LICENSE</th>
                <th className="col-level">LEVEL</th>
                <th className="col-power">COMBAT PWR</th>
                <th className="col-streak">STREAK</th>
                <th className="col-xp">TOTAL XP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(hunter => {
                const isMe = hunter.username === currentHunter;
                const badge = RANK_BADGE_COLORS[hunter.rank] || RANK_BADGE_COLORS.E;

                return (
                  <tr key={hunter.username} className={`leaderboard-row ${isMe ? 'my-row' : ''}`}>
                    <td className="col-pos">
                      <span className={`position-badge ${hunter.position <= 3 ? `top-${hunter.position}` : ''}`}>
                        #{hunter.position}
                      </span>
                    </td>
                    <td className="col-hunter">
                      <div className="hunter-name-cell">
                        <span className="hunter-row-name">{hunter.username}</span>
                        {isMe && <span className="you-indicator">YOU</span>}
                      </div>
                    </td>
                    <td className="col-tier">
                      <span
                        className="hunter-pill"
                        style={{
                          backgroundColor: badge.bg,
                          borderColor: badge.border,
                          color: badge.text,
                        }}
                      >
                        [{hunter.rank}-RANK]
                      </span>
                    </td>
                    <td className="col-level">
                      <span className="level-badge">LVL {hunter.level}</span>
                    </td>
                    <td className="col-power">
                      <span className="power-val">{hunter.combatPower}</span>
                    </td>
                    <td className="col-streak">
                      <span className="streak-val">🔥 {hunter.streak}d</span>
                    </td>
                    <td className="col-xp">
                      <span className="xp-val">{hunter.totalXp.toLocaleString()} XP</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {leaderboardData && leaderboardData.totalPages > 1 && (
        <div className="leaderboard-pagination">
          <button
            type="button"
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            ◀ PREVIOUS
          </button>
          <span className="pagination-info">
            PAGE {leaderboardData.currentPage + 1} OF {leaderboardData.totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            disabled={page >= leaderboardData.totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            NEXT ▶
          </button>
        </div>
      )}
    </section>
  );
}