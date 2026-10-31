package com.ascend.hunter.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workout_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workout_name", nullable = false, length = 100)
    private String workoutName;

    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private int durationSeconds = 0;

    @Column(name = "completed_sets", nullable = false)
    @Builder.Default
    private int completedSets = 0;

    @Column(name = "total_sets", nullable = false)
    @Builder.Default
    private int totalSets = 0;

    @Column(name = "xp_earned", nullable = false)
    @Builder.Default
    private int xpEarned = 0;

    // Relational Foreign Key to Hunter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hunter_id", nullable = false)
    private Hunter hunter;

    @CreationTimestamp
    @Column(name = "completed_at", updatable = false)
    private LocalDateTime completedAt;
}