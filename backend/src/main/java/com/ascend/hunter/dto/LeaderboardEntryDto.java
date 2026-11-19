package com.ascend.hunter.dto;

import com.ascend.hunter.entity.HunterRank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
public class LeaderboardEntryDto {
    private long position;
    private String username;
    private HunterRank rank;
    private int level;
    private int totalXp;
    private int streak;
    private int combatPower;
}
