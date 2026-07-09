package com.terraria.calamity.application.service;

import com.terraria.calamity.api.controller.WeaponController;
import com.terraria.calamity.api.exception.ResourceInUseException;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.repository.SubmissionRepository;
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
    private final SubmissionRepository submissionRepository;

    public WeaponResponseDTO create(WeaponController.WeaponRequestDTO requestDTO) {
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

    public WeaponResponseDTO update(Long id, WeaponController.WeaponRequestDTO requestDTO) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));

        Weapon updatedWeapon = weaponMapper.toEntity(requestDTO);

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

    public void delete(Long id) {
        if (!weaponRepository.existsById(id)) {
            throw new RuntimeException("Weapon not found with ID: " + id);
        }
        if (submissionRepository.existsByTargetEntityIdAndEntityType(id, EntityType.WEAPON)) {
            throw new ResourceInUseException(
                    "Não é possível deletar: esta arma possui submissões associadas");
        }
        weaponRepository.deleteById(id);
    }
}
