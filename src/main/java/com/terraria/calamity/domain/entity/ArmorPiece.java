package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "armor_pieces", uniqueConstraints = {
        @UniqueConstraint(name = "uq_armor_pieces_armor_slot", columnNames = {"armor_id", "slot"})
})
public class ArmorPiece extends BaseEntity {

    @NotNull(message = "Armor cannot be null")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "armor_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Armor armor;

    @NotNull(message = "Slot cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Slot slot;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @NotNull(message = "Defense cannot be null")
    @Min(0)
    @Column(nullable = false)
    private Integer defense;

    public enum Slot {
        HELMET,
        CHEST,
        LEGS
    }
}
