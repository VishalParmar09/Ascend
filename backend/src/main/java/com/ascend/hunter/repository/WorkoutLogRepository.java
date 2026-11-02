package com.ascend.hunter.repository;

import com.ascend.hunter.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByHunterIdOrderByCompletedAtDesc(Long hunterId);
    Optional<WorkoutLog> findByIdempotencyKey(String idempotencyKey);
}
