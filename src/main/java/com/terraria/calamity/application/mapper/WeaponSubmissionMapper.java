package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import org.springframework.stereotype.Component;

@Component
public class WeaponSubmissionMapper {

    public WeaponSubmission toEntity(WeaponSubmissionRequestDTO dto, User submittedBy, Weapon targetWeapon, SubmissionType type) {
        return WeaponSubmission.builder()
            .type(type)
            .submittedBy(submittedBy)
            .targetWeapon(targetWeapon)
            .name(dto.name())
            .weaponClass(dto.weaponClass())
            .element(dto.element())
            .baseDamage(dto.baseDamage())
            .criticalChance(dto.criticalChance())
            .attacksPerTurn(dto.attacksPerTurn())
            .range(dto.range())
            .rarity(dto.rarity())
            .price(dto.price())
            .quality(dto.quality())
            .abilities(dto.abilities())
            .description(dto.description())
            .imageUrl(dto.imageUrl())
            .build();
    }

    public WeaponSubmissionResponseDTO toResponseDTO(WeaponSubmission submission) {
        return new WeaponSubmissionResponseDTO(
            submission.getId(),
            submission.getType(),
            submission.getStatus(),
            submission.getSubmittedBy().getUsername(),
            submission.getTargetWeapon() != null ? submission.getTargetWeapon().getId() : null,
            submission.getName(),
            submission.getWeaponClass(),
            submission.getElement(),
            submission.getBaseDamage(),
            submission.getCriticalChance(),
            submission.getAttacksPerTurn(),
            submission.getRange(),
            submission.getRarity(),
            submission.getPrice(),
            submission.getQuality(),
            submission.getAbilities(),
            submission.getDescription(),
            submission.getImageUrl(),
            submission.getRejectionReason(),
            submission.getCreatedAt(),
            submission.getUpdatedAt()
        );
    }

    public Weapon toApprovedWeapon(WeaponSubmission submission) {
        return Weapon.builder()
            .name(submission.getName())
            .weaponClass(submission.getWeaponClass())
            .element(submission.getElement())
            .baseDamage(submission.getBaseDamage())
            .criticalChance(submission.getCriticalChance())
            .attacksPerTurn(submission.getAttacksPerTurn())
            .range(submission.getRange())
            .rarity(submission.getRarity())
            .price(submission.getPrice())
            .quality(submission.getQuality())
            .abilities(submission.getAbilities())
            .description(submission.getDescription())
            .imageUrl(submission.getImageUrl())
            .build();
    }

    public void applyToExistingWeapon(WeaponSubmission submission, Weapon weapon) {
        weapon.setName(submission.getName());
        weapon.setWeaponClass(submission.getWeaponClass());
        weapon.setElement(submission.getElement());
        weapon.setBaseDamage(submission.getBaseDamage());
        weapon.setCriticalChance(submission.getCriticalChance());
        weapon.setAttacksPerTurn(submission.getAttacksPerTurn());
        weapon.setRange(submission.getRange());
        weapon.setRarity(submission.getRarity());
        weapon.setPrice(submission.getPrice());
        weapon.setQuality(submission.getQuality());
        weapon.setAbilities(submission.getAbilities());
        weapon.setDescription(submission.getDescription());
        weapon.setImageUrl(submission.getImageUrl());
    }
}
