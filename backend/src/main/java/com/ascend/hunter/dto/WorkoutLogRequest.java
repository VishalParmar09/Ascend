package com.ascend.hunter.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutLogRequest {
    private String workoutName;
    private int durationSeconds;
    private int completedSets;
    private int totalSets;
    private int xpEarned;
}