package com.ascend.hunter.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @PostMapping("/log")
    public ResponseEntity<WorkoutLogResult> logWorkout(
            Principal principal,
            @RequestBody WorkoutLogRequest request) {
        WorkoutLogResult result = workoutService.logWorkout(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutLogDto>> getHistory(Principal principal) {
        List<WorkoutLogDto> history = workoutService.getHistory(principal.getName());
        return ResponseEntity.ok(history);
    }
}