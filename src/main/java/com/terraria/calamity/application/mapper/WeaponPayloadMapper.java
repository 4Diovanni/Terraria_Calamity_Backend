package com.terraria.calamity.application.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WeaponPayloadMapper {

    private final ObjectMapper objectMapper;

    public Submission toEntity(WeaponSubmissionRequestDTO dto, User submittedBy, Long targetEntityId, SubmissionType type) {
        Map<String, Object> payload = objectMapper.convertValue(dto, new TypeReference<Map<String, Object>>() {});
        payload.remove("targetWeaponId");

        return Submission.builder()
            .entityType(EntityType.WEAPON)
            .submissionType(type)
            .submittedBy(submittedBy)
            .targetEntityId(targetEntityId)
            .payload(payload)
            .build();
    }

    public WeaponSubmissionResponseDTO toResponseDTO(Submission submission) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        return new WeaponSubmissionResponseDTO(
            submission.getId(),
            submission.getSubmissionType(),
            submission.getStatus(),
            submission.getSubmittedBy().getUsername(),
            submission.getTargetEntityId(),
            payload.name(),
            payload.weaponClass(),
            payload.element(),
            payload.baseDamage(),
            payload.criticalChance(),
            payload.attacksPerTurn(),
            payload.range(),
            payload.rarity(),
            payload.price(),
            payload.quality(),
            payload.abilities(),
            payload.description(),
            payload.imageUrl(),
            submission.getRejectionReason(),
            submission.getCreatedAt(),
            submission.getUpdatedAt()
        );
    }

    public Weapon toApprovedWeapon(Submission submission) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        return Weapon.builder()
            .name(payload.name())
            .weaponClass(payload.weaponClass())
            .element(payload.element())
            .baseDamage(payload.baseDamage())
            .criticalChance(payload.criticalChance())
            .attacksPerTurn(payload.attacksPerTurn())
            .range(payload.range())
            .rarity(payload.rarity())
            .price(payload.price())
            .quality(payload.quality())
            .abilities(payload.abilities())
            .description(payload.description())
            .imageUrl(payload.imageUrl())
            .build();
    }

    public void applyToExistingWeapon(Submission submission, Weapon weapon) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        weapon.setName(payload.name());
        weapon.setWeaponClass(payload.weaponClass());
        weapon.setElement(payload.element());
        weapon.setBaseDamage(payload.baseDamage());
        weapon.setCriticalChance(payload.criticalChance());
        weapon.setAttacksPerTurn(payload.attacksPerTurn());
        weapon.setRange(payload.range());
        weapon.setRarity(payload.rarity());
        weapon.setPrice(payload.price());
        weapon.setQuality(payload.quality());
        weapon.setAbilities(payload.abilities());
        weapon.setDescription(payload.description());
        weapon.setImageUrl(payload.imageUrl());
    }

    private WeaponSubmissionRequestDTO toPayloadDTO(Submission submission) {
        return objectMapper.convertValue(submission.getPayload(), WeaponSubmissionRequestDTO.class);
    }
}
