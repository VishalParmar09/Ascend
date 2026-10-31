package com.ascend.hunter.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hunters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hunter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private HunterRank rank = HunterRank.E;

    @Column(nullable = false)
    @Builder.Default
    private int level = 1;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private int totalXp = 0;

    @Column(nullable = false)
    @Builder.Default
    private int streak = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    // --- Core Attributes (Solo Leveling System Stats) ---
    @Column(nullable = false)
    @Builder.Default
    private int strength = 10;

    @Column(nullable = false)
    @Builder.Default
    private int agility = 10;

    @Column(nullable = false)
    @Builder.Default
    private int vitality = 10;

    @Column(nullable = false)
    @Builder.Default
    private int intelligence = 10;

    @Column(nullable = false)
    @Builder.Default
    private int perception = 10;

    @Column(name = "available_points", nullable = false)
    @Builder.Default
    private int availablePoints = 0;

    // --- Audit Timestamps ---
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}