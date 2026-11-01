package com.ascend.hunter.dto;

import com.ascend.hunter.entity.HunterRank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecalibrateRequest {
    private HunterRank rank;
    private int strength;
    private int agility;
    private int vitality;
    private int intelligence;
    private int perception;
}
