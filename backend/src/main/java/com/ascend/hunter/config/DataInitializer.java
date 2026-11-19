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
        // 1. Ensure existing ShadowMonarch has valid BCrypt credentials
        hunterRepository.findByUsername("ShadowMonarch").ifPresent(shadow -> {
            if (shadow.getPassword() == null || !shadow.getPassword().startsWith("$2")) {
                shadow.setPassword(passwordEncoder.encode("hunter123"));
                shadow.setEmail("shadow@ascend.system");
                hunterRepository.save(shadow);
                log.info("Initialized credentials for existing Hunter: ShadowMonarch (password: hunter123)");
            }
        });

        // 2. Seed rival hunters for a populated global leaderboard if not already present
        seedRivalHunter("ThomasAndre", "thomas@ascend.system", HunterRank.S, 85, 95000, 42, 120, 110, 130, 95, 105);
        seedRivalHunter("ChaHaeIn", "cha@ascend.system", HunterRank.S, 64, 52000, 31, 88, 105, 82, 80, 94);
        seedRivalHunter("BaekYoonho", "baek@ascend.system", HunterRank.A, 48, 26000, 19, 75, 68, 80, 60, 70);
        seedRivalHunter("ChoiJongIn", "choi@ascend.system", HunterRank.A, 45, 22500, 14, 55, 60, 65, 92, 85);

        if (hunterRepository.count() > 4) {
            log.info("System Database already initialized with hunters. Skipping base quest re-seed.");
            return;
        }

        log.info("System Database base seeding starting...");

        // 3. Seed Veteran Hunter (D-Rank)
        Hunter shadowMonarch = hunterRepository.findByUsername("ShadowMonarch").orElseGet(() -> {
            Hunter h = Hunter.builder()
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
            return hunterRepository.save(h);
        });

        // 4. Seed Beginner Hunter (E-Rank)
        seedRivalHunter("PlayerOne", "player1@ascend.system", HunterRank.E, 1, 0, 1, 10, 10, 10, 10, 10);

        // 5. Seed Quests for ShadowMonarch
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

        // 6. Seed Workout History for ShadowMonarch
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

        log.info("Neon PostgreSQL Database seeding complete!");
    }

    private void seedRivalHunter(String username, String email, HunterRank rank, int level, int xp, int streak,
                                 int str, int agi, int vit, int intel, int per) {
        if (!hunterRepository.existsByUsername(username)) {
            Hunter rival = Hunter.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode("hunter123"))
                    .rank(rank)
                    .level(level)
                    .totalXp(xp)
                    .streak(streak)
                    .lastActiveDate(LocalDate.now())
                    .strength(str)
                    .agility(agi)
                    .vitality(vit)
                    .intelligence(intel)
                    .perception(per)
                    .role("ROLE_HUNTER")
                    .build();
            hunterRepository.save(rival);
            log.info("Seeded rival hunter: {} (Rank {}, Level {})", username, rank, level);
        }
    }
}