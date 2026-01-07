package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.CreateWeaponDTO;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Weapon;
import org.springframework.stereotype.Component;

@Component
public class WeaponMapper {
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
