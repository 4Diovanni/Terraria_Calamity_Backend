package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponPayloadMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final WeaponRepository weaponRepository;
    private final UserRepository userRepository;
    private final WeaponPayloadMapper weaponPayloadMapper;

    public WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        Long targetEntityId = dto.targetWeaponId();
        SubmissionType type = SubmissionType.CREATE;

        if (targetEntityId != null) {
            if (!weaponRepository.existsById(targetEntityId)) {
                throw new RuntimeException("Weapon not found with ID: " + targetEntityId);
            }
            type = SubmissionType.UPDATE;

            if (submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(
                    targetEntityId, EntityType.WEAPON, SubmissionStatus.PENDING)) {
                throw new DuplicateResourceException(
                        "There is already a pending submission for weapon ID: " + targetEntityId);
            }
        }

        Submission submission = weaponPayloadMapper.toEntity(dto, submitter, targetEntityId, type);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findMine(String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        return submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(submitter, EntityType.WEAPON).stream()
                .map(weaponPayloadMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findByStatus(SubmissionStatus status) {
        return submissionRepository.findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType.WEAPON, status).stream()
                .map(weaponPayloadMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public WeaponSubmissionResponseDTO findById(Long id) {
        return weaponPayloadMapper.toResponseDTO(getSubmissionOrThrow(id));
    }

    public void cancel(Long id, String requesterEmail) {
        Submission submission = getSubmissionOrThrow(id);

        if (!submission.getSubmittedBy().getEmail().equals(requesterEmail)) {
            throw new ForbiddenActionException("Only the author can cancel this submission");
        }
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be canceled");
        }
        submissionRepository.delete(submission);
    }

    public WeaponSubmissionResponseDTO approve(Long id) {
        Submission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be approved");
        }

        if (submission.getSubmissionType() == SubmissionType.CREATE) {
            weaponRepository.save(weaponPayloadMapper.toApprovedWeapon(submission));
        } else {
            Weapon target = weaponRepository.findById(submission.getTargetEntityId())
                    .orElseThrow(() -> new RuntimeException(
                            "Weapon not found with ID: " + submission.getTargetEntityId()));
            weaponPayloadMapper.applyToExistingWeapon(submission, target);
            weaponRepository.save(target);
        }

        submission.setStatus(SubmissionStatus.APPROVED);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    public WeaponSubmissionResponseDTO reject(Long id, String reason) {
        Submission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be rejected");
        }
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setRejectionReason(reason);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    private Submission getSubmissionOrThrow(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
    }
}
