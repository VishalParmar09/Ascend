package com.ascend.hunter.repository;

import com.ascend.hunter.entity.Hunter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HunterRepository extends JpaRepository<Hunter, Long> {
    Optional<Hunter> findByUsername(String username);
    boolean existsByUsername(String username);
}