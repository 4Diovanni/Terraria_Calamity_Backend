package com.terraria.calamity.application.service;

import com.terraria.calamity.api.controller.WeaponController;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Element;
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

    /**
     * Cria uma nova arma a partir dos dados da requisição
     * Usa o mapper para converter WeaponRequestDTO → Weapon entity
     */
    public WeaponResponseDTO create(WeaponController.WeaponRequestDTO requestDTO) {
        // ✅ Usar o mapper que realiza conversão segura de String → Enum
        Weapon weapon = weaponMapper.toEntity(requestDTO);
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
    public List<WeaponResponseDTO> findByElement(Element element) {
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

    /**
     * Atualiza uma arma existente
     * Usa o mapper para converter WeaponRequestDTO → atributos da entity
     */
    public WeaponResponseDTO update(Long id, WeaponController.WeaponRequestDTO requestDTO) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));

        // ✅ Usar a nova entidade convertida do mapper
        Weapon updatedWeapon = weaponMapper.toEntity(requestDTO);
        
        // ✅ Copiar valores para manter o ID e auditoria
        weapon.setName(updatedWeapon.getName());
        weapon.setWeaponClass(updatedWeapon.getWeaponClass());
        weapon.setElement(updatedWeapon.getElement());
        weapon.setBaseDamage(updatedWeapon.getBaseDamage());
        weapon.setCriticalChance(updatedWeapon.getCriticalChance());
        weapon.setAttacksPerTurn(updatedWeapon.getAttacksPerTurn());
        weapon.setRange(updatedWeapon.getRange());
        weapon.setRarity(updatedWeapon.getRarity());
        weapon.setPrice(updatedWeapon.getPrice());
        weapon.setQuality(updatedWeapon.getQuality());
        weapon.setAbilities(updatedWeapon.getAbilities());
        weapon.setDescription(updatedWeapon.getDescription());
        weapon.setImageUrl(updatedWeapon.getImageUrl());

        Weapon saved = weaponRepository.save(weapon);
        return weaponMapper.toResponseDTO(saved);
    }

    /**
     * Deleta uma arma
     */
    public void delete(Long id) {
        if (!weaponRepository.existsById(id)) {
            throw new RuntimeException("Weapon not found with ID: " + id);
        }
        weaponRepository.deleteById(id);
    }
}
