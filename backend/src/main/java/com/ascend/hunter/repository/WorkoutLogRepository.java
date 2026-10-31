package com.ascend.hunter.repository;

import com.ascend.hunter.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByHunterIdOrderByCompletedAtDesc(Long hunterId);
}