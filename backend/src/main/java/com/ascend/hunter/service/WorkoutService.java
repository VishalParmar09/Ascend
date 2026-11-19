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
import com.ascend.hunter.exception.AntiCheatException;
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

        // --- ANTI-CHEAT LAYER 1: PHYSIOLOGICAL VALIDATION ---
        int sets = request.getCompletedSets();
        int duration = request.getDurationSeconds();

        if (sets < 0 || duration < 0) {
            throw new AntiCheatException("Negative values for sets or duration are physically impossible.");
        }
        if (sets > 60) {
            throw new AntiCheatException("Workout exceeds maximum physiological set threshold (>60 sets).");
        }
        if (duration > 14400) {
            throw new AntiCheatException("Workout duration exceeds maximum allowed time window (>4 hours).");
        }
        // Human threshold check: each legitimate exercise set requires at least 10
        // seconds
        if (sets > 0 && duration < (sets * 10)) {
            throw new AntiCheatException(
                    "Physiologically impossible tempo: " + sets + " sets completed in only " + duration + " seconds.");
        }

        // --- ANTI-CHEAT LAYER 2: IDEMPOTENCY CHECK ---
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

        // Ensure today's daily quest roster exists in PostgreSQL
        questService.getTodayQuests(username);

        // --- ANTI-CHEAT LAYER 3: AUTHORITATIVE XP CALCULATION ---
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

        // The server alone decides XP (100 XP for first completion, 0 XP for extra
        // sessions)
        int verifiedXpToAward = isFirstFitnessCompletionToday ? 100 : 0;

        // Record verified session to Neon PostgreSQL
        WorkoutLog log = WorkoutLog.builder()
                .workoutName(request.getWorkoutName())
                .durationSeconds(duration)
                .completedSets(sets)
                .totalSets(request.getTotalSets())
                .xpEarned(verifiedXpToAward)
                .idempotencyKey(request.getIdempotencyKey())
                .hunter(hunter)
                .build();

        WorkoutLog savedLog = workoutLogRepository.save(log);

        HunterProfileDto updatedProfile = (verifiedXpToAward > 0)
                ? hunterService.addXp(username, verifiedXpToAward)
                : hunterService.getProfile(username);

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
            QuestDto completedQuest) {
    }
}
