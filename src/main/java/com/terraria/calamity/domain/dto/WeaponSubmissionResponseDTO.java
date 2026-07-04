package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.Weapon;

import java.time.LocalDateTime;

public record WeaponSubmissionResponseDTO(
    Long id,
    SubmissionType type,
    SubmissionStatus status,
    String submittedByUsername,
    Long targetWeaponId,
    String name,
    Weapon.WeaponClass weaponClass,
    Element element,
    Integer baseDamage,
    Integer criticalChance,
    Double attacksPerTurn,
    Integer range,
    Integer rarity,
    Integer price,
    Integer quality,
    String abilities,
    String description,
    String imageUrl,
    String rejectionReason,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
