package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Proposta de criação/edição de uma Weapon feita por um USER, aguardando
 * aprovação ou rejeição de um ADMIN. Mapeia para a tabela 'weapon_submissions'.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "weapon_submissions")
public class WeaponSubmission extends BaseEntity {

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_weapon_id")
    private Weapon targetWeapon;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Weapon.WeaponClass weaponClass;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Element element;

    @NotNull
    @Column(nullable = false)
    private Integer baseDamage;

    @Column(nullable = false)
    private Integer criticalChance;

    @NotNull
    @Column(nullable = false)
    private Double attacksPerTurn;

    @Column(nullable = false)
    private Integer range;

    @NotNull
    @Column(nullable = false)
    private Integer rarity;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Integer quality;

    @Column(columnDefinition = "TEXT")
    private String abilities;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;
}
