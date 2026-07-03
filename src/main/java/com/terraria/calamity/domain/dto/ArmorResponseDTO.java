package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.Rarity;

import java.time.LocalDateTime;
import java.util.List;

public record ArmorResponseDTO(
    Long id,
    String name,
    Armor.ArmorClass armorClass,
    Rarity rarity,
    Integer totalDefense,
    String imageUrl,
    String markdownContent,
    String flavorText,
    List<ArmorPieceResponseDTO> pieces,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
