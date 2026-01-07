package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Weapon;
import java.time.LocalDateTime;

public record WeaponResponseDTO(
    Long id,
    String name,
    Weapon.WeaponClass weaponClass,
    Weapon.Element element,
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
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
