package com.ascend.hunter.dto;

import java.time.LocalDate;

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
public class QuestDto {
    private Long id;
    private String title;
    private String category;
    private int xpReward;
    private String statTarget;
    private boolean completed;
    private LocalDate questDate;
}