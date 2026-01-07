package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "weapons")
public class Weapon extends BaseEntity {
    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "Class cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeaponClass weaponClass;

    @NotNull(message = "Element cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Element element;

    @NotNull(message = "Base damage cannot be null")
    @Min(1)
    @Column(nullable = false)
    private Integer baseDamage;

    @Min(1)
    @Max(20)
    @Column(nullable = false)
    private Integer criticalChance;

    @NotNull(message = "Attack speed cannot be null")
    @Min(1)
    @Column(nullable = false)
    private Double attacksPerTurn;

    @Min(0)
    @Column(nullable = false)
    private Integer range;

    @NotNull(message = "Rarity cannot be null")
    @Min(-1)
    @Max(17)
    @Column(nullable = false)
    private Integer rarity;

    @Min(0)
    @Column(nullable = false)
    private Integer price;

    @Min(0)
    @Max(10)
    @Column(nullable = false)
    private Integer quality;

    @Column(columnDefinition = "TEXT")
    private String abilities;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;

    public enum WeaponClass {
        MELEE, RANGED, MAGE, SUMMON, ROGUE
    }

    public enum Element {
        // Vanilla
        FIRE, ICE, LIGHTNING, EARTH, WATER, WIND, NATURE,
        // Calamity
        BRIMSTONE, HOLY_FLAMES, SHADOWFLAME, ASTRAL, PLAGUE, GOD_SLAYER, SULPHURIC
    }
}
