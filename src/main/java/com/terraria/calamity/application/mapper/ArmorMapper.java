package com.terraria.calamity.application.mapper;

import com.terraria.calamity.api.controller.ArmorController.ArmorPieceRequestDTO;
import com.terraria.calamity.api.controller.ArmorController.ArmorRequestDTO;
import com.terraria.calamity.domain.dto.ArmorPieceResponseDTO;
import com.terraria.calamity.domain.dto.ArmorResponseDTO;
import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.ArmorPiece;
import com.terraria.calamity.domain.entity.Rarity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ArmorMapper {

    public Armor toEntity(ArmorRequestDTO dto) {
        Armor armor = Armor.builder()
                .name(dto.getName())
                .armorClass(Armor.ArmorClass.valueOf(dto.getArmorClass().toUpperCase()))
                .rarity(Rarity.valueOf(dto.getRarity().toUpperCase()))
                .totalDefense(dto.getTotalDefense())
                .imageUrl(dto.getImageUrl())
                .markdownContent(dto.getMarkdownContent())
                .flavorText(dto.getFlavorText())
                .build();

        List<ArmorPiece> pieces = dto.getPieces() == null
                ? List.of()
                : dto.getPieces().stream().map(this::toPieceEntity).collect(Collectors.toList());
        pieces.forEach(armor::addPiece);

        return armor;
    }

    private ArmorPiece toPieceEntity(ArmorPieceRequestDTO dto) {
        return ArmorPiece.builder()
                .slot(ArmorPiece.Slot.valueOf(dto.getSlot().toUpperCase()))
                .name(dto.getName())
                .imageUrl(dto.getImageUrl())
                .defense(dto.getDefense())
                .build();
    }

    public ArmorResponseDTO toResponseDTO(Armor armor) {
        List<ArmorPieceResponseDTO> pieces = armor.getPieces().stream()
                .map(p -> new ArmorPieceResponseDTO(p.getSlot().name(), p.getName(), p.getImageUrl(), p.getDefense()))
                .collect(Collectors.toList());

        return new ArmorResponseDTO(
                armor.getId(),
                armor.getName(),
                armor.getArmorClass(),
                armor.getRarity(),
                armor.getTotalDefense(),
                armor.getImageUrl(),
                armor.getMarkdownContent(),
                armor.getFlavorText(),
                pieces,
                armor.getCreatedAt(),
                armor.getUpdatedAt()
        );
    }
}
