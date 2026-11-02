package com.ascend.hunter.repository;

import com.ascend.hunter.entity.Hunter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HunterRepository extends JpaRepository<Hunter, Long> {
    Optional<Hunter> findByUsername(String username);
    Optional<Hunter> findByEmail(String email);

    @Query("SELECT h FROM Hunter h WHERE h.username = :identifier OR h.email = :identifier")
    Optional<Hunter> findByUsernameOrEmail(@Param("identifier") String identifier);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
