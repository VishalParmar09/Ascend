package com.ascend.hunter.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.AllocateStatRequest;
import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.RecalibrateRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.exception.AntiCheatException;
import com.ascend.hunter.repository.HunterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HunterService {

    private final HunterRepository hunterRepository;

    @Transactional(readOnly = true)
    public Hunter getHunter(String username) {
        return hunterRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Hunter not found with username: " + username));
    }

    @Transactional
    public Hunter getOrCreateHunter(String username) {
        return hunterRepository.findByUsername(username)
                .orElseGet(() -> {
                    Hunter newHunter = Hunter.builder()
                            .username(username)
                            .rank(HunterRank.E)
                            .level(1)
                            .totalXp(0)
                            .streak(1)
                            .lastActiveDate(LocalDate.now())
                            .strength(10)
                            .agility(10)
                            .vitality(10)
                            .intelligence(10)
                            .perception(10)
                            .availablePoints(5)
                            .build();
                    return hunterRepository.save(newHunter);
                });
    }

    @Transactional(readOnly = true)
    public HunterProfileDto getProfile(String username) {
        Hunter hunter = getHunter(username);
        return mapToDto(hunter);
    }

    @Transactional
    public HunterProfileDto addXp(String username, int xpAmount) {
        Hunter hunter = getHunter(username);
        int oldTotalXp = hunter.getTotalXp();
        int newTotalXp = oldTotalXp + xpAmount;
        hunter.setTotalXp(newTotalXp);

        // Calculate Level Progression
        LevelCalculation calc = calculateLevel(newTotalXp);
        int oldLevel = hunter.getLevel();
        int newLevel = calc.level;

        if (newLevel > oldLevel) {
            int levelDiff = newLevel - oldLevel;
            hunter.setLevel(newLevel);
            // Award +3 attribute points per level gained
            hunter.setAvailablePoints(hunter.getAvailablePoints() + (levelDiff * 3));
        }

        // Streak check (Authoritative Backend Engine)
        LocalDate today = LocalDate.now();
        if (hunter.getLastActiveDate() == null) {
            hunter.setStreak(1);
            hunter.setLastActiveDate(today);
        } else if (!hunter.getLastActiveDate().equals(today)) {
            if (hunter.getLastActiveDate().plusDays(1).equals(today)) {
                // Active consecutive day -> Streak +1
                hunter.setStreak(hunter.getStreak() + 1);
            } else {
                // Missed one or more days -> Streak resets to 1
                hunter.setStreak(1);
            }
            hunter.setLastActiveDate(today);
        }

        Hunter saved = hunterRepository.save(hunter);
        return mapToDto(saved);
    }

    @Transactional
    public HunterProfileDto recalibrate(String username, RecalibrateRequest request) {
        Hunter hunter = getHunter(username);

        HunterRank targetRank = (request.getRank() != null) ? request.getRank() : hunter.getRank();

        // Anti-cheat: Validate legitimate rank progression and exam level prerequisites
        validateRankPromotionEligibility(hunter, targetRank);

        int maxStatCap = getMaxStatCapForRank(targetRank);

        // Anti-cheat: prevent impossible stat leaps
        validateStatWithinCap("STR", request.getStrength(), maxStatCap);
        validateStatWithinCap("AGI", request.getAgility(), maxStatCap);
        validateStatWithinCap("VIT", request.getVitality(), maxStatCap);
        validateStatWithinCap("INT", request.getIntelligence(), maxStatCap);
        validateStatWithinCap("PER", request.getPerception(), maxStatCap);

        hunter.setRank(targetRank);
        hunter.setStrength(request.getStrength());
        hunter.setAgility(request.getAgility());
        hunter.setVitality(request.getVitality());
        hunter.setIntelligence(request.getIntelligence());
        hunter.setPerception(request.getPerception());

        Hunter saved = hunterRepository.save(hunter);
        return mapToDto(saved);
    }

    private void validateRankPromotionEligibility(Hunter hunter, HunterRank targetRank) {
        // Recalibration within existing rank is always permitted (stat reallocation)
        if (targetRank == hunter.getRank()) {
            return;
        }

        // Rank demotions are not permitted
        if (targetRank.ordinal() < hunter.getRank().ordinal()) {
            throw new AntiCheatException("Rank license cannot be downgraded through recalibration.");
        }

        // Must advance strictly one tier at a time (e.g. E -> D, D -> C)
        if (targetRank.ordinal() > hunter.getRank().ordinal() + 1) {
            throw new AntiCheatException("Illegal rank leap: Cannot advance from " + hunter.getRank()
                    + "-Rank directly to " + targetRank + "-Rank without passing intermediate exams.");
        }

        // Enforce level requirements to challenge the target promotion tier
        int requiredLevel = getRequiredLevelForPromotion(targetRank);
        if (hunter.getLevel() < requiredLevel) {
            throw new AntiCheatException("Hunter Level " + hunter.getLevel()
                    + " does not meet minimum Level " + requiredLevel + " prerequisite to challenge the "
                    + targetRank + "-Rank promotion exam.");
        }
    }

    private int getRequiredLevelForPromotion(HunterRank rank) {
        return switch (rank) {
            case E -> 1;
            case D -> 10;
            case C -> 25;
            case B -> 50;
            case A -> 75;
            case S -> 100;
        };
    }

    private int getMaxStatCapForRank(HunterRank rank) {
        return switch (rank) {
            case E -> 25;
            case D -> 40;
            case C -> 60;
            case B -> 80;
            case A -> 100;
            case S -> 999;
        };
    }

    private void validateStatWithinCap(String statName, int value, int cap) {
        if (value < 10) {
            throw new AntiCheatException(statName + " cannot be lower than baseline human threshold (10).");
        }
        if (value > cap) {
            throw new AntiCheatException(statName + " (" + value + ") exceeds maximum authorization cap (" + cap
                    + ") for current rank license.");
        }
    }

    @Transactional
    public HunterProfileDto allocateStat(String username, AllocateStatRequest request) {
        Hunter hunter = getHunter(username);

        int cost = Math.max(1, request.getAmount());
        if (hunter.getAvailablePoints() < cost) {
            throw new IllegalArgumentException(
                    "Insufficient attribute points! Available: " + hunter.getAvailablePoints());
        }

        switch (request.getStatName().toUpperCase()) {
            case "STR" -> hunter.setStrength(hunter.getStrength() + cost);
            case "AGI" -> hunter.setAgility(hunter.getAgility() + cost);
            case "VIT" -> hunter.setVitality(hunter.getVitality() + cost);
            case "INT" -> hunter.setIntelligence(hunter.getIntelligence() + cost);
            case "PER" -> hunter.setPerception(hunter.getPerception() + cost);
            default -> throw new IllegalArgumentException("Invalid stat name: " + request.getStatName());
        }

        hunter.setAvailablePoints(hunter.getAvailablePoints() - cost);
        Hunter saved = hunterRepository.save(hunter);
        return mapToDto(saved);
    }

    // --- Helper Math & DTO Mapping ---
    private HunterProfileDto mapToDto(Hunter hunter) {
        LevelCalculation calc = calculateLevel(hunter.getTotalXp());

        return HunterProfileDto.builder()
                .id(hunter.getId())
                .username(hunter.getUsername())
                .rank(hunter.getRank())
                .level(calc.level)
                .totalXp(hunter.getTotalXp())
                .currentLevelXp(calc.currentLevelXp)
                .xpToNextLevel(calc.xpForNextLevel)
                .progressPercentage(calc.progressPercentage)
                .streak(hunter.getStreak())
                .lastActiveDate(hunter.getLastActiveDate())
                .strength(hunter.getStrength())
                .agility(hunter.getAgility())
                .vitality(hunter.getVitality())
                .intelligence(hunter.getIntelligence())
                .perception(hunter.getPerception())
                .availablePoints(hunter.getAvailablePoints())
                .build();
    }

    private record LevelCalculation(int level, int currentLevelXp, int xpForNextLevel, double progressPercentage) {
    }

    private LevelCalculation calculateLevel(int totalXp) {
        int level = 1;
        int xpForNextLevel = 500;
        int xpRemaining = totalXp;

        while (xpRemaining >= xpForNextLevel) {
            xpRemaining -= xpForNextLevel;
            level++;
            xpForNextLevel = 500 + (level - 1) * 250;
        }

        double progress = ((double) xpRemaining / xpForNextLevel) * 100.0;
        return new LevelCalculation(level, xpRemaining, xpForNextLevel, Math.round(progress * 100.0) / 100.0);
    }
}
