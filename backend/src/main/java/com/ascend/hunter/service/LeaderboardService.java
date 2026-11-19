package com.ascend.hunter.service;

import com.ascend.hunter.dto.LeaderboardEntryDto;
import com.ascend.hunter.dto.LeaderboardPageResponse;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.repository.HunterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final HunterRepository hunterRepository;

    @Transactional(readOnly = true)
    public LeaderboardPageResponse getLeaderboard(int page, int size, HunterRank rankFilter, String activeUsername) {
        // Enforce safe page boundaries (minimum 1, maximum 50 per page)
        int clampedSize = Math.max(1, Math.min(size, 50));
        int clampedPage = Math.max(0, page);
        Pageable pageable = PageRequest.of(clampedPage, clampedSize);

        Page<Hunter> hunterPage;
        if (rankFilter != null) {
            hunterPage = hunterRepository.findByRankOrderByLevelDescTotalXpDescStreakDesc(rankFilter, pageable);
        } else {
            hunterPage = hunterRepository.findAllByOrderByLevelDescTotalXpDescStreakDesc(pageable);
        }

        // Calculate 1-based leaderboard starting position for the current page
        long startPosition = (long) clampedPage * clampedSize + 1;
        List<LeaderboardEntryDto> entries = new ArrayList<>();

        for (int i = 0; i < hunterPage.getContent().size(); i++) {
            Hunter h = hunterPage.getContent().get(i);
            int combatPower = h.getStrength() + h.getAgility() + h.getVitality() + h.getIntelligence() + h.getPerception();

            entries.add(LeaderboardEntryDto.builder()
                    .position(startPosition + i)
                    .username(h.getUsername())
                    .rank(h.getRank())
                    .level(h.getLevel())
                    .totalXp(h.getTotalXp())
                    .streak(h.getStreak())
                    .combatPower(combatPower)
                    .build());
        }

        // Resolve current user's personal global rank position
        Long myPosition = null;
        if (activeUsername != null && !activeUsername.isBlank()) {
            myPosition = hunterRepository.findByUsername(activeUsername)
                    .map(me -> hunterRepository.calculateGlobalRankPosition(me.getLevel(), me.getTotalXp()))
                    .orElse(null);
        }

        return LeaderboardPageResponse.builder()
                .entries(entries)
                .currentPage(hunterPage.getNumber())
                .totalPages(hunterPage.getTotalPages())
                .totalHunters(hunterPage.getTotalElements())
                .myRankPosition(myPosition)
                .build();
    }
}