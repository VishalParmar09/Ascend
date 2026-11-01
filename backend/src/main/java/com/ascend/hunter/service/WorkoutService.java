package com.ascend.hunter.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.WorkoutLogDto;
import com.ascend.hunter.dto.WorkoutLogRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.WorkoutLog;
import com.ascend.hunter.repository.WorkoutLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final HunterService hunterService;

    @Transactional
    public WorkoutLogResult logWorkout(String username, WorkoutLogRequest request) {
        Hunter hunter = hunterService.getHunter(username);

        WorkoutLog log = WorkoutLog.builder()
                .workoutName(request.getWorkoutName())
                .durationSeconds(request.getDurationSeconds())
                .completedSets(request.getCompletedSets())
                .totalSets(request.getTotalSets())
                .xpEarned(request.getXpEarned())
                .hunter(hunter)
                .build();

        WorkoutLog savedLog = workoutLogRepository.save(log);

        // Award workout XP to the hunter on the server
        HunterProfileDto updatedProfile = hunterService.addXp(username, request.getXpEarned());

        return new WorkoutLogResult(mapToDto(savedLog), updatedProfile);
    }

    @Transactional(readOnly = true)
    public List<WorkoutLogDto> getHistory(String username) {
        Hunter hunter = hunterService.getHunter(username);
        return workoutLogRepository.findByHunterIdOrderByCompletedAtDesc(hunter.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private WorkoutLogDto mapToDto(WorkoutLog log) {
        return WorkoutLogDto.builder()
                .id(log.getId())
                .workoutName(log.getWorkoutName())
                .durationSeconds(log.getDurationSeconds())
                .completedSets(log.getCompletedSets())
                .totalSets(log.getTotalSets())
                .xpEarned(log.getXpEarned())
                .completedAt(log.getCompletedAt())
                .build();
    }

    public record WorkoutLogResult(WorkoutLogDto workoutLog, HunterProfileDto hunterProfile) {}
}
