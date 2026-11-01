package com.ascend.hunter.dto;

import java.time.LocalDateTime;

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
public class WorkoutLogDto {
    private Long id;
    private String workoutName;
    private int durationSeconds;
    private int completedSets;
    private int totalSets;
    private int xpEarned;
    private LocalDateTime completedAt;
}