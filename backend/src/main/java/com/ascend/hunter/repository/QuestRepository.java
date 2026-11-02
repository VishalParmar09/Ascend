package com.ascend.hunter.repository;

import com.ascend.hunter.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByHunterId(Long hunterId);
    List<Quest> findByHunterIdAndQuestDate(Long hunterId, LocalDate questDate);
    Optional<Quest> findByHunterIdAndQuestDateAndCategory(Long hunterId, LocalDate questDate, String category);
}
