package com.ascend.hunter.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String category; // e.g. "PHYSICAL", "MIND", "DISCIPLINE"

    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private int xpReward = 50;

    @Column(name = "stat_target", length = 20)
    private String statTarget; // e.g. "STR", "VIT", "AGI"

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "quest_date", nullable = false)
    private LocalDate questDate;

    // Relational Foreign Key to Hunter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hunter_id", nullable = false)
    private Hunter hunter;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}