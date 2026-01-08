package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.Element;
import jakarta.validation.constraints.*;

public record CreateWeaponDTO(
    @NotBlank(message = "Name cannot be blank")
    String name,

    @NotNull(message = "Class cannot be null")
    Weapon.WeaponClass weaponClass,

    @NotNull(message = "Element cannot be null")
    Element element,

    @NotNull(message = "Base damage cannot be null")
    @Min(1)
    Integer baseDamage,

    @Min(1)
    @Max(20)
    Integer criticalChance,

    @NotNull(message = "Attack speed cannot be null")
    @Min(1)
    Double attacksPerTurn,

    @Min(0)
    Integer range,

    @NotNull(message = "Rarity cannot be null")
    @Min(-1)
    @Max(17)
    Integer rarity,

    @Min(0)
    Integer price,

    @Min(0)
    @Max(10)
    Integer quality,

    String abilities,
    String description,
    String imageUrl
) {}
