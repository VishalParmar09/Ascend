package com.ascend.hunter.controller;

import com.ascend.hunter.dto.LeaderboardPageResponse;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {
    private final LeaderboardService leaderboardService;
    @GetMapping
    public ResponseEntity<LeaderboardPageResponse> getLeaderboard(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) HunterRank rank) {
        String activeUser = (principal != null) ? principal.getName() : null;
        LeaderboardPageResponse response = leaderboardService.getLeaderboard(page, size, rank, activeUser);
        return ResponseEntity.ok(response);
    }
}