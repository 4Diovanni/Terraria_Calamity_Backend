package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.ArmorService;
import com.terraria.calamity.domain.dto.ArmorResponseDTO;
import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.Rarity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para operações com Armaduras (Armors)
 *
 * Espelha o padrão de {@link WeaponController}: RequestDTO/ArmorPieceRequestDTO
 * aninhados aqui, ResponseDTO como record em domain/dto.
 */
@RestController
@RequestMapping("/api/v1/armor")
@RequiredArgsConstructor
public class ArmorController {

    private final ArmorService armorService;

    @GetMapping
    public ResponseEntity<List<ArmorResponseDTO>> getAllArmors(
            @RequestParam(required = false) String armorClass,
            @RequestParam(required = false) String rarity
    ) {
        if (armorClass != null && !armorClass.isBlank()) {
            Armor.ArmorClass classEnum = Armor.ArmorClass.valueOf(armorClass.toUpperCase());
            return ResponseEntity.ok(armorService.findByClass(classEnum));
        }
        if (rarity != null && !rarity.isBlank()) {
            Rarity rarityEnum = Rarity.valueOf(rarity.toUpperCase());
            return ResponseEntity.ok(armorService.findByRarity(rarityEnum));
        }
        return ResponseEntity.ok(armorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArmorResponseDTO> getArmorById(@PathVariable Long id) {
        return ResponseEntity.ok(armorService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ArmorResponseDTO> createArmor(@RequestBody ArmorRequestDTO requestDTO) {
        ArmorResponseDTO created = armorService.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArmorResponseDTO> updateArmor(
            @PathVariable Long id,
            @RequestBody ArmorRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(armorService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArmor(@PathVariable Long id) {
        armorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArmorPieceRequestDTO {
        private String slot;
        private String name;
        private String imageUrl;
        private Integer defense;
    }
}
