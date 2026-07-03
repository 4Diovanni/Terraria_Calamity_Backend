package com.terraria.calamity.api.controller;

import lombok.Builder;
import lombok.Data;

import java.util.List;

public class ArmorController {

    @Data
    @Builder
    public static class ArmorRequestDTO {
        private String name;
        private String armorClass;
        private String rarity;
        private Integer totalDefense;
        private String imageUrl;
        private String markdownContent;
        private String flavorText;
        private List<ArmorPieceRequestDTO> pieces;
    }

    @Data
    @Builder
    public static class ArmorPieceRequestDTO {
        private String slot;
        private String name;
        private String imageUrl;
        private Integer defense;
    }
}
