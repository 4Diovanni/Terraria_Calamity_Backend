package com.terraria.calamity.domain.dto;

public record ArmorPieceResponseDTO(
    String slot,
    String name,
    String imageUrl,
    Integer defense
) {}
