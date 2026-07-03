package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WeaponSubmissionService {

    private final WeaponSubmissionRepository submissionRepository;
    private final WeaponRepository weaponRepository;
    private final UserRepository userRepository;
    private final WeaponSubmissionMapper mapper;

    public WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        Weapon targetWeapon = null;
        SubmissionType type = SubmissionType.CREATE;

        if (dto.targetWeaponId() != null) {
            targetWeapon = weaponRepository.findById(dto.targetWeaponId())
                    .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + dto.targetWeaponId()));
            type = SubmissionType.UPDATE;

            if (submissionRepository.existsByTargetWeaponIdAndStatus(dto.targetWeaponId(), SubmissionStatus.PENDING)) {
                throw new DuplicateResourceException(
                        "There is already a pending submission for weapon ID: " + dto.targetWeaponId());
            }
        }

        WeaponSubmission submission = mapper.toEntity(dto, submitter, targetWeapon, type);
        WeaponSubmission saved = submissionRepository.save(submission);
        return mapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findMine(String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        return submissionRepository.findBySubmittedByOrderByCreatedAtDesc(submitter).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }
}
