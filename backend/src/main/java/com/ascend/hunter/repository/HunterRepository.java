package com.ascend.hunter.repository;

import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HunterRepository extends JpaRepository<Hunter, Long> {
    Optional<Hunter> findByUsername(String username);

    Optional<Hunter> findByEmail(String email);

    @Query("SELECT h FROM Hunter h WHERE h.username = :identifier OR h.email = :identifier")
    Optional<Hunter> findByUsernameOrEmail(@Param("identifier") String identifier);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Global Leaderboard: All hunters ordered by Level DESC, then Total XP DESC,
    // then Streak DESC
    Page<Hunter> findAllByOrderByLevelDescTotalXpDescStreakDesc(Pageable pageable);

    // Filtered Leaderboard: By HunterRank tier (S, A, B, etc.)
    Page<Hunter> findByRankOrderByLevelDescTotalXpDescStreakDesc(HunterRank rank, Pageable pageable);

    // Mathematical Rank Calculation: How many hunters outrank this level & XP?
    @Query("SELECT COUNT(h) + 1 FROM Hunter h WHERE h.level > :level OR (h.level = :level AND h.totalXp > :xp)")
    Long calculateGlobalRankPosition(@Param("level") int level, @Param("xp") int xp);
}
