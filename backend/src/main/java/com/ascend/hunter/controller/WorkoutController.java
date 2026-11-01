package com.ascend.hunter.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ascend.hunter.dto.WorkoutLogDto;
import com.ascend.hunter.dto.WorkoutLogRequest;
import com.ascend.hunter.service.WorkoutService;
import com.ascend.hunter.service.WorkoutService.WorkoutLogResult;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    // POST /api/v1/workouts/log?username=ShadowMonarch
    @PostMapping("/log")
    public ResponseEntity<WorkoutLogResult> logWorkout(
            @RequestParam(defaultValue = "ShadowMonarch") String username,
            @RequestBody WorkoutLogRequest request) {
        WorkoutLogResult result = workoutService.logWorkout(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // GET /api/v1/workouts/history?username=ShadowMonarch
    @GetMapping("/history")
    public ResponseEntity<List<WorkoutLogDto>> getHistory(
            @RequestParam(defaultValue = "ShadowMonarch") String username) {
        List<WorkoutLogDto> history = workoutService.getHistory(username);
        return ResponseEntity.ok(history);
    }
}