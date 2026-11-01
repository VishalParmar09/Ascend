package com.ascend.hunter.controller;

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
import com.ascend.hunter.service.HunterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hunters")
@RequiredArgsConstructor
public class HunterController {

    private final HunterService hunterService;

    // GET /api/v1/hunters/profile?username=JinWoo
    @GetMapping("/profile")
    public ResponseEntity<HunterProfileDto> getProfile(
            @RequestParam(defaultValue = "ShadowMonarch") String username) {
        HunterProfileDto profile = hunterService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    // POST /api/v1/hunters/allocate-stat?username=JinWoo
    @PostMapping("/allocate-stat")
    public ResponseEntity<HunterProfileDto> allocateStat(
            @RequestParam(defaultValue = "ShadowMonarch") String username,
            @RequestBody AllocateStatRequest request) {
        HunterProfileDto updated = hunterService.allocateStat(username, request);
        return ResponseEntity.ok(updated);
    }

    // POST /api/v1/hunters/add-xp?username=JinWoo&amount=150
    @PostMapping("/add-xp")
    public ResponseEntity<HunterProfileDto> addXp(
            @RequestParam(defaultValue = "ShadowMonarch") String username,
            @RequestParam int amount) {
        HunterProfileDto updated = hunterService.addXp(username, amount);
        return ResponseEntity.ok(updated);
    }

    // POST /api/v1/hunters/recalibrate?username=ShadowMonarch
    @PostMapping("/recalibrate")
    public ResponseEntity<HunterProfileDto> recalibrate(
            @RequestParam(defaultValue = "ShadowMonarch") String username,
            @RequestBody RecalibrateRequest request) {
        HunterProfileDto updated = hunterService.recalibrate(username, request);
        return ResponseEntity.ok(updated);
    }
}