package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.WeaponSubmissionService;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/weapon-submissions")
@RequiredArgsConstructor
public class WeaponSubmissionController {

    private final WeaponSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<WeaponSubmissionResponseDTO> create(
            @Valid @RequestBody WeaponSubmissionRequestDTO requestDTO,
            Authentication authentication) {
        WeaponSubmissionResponseDTO created = submissionService.create(requestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findMine(Authentication authentication) {
        return ResponseEntity.ok(submissionService.findMine(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        submissionService.cancel(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
