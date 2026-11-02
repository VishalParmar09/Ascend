package com.ascend.hunter.service;

import java.time.LocalDate;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ascend.hunter.dto.AuthResponse;
import com.ascend.hunter.dto.HunterProfileDto;
import com.ascend.hunter.dto.LoginRequest;
import com.ascend.hunter.dto.RegisterRequest;
import com.ascend.hunter.entity.Hunter;
import com.ascend.hunter.entity.HunterRank;
import com.ascend.hunter.repository.HunterRepository;
import com.ascend.hunter.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final HunterRepository hunterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final HunterService hunterService;
    private final QuestService questService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;

        if (username.isBlank()) {
            throw new IllegalArgumentException("Hunter codename / username cannot be empty.");
        }

        if (hunterRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Codename '" + username + "' is already claimed by another Hunter.");
        }

        if (email != null && !email.isBlank() && hunterRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Security code must be at least 6 characters in length.");
        }

        // Initialize Awakened Hunter entity (E-Rank baseline)
        Hunter hunter = Hunter.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .rank(HunterRank.E)
                .level(1)
                .totalXp(0)
                .streak(1)
                .lastActiveDate(LocalDate.now())
                .strength(10)
                .agility(10)
                .vitality(10)
                .intelligence(10)
                .perception(10)
                .availablePoints(5)
                .role("ROLE_HUNTER")
                .build();

        Hunter savedHunter = hunterRepository.save(hunter);

        // Auto-seed initial daily quests for the new recruit
        questService.getTodayQuests(savedHunter.getUsername());

        // Generate signed JWT token
        String jwtToken = jwtService.generateToken(savedHunter);
        HunterProfileDto profile = hunterService.getProfile(savedHunter.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .hunterProfile(profile)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        if (identifier.isBlank() || request.getPassword() == null) {
            throw new IllegalArgumentException("Identifier and password must be provided.");
        }

        // Authenticate with Spring Security AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        Hunter hunter = hunterRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Hunter not found: " + identifier));

        String jwtToken = jwtService.generateToken(hunter);
        HunterProfileDto profile = hunterService.getProfile(hunter.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .hunterProfile(profile)
                .build();
    }
}
