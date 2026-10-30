package com.ascend.hunter.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/system")
public class SystemHealthController {
    @GetMapping("/status")
    public Map<String,Object> getSystemStatus(){
        return Map.of(
            "status","Online",
            "system", "Ascend Hunter Core Gateway",
            "version", "1.0.0-PROTOTYPE",
            "timestamp", Instant.now().toString()
        );
    }
}
