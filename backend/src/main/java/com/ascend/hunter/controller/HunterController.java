package com.ascend.hunter.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ascend.hunter.dto.AllocateStatRequest;
import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.RecalibrateRequest;
import com.ascend.hunter.exception.AntiCheatException;
import com.ascend.hunter.service.HunterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hunters")
@RequiredArgsConstructor
public class HunterController {

    private final HunterService hunterService;

    // 1. GET /api/v1/hunters/profile
    @GetMapping("/profile")
    public ResponseEntity<HunterProfileDto> getProfile(
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username) {
        String activeUser = (principal != null) ? principal.getName() : username;
        HunterProfileDto profile = hunterService.getProfile(activeUser);
        return ResponseEntity.ok(profile);
    }

    // 2. POST /api/v1/hunters/allocate-stat
    @PostMapping("/allocate-stat")
    public ResponseEntity<HunterProfileDto> allocateStat(
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username,
            @RequestBody AllocateStatRequest request) {
        String activeUser = (principal != null) ? principal.getName() : username;
        HunterProfileDto updated = hunterService.allocateStat(activeUser, request);
        return ResponseEntity.ok(updated);
    }

    // 3. POST /api/v1/hunters/recalibrate
    @PostMapping("/recalibrate")
    public ResponseEntity<HunterProfileDto> recalibrate(
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username,
            @RequestBody RecalibrateRequest request) {
        String activeUser = (principal != null) ? principal.getName() : username;
        HunterProfileDto updated = hunterService.recalibrate(activeUser, request);
        return ResponseEntity.ok(updated);
    }

    // 4. POST /api/v1/hunters/add-xp (Dev testing endpoint with anti-cheat cap)
    @PostMapping("/add-xp")
    public ResponseEntity<HunterProfileDto> addXp(
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username,
            @RequestParam int amount) {
        String activeUser = (principal != null) ? principal.getName() : username;
        if (amount <= 0 || amount > 500) {
            throw new AntiCheatException("Direct XP injection must be positive and cannot exceed 500 XP per test pulse.");
        }
        HunterProfileDto updated = hunterService.addXp(activeUser, amount);
        return ResponseEntity.ok(updated);
    }
}