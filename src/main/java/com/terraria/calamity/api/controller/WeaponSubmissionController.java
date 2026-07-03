package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.WeaponSubmissionService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findByStatus(
            @RequestParam(defaultValue = "PENDING") String status) {
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
}
