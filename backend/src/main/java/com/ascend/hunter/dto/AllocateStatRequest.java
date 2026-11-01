package com.ascend.hunter.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllocateStatRequest {
    private String statName; // "STR", "AGI", "VIT", "INT", "PER"
    private int amount = 1;
}