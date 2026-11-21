package com.ascend.hunter.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ascend.hunter.dto.AllocateStatRequest;
import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.RecalibrateRequest;
import com.ascend.hunter.service.HunterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hunters")
@RequiredArgsConstructor
public class HunterController {

    private final HunterService hunterService;

    // 1. GET /api/v1/hunters/profile
    @GetMapping("/profile")
    public ResponseEntity<HunterProfileDto> getProfile(Principal principal) {
        HunterProfileDto profile = hunterService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    // 2. POST /api/v1/hunters/allocate-stat
    @PostMapping("/allocate-stat")
    public ResponseEntity<HunterProfileDto> allocateStat(
            Principal principal,
            @RequestBody AllocateStatRequest request) {
        HunterProfileDto updated = hunterService.allocateStat(principal.getName(), request);
        return ResponseEntity.ok(updated);
    }

    // 3. POST /api/v1/hunters/recalibrate
    @PostMapping("/recalibrate")
    public ResponseEntity<HunterProfileDto> recalibrate(
            Principal principal,
            @RequestBody RecalibrateRequest request) {
        HunterProfileDto updated = hunterService.recalibrate(principal.getName(), request);
        return ResponseEntity.ok(updated);
    }
}