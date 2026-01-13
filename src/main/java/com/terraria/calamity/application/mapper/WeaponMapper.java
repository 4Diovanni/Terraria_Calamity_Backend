package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.CreateWeaponDTO;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.api.controller.WeaponController.WeaponRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class WeaponMapper {
    
    /**
     * Converte CreateWeaponDTO (com tipos Enum) para Weapon entity
     * Ele n usa essa convesão mas não sei porque se eu tirar isso o app n roda :)
     */
    public Weapon toEntity(CreateWeaponDTO dto) {
        return Weapon.builder()
            .name(dto.name())
            .weaponClass(dto.weaponClass())
            .element(dto.element())
            .baseDamage(dto.baseDamage())
            .criticalChance(dto.criticalChance())
            .attacksPerTurn(dto.attacksPerTurn())
            .range(dto.range())
            .rarity(dto.rarity())
            .price(dto.price())
            .quality(dto.quality())
            .abilities(dto.abilities())
            .description(dto.description())
            .imageUrl(dto.imageUrl())
            .build();
    }

    /**
     * Converte WeaponRequestDTO (com tipos String) para Weapon entity
     * Realiza conversão segura de String → Enum
     */
    public Weapon toEntity(WeaponRequestDTO requestDTO) {
        // Converter String → Weapon.WeaponClass com fallback
        Weapon.WeaponClass weaponClass = Weapon.WeaponClass.MELEE;
        try {
            if (requestDTO.getWeaponClass() != null && !requestDTO.getWeaponClass().isBlank()) {
                weaponClass = Weapon.WeaponClass.valueOf(
                    requestDTO.getWeaponClass().toUpperCase()
                );
            }
        } catch (IllegalArgumentException e) {
            // Fallback para MELEE se inválido
            weaponClass = Weapon.WeaponClass.MELEE;
        }

        // Converter String → Element com fallback
        Element element = Element.NEUTRAL;
        try {
            if (requestDTO.getElement() != null && !requestDTO.getElement().isBlank()) {
                element = Element.fromString(requestDTO.getElement());
            }
        } catch (IllegalArgumentException e) {
            // Fallback para NEUTRAL se inválido
            element = Element.NEUTRAL;
        }

        return Weapon.builder()
            .name(requestDTO.getName())
            .weaponClass(weaponClass)
            .element(element)
            .baseDamage(requestDTO.getBaseDamage())
            .criticalChance(requestDTO.getCriticalChance())
            .attacksPerTurn(requestDTO.getAttacksPerTurn())
            .range(requestDTO.getRange())
            .rarity(requestDTO.getRarity())
            .price(requestDTO.getPrice())
            .quality(requestDTO.getQuality())
            .abilities(requestDTO.getAbilities())
            .description(requestDTO.getDescription())
            .imageUrl(requestDTO.getImageUrl())
            .build();
    }

    public WeaponResponseDTO toResponseDTO(Weapon weapon) {
        return new WeaponResponseDTO(
            weapon.getId(),
            weapon.getName(),
            weapon.getWeaponClass(),
            weapon.getElement(),
            weapon.getBaseDamage(),
            weapon.getCriticalChance(),
            weapon.getAttacksPerTurn(),
            weapon.getRange(),
            weapon.getRarity(),
            weapon.getPrice(),
            weapon.getQuality(),
            weapon.getAbilities(),
            weapon.getDescription(),
            weapon.getImageUrl(),
            weapon.getCreatedAt(),
            weapon.getUpdatedAt()
        );
    }
}
