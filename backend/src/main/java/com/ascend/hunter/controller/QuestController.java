package com.ascend.hunter.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ascend.hunter.dto.QuestDto;
import com.ascend.hunter.service.QuestService;
import com.ascend.hunter.service.QuestService.QuestCompletionResult;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping
    public ResponseEntity<List<QuestDto>> getTodayQuests(Principal principal) {
        List<QuestDto> quests = questService.getTodayQuests(principal.getName());
        return ResponseEntity.ok(quests);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<QuestCompletionResult> completeQuest(
            @PathVariable Long id,
            Principal principal) {
        QuestCompletionResult result = questService.completeQuest(principal.getName(), id);
        return ResponseEntity.ok(result);
    }
}