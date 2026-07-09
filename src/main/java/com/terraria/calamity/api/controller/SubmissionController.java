package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.SubmissionService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<WeaponSubmissionResponseDTO> create(
            @RequestParam String entityType,
            @Valid @RequestBody WeaponSubmissionRequestDTO requestDTO,
            Authentication authentication) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
        WeaponSubmissionResponseDTO created = submissionService.create(requestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findMine(
            @RequestParam String entityType,
            Authentication authentication) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(submissionService.findMine(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        submissionService.cancel(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findByStatus(
            @RequestParam String entityType,
            @RequestParam(defaultValue = "PENDING") String status) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
        SubmissionStatus statusEnum;
        try {
            statusEnum = SubmissionStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(submissionService.findByStatus(statusEnum));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<WeaponSubmissionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<WeaponSubmissionResponseDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<WeaponSubmissionResponseDTO> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectSubmissionRequestDTO requestDTO) {
        return ResponseEntity.ok(submissionService.reject(id, requestDTO.reason()));
    }

    private boolean isSupportedWeaponType(String entityType) {
        try {
            return EntityType.valueOf(entityType.toUpperCase()) == EntityType.WEAPON;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
