package com.ascend.hunter.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    // GET /api/v1/quests?username=ShadowMonarch
    @GetMapping
    public ResponseEntity<List<QuestDto>> getTodayQuests(
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username) {
        String activeUser = (principal != null) ? principal.getName() : username;
        List<QuestDto> quests = questService.getTodayQuests(activeUser);
        return ResponseEntity.ok(quests);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<QuestCompletionResult> completeQuest(
            @PathVariable Long id,
            Principal principal,
            @RequestParam(required = false, defaultValue = "ShadowMonarch") String username) {
        String activeUser = (principal != null) ? principal.getName() : username;
        QuestCompletionResult result = questService.completeQuest(activeUser, id);
        return ResponseEntity.ok(result);
    }
}