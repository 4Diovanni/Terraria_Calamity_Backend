package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.AuthService;
import com.terraria.calamity.domain.dto.AuthResponse;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import com.terraria.calamity.domain.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de autenticação.
 * POST /api/v1/auth/register → 201 Created + AuthResponse (com JWT)
 * POST /api/v1/auth/login    → 200 OK + AuthResponse (com JWT)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
