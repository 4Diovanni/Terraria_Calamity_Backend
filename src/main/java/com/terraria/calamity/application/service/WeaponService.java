package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.CreateWeaponDTO;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.application.mapper.WeaponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WeaponService {
    private final WeaponRepository weaponRepository;
    private final WeaponMapper weaponMapper;

    public WeaponResponseDTO create(CreateWeaponDTO dto) {
        Weapon weapon = weaponMapper.toEntity(dto);
        Weapon saved = weaponRepository.save(weapon);
        return weaponMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public WeaponResponseDTO findById(Long id) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));
        return weaponMapper.toResponseDTO(weapon);
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findAll() {
        return weaponRepository.findAll().stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByClass(Weapon.WeaponClass weaponClass) {
        return weaponRepository.findByWeaponClass(weaponClass).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByElement(Weapon.Element element) {
        return weaponRepository.findByElement(element).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByRarity(Integer rarity) {
        return weaponRepository.findByRarity(rarity).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> searchByName(String name) {
        return weaponRepository.findByNameContainingIgnoreCase(name).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public WeaponResponseDTO update(Long id, CreateWeaponDTO dto) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));

        weapon.setName(dto.name());
        weapon.setWeaponClass(dto.weaponClass());
        weapon.setElement(dto.element());
        weapon.setBaseDamage(dto.baseDamage());
        weapon.setCriticalChance(dto.criticalChance());
        weapon.setAttacksPerTurn(dto.attacksPerTurn());
        weapon.setRange(dto.range());
        weapon.setRarity(dto.rarity());
        weapon.setPrice(dto.price());
        weapon.setQuality(dto.quality());
        weapon.setAbilities(dto.abilities());
        weapon.setDescription(dto.description());
        weapon.setImageUrl(dto.imageUrl());

        Weapon updated = weaponRepository.save(weapon);
        return weaponMapper.toResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!weaponRepository.existsById(id)) {
            throw new RuntimeException("Weapon not found with ID: " + id);
        }
        weaponRepository.deleteById(id);
    }
}
