package com.ascend.hunter.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.AllocateStatRequest;
import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.RecalibrateRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
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

        // Streak check
        LocalDate today = LocalDate.now();
        if (hunter.getLastActiveDate() == null || !hunter.getLastActiveDate().equals(today)) {
            if (hunter.getLastActiveDate() != null && hunter.getLastActiveDate().plusDays(1).equals(today)) {
                hunter.setStreak(hunter.getStreak() + 1);
            }
            hunter.setLastActiveDate(today);
        }

        Hunter saved = hunterRepository.save(hunter);
        return mapToDto(saved);
    }

    @Transactional
    public HunterProfileDto recalibrate(String username, RecalibrateRequest request) {
        Hunter hunter = getHunter(username);

        if (request.getRank() != null) {
            hunter.setRank(request.getRank());
        }
        hunter.setStrength(request.getStrength());
        hunter.setAgility(request.getAgility());
        hunter.setVitality(request.getVitality());
        hunter.setIntelligence(request.getIntelligence());
        hunter.setPerception(request.getPerception());

        Hunter saved = hunterRepository.save(hunter);
        return mapToDto(saved);
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
