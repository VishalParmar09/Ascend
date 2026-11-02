package com.ascend.hunter.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.entity.Quest;
import com.ascend.hunter.entity.WorkoutLog;
import com.ascend.hunter.repository.HunterRepository;
import com.ascend.hunter.repository.QuestRepository;
import com.ascend.hunter.repository.WorkoutLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final HunterRepository hunterRepository;
    private final QuestRepository questRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure existing seeded hunters have valid BCrypt passwords and emails
        hunterRepository.findByUsername("ShadowMonarch").ifPresent(shadow -> {
            if (shadow.getPassword() == null || !shadow.getPassword().startsWith("$2")) {
                shadow.setPassword(passwordEncoder.encode("hunter123"));
                shadow.setEmail("shadow@ascend.system");
                hunterRepository.save(shadow);
                log.info("Initialized credentials for existing Hunter: ShadowMonarch (password: hunter123)");
            }
        });

        if (hunterRepository.count() > 0) {
            log.info("System Database already contains hunters. Skipping full re-seed.");
            return;
        }

        log.info("System Database is empty. Seeding initial Hunter data into Neon PostgreSQL...");

        // 1. Seed Veteran Hunter (D-Rank)
        Hunter shadowMonarch = Hunter.builder()
                .username("ShadowMonarch")
                .email("shadow@ascend.system")
                .password(passwordEncoder.encode("hunter123"))
                .rank(HunterRank.D)
                .level(12)
                .totalXp(3850)
                .streak(7)
                .lastActiveDate(LocalDate.now())
                .strength(28)
                .agility(22)
                .vitality(20)
                .intelligence(16)
                .perception(18)
                .availablePoints(6)
                .role("ROLE_HUNTER")
                .build();
        hunterRepository.save(shadowMonarch);

        // 2. Seed Beginner Hunter (E-Rank)
        Hunter beginner = Hunter.builder()
                .username("PlayerOne")
                .email("player1@ascend.system")
                .password(passwordEncoder.encode("hunter123"))
                .rank(HunterRank.E)
                .level(1)
                .totalXp(0)
                .streak(1)
                .lastActiveDate(LocalDate.now())
                .strength(10)
                .agility(10)
                .vitality(10)
                .intelligence(10)
                .perception(10)
                .availablePoints(5)
                .role("ROLE_HUNTER")
                .build();
        hunterRepository.save(beginner);

        // 3. Seed Today's Quests for ShadowMonarch
        LocalDate today = LocalDate.now();
        List<Quest> quests = List.of(
                Quest.builder()
                        .title("Daily Workout: Push Day Hypertrophy")
                        .category("FITNESS")
                        .xpReward(100)
                        .statTarget("STR")
                        .completed(false)
                        .questDate(today)
                        .hunter(shadowMonarch)
                        .build(),
                Quest.builder()
                        .title("System Deep Work: Study Java & Algorithms for 90m")
                        .category("KNOWLEDGE")
                        .xpReward(75)
                        .statTarget("INT")
                        .completed(true)
                        .questDate(today)
                        .hunter(shadowMonarch)
                        .build(),
                Quest.builder()
                        .title("Hydration Protocol: Drink 3L Water")
                        .category("VITALITY")
                        .xpReward(50)
                        .statTarget("VIT")
                        .completed(false)
                        .questDate(today)
                        .hunter(shadowMonarch)
                        .build(),
                Quest.builder()
                        .title("Iron Will: 15 Pages Architecture Reading")
                        .category("DISCIPLINE")
                        .xpReward(25)
                        .statTarget("PER")
                        .completed(false)
                        .questDate(today)
                        .hunter(shadowMonarch)
                        .build()
        );
        questRepository.saveAll(quests);

        // 4. Seed Workout History for ShadowMonarch
        List<WorkoutLog> logs = List.of(
                WorkoutLog.builder()
                        .workoutName("Upper Body Power Split")
                        .durationSeconds(2700)
                        .completedSets(16)
                        .totalSets(16)
                        .xpEarned(120)
                        .hunter(shadowMonarch)
                        .build(),
                WorkoutLog.builder()
                        .workoutName("D-Rank Promotion Dungeon Assessment")
                        .durationSeconds(1800)
                        .completedSets(12)
                        .totalSets(12)
                        .xpEarned(250)
                        .hunter(shadowMonarch)
                        .build()
        );
        workoutLogRepository.saveAll(logs);

        log.info("Neon PostgreSQL Database seeding complete! Seeded 2 Hunters, 4 Quests, and 2 Workout Logs.");
    }
}
