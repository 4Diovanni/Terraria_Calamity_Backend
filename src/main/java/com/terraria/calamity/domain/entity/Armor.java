package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "armors")
public class Armor extends BaseEntity {

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "Armor class cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "armor_class", nullable = false, length = 20)
    private ArmorClass armorClass;

    @NotNull(message = "Rarity cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rarity rarity;

    @NotNull(message = "Total defense cannot be null")
    @Min(0)
    @Column(name = "total_defense", nullable = false)
    private Integer totalDefense;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "markdown_content", columnDefinition = "TEXT")
    private String markdownContent;

    @Column(name = "flavor_text", length = 500)
    private String flavorText;

    @Builder.Default
    @OneToMany(mappedBy = "armor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ArmorPiece> pieces = new ArrayList<>();

    public void addPiece(ArmorPiece piece) {
        piece.setArmor(this);
        pieces.add(piece);
    }

    public enum ArmorClass {
        MELEE,
        RANGED,
        MAGE,
        SUMMON,
        ROGUE,
        UNIVERSAL
    }
}
