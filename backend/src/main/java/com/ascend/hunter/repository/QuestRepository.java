package com.ascend.hunter.repository;

import com.ascend.hunter.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByHunterId(Long hunterId);
    List<Quest> findByHunterIdAndQuestDate(Long hunterId, LocalDate questDate);
}