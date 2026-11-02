package com.ascend.hunter.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.QuestDto;
import com.ascend.hunter.dto.WorkoutLogDto;
import com.ascend.hunter.dto.WorkoutLogRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.Quest;
import com.ascend.hunter.entity.WorkoutLog;
import com.ascend.hunter.repository.QuestRepository;
import com.ascend.hunter.repository.WorkoutLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final QuestRepository questRepository;
    private final QuestService questService;
    private final HunterService hunterService;

    @Transactional
    public WorkoutLogResult logWorkout(String username, WorkoutLogRequest request) {
        Hunter hunter = hunterService.getHunter(username);
        LocalDate today = LocalDate.now();

        // 1. Idempotency Check: Guard against duplicate requests, network retries, and multi-tab submissions
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<WorkoutLog> existingLog = workoutLogRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existingLog.isPresent()) {
                WorkoutLog log = existingLog.get();
                HunterProfileDto profile = hunterService.getProfile(username);
                QuestDto fitnessQuest = questRepository
                        .findByHunterIdAndQuestDateAndCategory(hunter.getId(), today, "FITNESS")
                        .map(this::mapQuestToDto)
                        .orElse(null);
                return new WorkoutLogResult(mapToDto(log), profile, fitnessQuest);
            }
        }

        // 2. Ensure daily quests exist for today so the FITNESS quest is available
        questService.getTodayQuests(username);

        // 3. Daily Workout XP Gate: Award XP ONLY if today's FITNESS quest was not already completed
        Optional<Quest> fitnessQuestOpt = questRepository
                .findByHunterIdAndQuestDateAndCategory(hunter.getId(), today, "FITNESS");

        boolean isFirstFitnessCompletionToday = false;
        QuestDto completedQuestDto = null;

        if (fitnessQuestOpt.isPresent()) {
            Quest quest = fitnessQuestOpt.get();
            if (!quest.isCompleted()) {
                quest.setCompleted(true);
                questRepository.save(quest);
                isFirstFitnessCompletionToday = true;
            }
            completedQuestDto = mapQuestToDto(quest);
        }

        // Determine XP to award: exactly 100 XP if completing the daily fitness quest; 0 XP for extra sessions today
        int xpToAward = 0;
        if (isFirstFitnessCompletionToday) {
            xpToAward = request.getXpEarned() > 0 ? request.getXpEarned() : 100;
        }

        // 4. Record Workout Session in Neon PostgreSQL
        WorkoutLog log = WorkoutLog.builder()
                .workoutName(request.getWorkoutName())
                .durationSeconds(request.getDurationSeconds())
                .completedSets(request.getCompletedSets())
                .totalSets(request.getTotalSets())
                .xpEarned(xpToAward)
                .idempotencyKey(request.getIdempotencyKey())
                .hunter(hunter)
                .build();

        WorkoutLog savedLog = workoutLogRepository.save(log);

        // 5. Update Hunter's progression in the database
        HunterProfileDto updatedProfile;
        if (xpToAward > 0) {
            updatedProfile = hunterService.addXp(username, xpToAward);
        } else {
            updatedProfile = hunterService.getProfile(username);
        }

        return new WorkoutLogResult(mapToDto(savedLog), updatedProfile, completedQuestDto);
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

    private QuestDto mapQuestToDto(Quest quest) {
        return QuestDto.builder()
                .id(quest.getId())
                .title(quest.getTitle())
                .category(quest.getCategory())
                .xpReward(quest.getXpReward())
                .statTarget(quest.getStatTarget())
                .completed(quest.isCompleted())
                .questDate(quest.getQuestDate())
                .build();
    }

    public record WorkoutLogResult(
            WorkoutLogDto workoutLog,
            HunterProfileDto hunterProfile,
            QuestDto completedQuest) {}
}
