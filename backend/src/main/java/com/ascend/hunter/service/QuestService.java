package com.ascend.hunter.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.QuestDto;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.Quest;
import com.ascend.hunter.repository.QuestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestService {

    private final QuestRepository questRepository;
    private final HunterService hunterService;

    @Transactional
    public List<QuestDto> getTodayQuests(String username) {
        Hunter hunter = hunterService.getHunter(username);
        LocalDate today = LocalDate.now();

        List<Quest> quests = questRepository.findByHunterIdAndQuestDate(hunter.getId(), today);

        // If no quests exist for today, automatically seed default daily quests!
        if (quests.isEmpty()) {
            quests = seedDefaultDailyQuests(hunter, today);
        }

        return quests.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public QuestCompletionResult completeQuest(String username, Long questId) {
        Hunter hunter = hunterService.getHunter(username);

        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new IllegalArgumentException("Quest with id " + questId + " not found."));

        if (!quest.getHunter().getId().equals(hunter.getId())) {
            throw new IllegalArgumentException("Quest does not belong to hunter " + username);
        }

        if (quest.isCompleted()) {
            // Already completed; return current state without double awarding XP
            return new QuestCompletionResult(mapToDto(quest), hunterService.getProfile(username));
        }

        quest.setCompleted(true);
        Quest savedQuest = questRepository.save(quest);

        // Award XP through HunterService (which automatically handles level-ups!)
        HunterProfileDto updatedProfile = hunterService.addXp(username, quest.getXpReward());

        return new QuestCompletionResult(mapToDto(savedQuest), updatedProfile);
    }

    private List<Quest> seedDefaultDailyQuests(Hunter hunter, LocalDate today) {
        List<Quest> defaultQuests = List.of(
                Quest.builder()
                        .title("Daily Workout Protocol: Complete Training Split")
                        .category("FITNESS")
                        .xpReward(100)
                        .statTarget("STR")
                        .completed(false)
                        .questDate(today)
                        .hunter(hunter)
                        .build(),
                Quest.builder()
                        .title("Deep Work / Study for 1 Hour")
                        .category("KNOWLEDGE")
                        .xpReward(75)
                        .statTarget("INT")
                        .completed(false)
                        .questDate(today)
                        .hunter(hunter)
                        .build(),
                Quest.builder()
                        .title("Hydration Protocol: Drink 3L Water")
                        .category("VITALITY")
                        .xpReward(50)
                        .statTarget("VIT")
                        .completed(false)
                        .questDate(today)
                        .hunter(hunter)
                        .build(),
                Quest.builder()
                        .title("Mental Discipline: Read 15 Pages")
                        .category("DISCIPLINE")
                        .xpReward(25)
                        .statTarget("PER")
                        .completed(false)
                        .questDate(today)
                        .hunter(hunter)
                        .build()
        );

        return questRepository.saveAll(defaultQuests);
    }

    private QuestDto mapToDto(Quest quest) {
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

    public record QuestCompletionResult(QuestDto quest, HunterProfileDto hunterProfile) {}
}
