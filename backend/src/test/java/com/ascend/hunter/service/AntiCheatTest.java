package com.ascend.hunter.service;

import com.ascend.hunter.dto.RecalibrateRequest;
import com.ascend.hunter.dto.WorkoutLogRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.exception.AntiCheatException;
import com.ascend.hunter.repository.HunterRepository;
import com.ascend.hunter.repository.QuestRepository;
import com.ascend.hunter.repository.WorkoutLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AntiCheatTest {

    @Mock
    private HunterRepository hunterRepository;

    @Mock
    private WorkoutLogRepository workoutLogRepository;

    @Mock
    private QuestRepository questRepository;

    @Mock
    private QuestService questService;

    @InjectMocks
    private HunterService hunterService;

    private WorkoutService workoutService;

    private Hunter testHunter;

    @BeforeEach
    void setUp() {
        workoutService = new WorkoutService(workoutLogRepository, questRepository, questService, hunterService);

        testHunter = Hunter.builder()
                .id(1L)
                .username("ShadowMonarch")
                .rank(HunterRank.E)
                .strength(10)
                .agility(10)
                .vitality(10)
                .intelligence(10)
                .perception(10)
                .build();
    }

    @Test
    @DisplayName("Physiological Anti-Cheat: Reject impossible tempo (10 sets in 15 seconds)")
    void shouldRejectPhysiologicallyImpossibleTempo() {
        when(hunterRepository.findByUsername("ShadowMonarch")).thenReturn(Optional.of(testHunter));

        WorkoutLogRequest impossibleRequest = new WorkoutLogRequest(
                "Super Speed Exploit",
                15,  // 15 seconds total
                10,  // 10 sets claimed! (requires at least 100 seconds)
                10,
                500, // Client attempting to dictate 500 XP
                "exploit_key_1"
        );

        AntiCheatException ex = assertThrows(AntiCheatException.class, () ->
                workoutService.logWorkout("ShadowMonarch", impossibleRequest)
        );

        assertTrue(ex.getMessage().contains("Physiologically impossible tempo"));
    }

    @Test
    @DisplayName("Physiological Anti-Cheat: Reject excessive set volume (>60 sets)")
    void shouldRejectExcessiveSets() {
        when(hunterRepository.findByUsername("ShadowMonarch")).thenReturn(Optional.of(testHunter));

        WorkoutLogRequest massiveRequest = new WorkoutLogRequest(
                "Unbounded Sets Exploit",
                3600,
                75,  // >60 sets
                75,
                100,
                "exploit_key_2"
        );

        AntiCheatException ex = assertThrows(AntiCheatException.class, () ->
                workoutService.logWorkout("ShadowMonarch", massiveRequest)
        );

        assertTrue(ex.getMessage().contains("exceeds maximum physiological set threshold"));
    }

    @Test
    @DisplayName("Rank Cap Anti-Cheat: Reject E-Rank hunter exceeding stat threshold (STR 50 > cap 25)")
    void shouldRejectStatExceedingRankCap() {
        when(hunterRepository.findByUsername("ShadowMonarch")).thenReturn(Optional.of(testHunter));

        RecalibrateRequest hackedRecalibrate = new RecalibrateRequest(
                HunterRank.E,
                50, // STR 50 exceeds E-Rank max cap of 25!
                15,
                15,
                15,
                15
        );

        AntiCheatException ex = assertThrows(AntiCheatException.class, () ->
                hunterService.recalibrate("ShadowMonarch", hackedRecalibrate)
        );

        assertTrue(ex.getMessage().contains("exceeds maximum authorization cap"));
    }

    @Test
    @DisplayName("Rank Cap Anti-Cheat: Permit valid stat calibration within rank license boundaries")
    void shouldPermitValidStatCalibration() {
        when(hunterRepository.findByUsername("ShadowMonarch")).thenReturn(Optional.of(testHunter));
        when(hunterRepository.save(any(Hunter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecalibrateRequest legitRecalibrate = new RecalibrateRequest(
                HunterRank.E,
                18, // Legitimate STR for E-Rank
                15,
                15,
                12,
                12
        );

        assertDoesNotThrow(() ->
                hunterService.recalibrate("ShadowMonarch", legitRecalibrate)
        );

        assertEquals(18, testHunter.getStrength());
    }
}
