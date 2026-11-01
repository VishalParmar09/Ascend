package com.ascend.hunter.dto;

import java.time.LocalDate;

import com.ascend.hunter.entity.HunterRank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HunterProfileDto {
    private Long id;
    private String username;
    private HunterRank rank;
    private int level;
    private int totalXp;
    private int currentLevelXp;
    private int xpToNextLevel;
    private double progressPercentage;
    private int streak;
    private LocalDate lastActiveDate;

    // Attributes
    private int strength;
    private int agility;
    private int vitality;
    private int intelligence;
    private int perception;
    private int availablePoints;
}