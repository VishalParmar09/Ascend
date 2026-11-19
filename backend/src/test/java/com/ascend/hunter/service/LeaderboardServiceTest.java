package com.ascend.hunter.service;

import com.ascend.hunter.dto.LeaderboardPageResponse;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.repository.HunterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private HunterRepository hunterRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    private Hunter thomasAndre;
    private Hunter shadowMonarch;

    @BeforeEach
    void setUp() {
        thomasAndre = Hunter.builder()
                .id(1L)
                .username("ThomasAndre")
                .rank(HunterRank.S)
                .level(85)
                .totalXp(95000)
                .streak(42)
                .strength(120)
                .agility(110)
                .vitality(130)
                .intelligence(95)
                .perception(105)
                .build();

        shadowMonarch = Hunter.builder()
                .id(2L)
                .username("ShadowMonarch")
                .rank(HunterRank.D)
                .level(12)
                .totalXp(3850)
                .streak(7)
                .strength(28)
                .agility(22)
                .vitality(20)
                .intelligence(16)
                .perception(18)
                .build();
    }

    @Test
    @DisplayName("Leaderboard: Return paginated results with correctly computed combat power")
    void shouldReturnPaginatedGlobalLeaderboardWithCombatPower() {
        Pageable pageable = PageRequest.of(0, 15);
        when(hunterRepository.findAllByOrderByLevelDescTotalXpDescStreakDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(thomasAndre, shadowMonarch), pageable, 2));

        LeaderboardPageResponse response = leaderboardService.getLeaderboard(0, 15, null, null);

        assertNotNull(response);
        assertEquals(2, response.getEntries().size());
        assertEquals(1, response.getEntries().get(0).getPosition());
        assertEquals("ThomasAndre", response.getEntries().get(0).getUsername());
        // Combat power: 120 + 110 + 130 + 95 + 105 = 560
        assertEquals(560, response.getEntries().get(0).getCombatPower());

        assertEquals(2, response.getEntries().get(1).getPosition());
        assertEquals("ShadowMonarch", response.getEntries().get(1).getUsername());
        // Combat power: 28 + 22 + 20 + 16 + 18 = 104
        assertEquals(104, response.getEntries().get(1).getCombatPower());

        assertNull(response.getMyRankPosition(), "Visitor should have null personal rank");
    }

    @Test
    @DisplayName("Leaderboard: Calculate personal rank position for authenticated hunter")
    void shouldCalculateMyRankPositionForAuthenticatedHunter() {
        Pageable pageable = PageRequest.of(0, 15);
        when(hunterRepository.findAllByOrderByLevelDescTotalXpDescStreakDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(thomasAndre, shadowMonarch), pageable, 2));
        when(hunterRepository.findByUsername("ShadowMonarch")).thenReturn(Optional.of(shadowMonarch));
        when(hunterRepository.calculateGlobalRankPosition(12, 3850)).thenReturn(4L);

        LeaderboardPageResponse response = leaderboardService.getLeaderboard(0, 15, null, "ShadowMonarch");

        assertNotNull(response);
        assertEquals(4L, response.getMyRankPosition());
    }

    @Test
    @DisplayName("Leaderboard: Filter entries by HunterRank tier (S-Rank)")
    void shouldFilterByRankTier() {
        Pageable pageable = PageRequest.of(0, 15);
        when(hunterRepository.findByRankOrderByLevelDescTotalXpDescStreakDesc(eq(HunterRank.S), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(thomasAndre), pageable, 1));

        LeaderboardPageResponse response = leaderboardService.getLeaderboard(0, 15, HunterRank.S, null);

        assertNotNull(response);
        assertEquals(1, response.getEntries().size());
        assertEquals("ThomasAndre", response.getEntries().get(0).getUsername());
        assertEquals(HunterRank.S, response.getEntries().get(0).getRank());
        verify(hunterRepository, times(1)).findByRankOrderByLevelDescTotalXpDescStreakDesc(eq(HunterRank.S),
                any(Pageable.class));
        verify(hunterRepository, never()).findAllByOrderByLevelDescTotalXpDescStreakDesc(any(Pageable.class));
    }
}