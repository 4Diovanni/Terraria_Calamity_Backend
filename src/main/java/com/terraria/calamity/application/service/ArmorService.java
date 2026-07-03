package com.terraria.calamity.application.service;

import com.terraria.calamity.api.controller.ArmorController.ArmorRequestDTO;
import com.terraria.calamity.application.mapper.ArmorMapper;
import com.terraria.calamity.domain.dto.ArmorResponseDTO;
import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.Rarity;
import com.terraria.calamity.domain.repository.ArmorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ArmorService {
    private final ArmorRepository armorRepository;
    private final ArmorMapper armorMapper;

    public ArmorResponseDTO create(ArmorRequestDTO requestDTO) {
        Armor armor = armorMapper.toEntity(requestDTO);
        Armor saved = armorRepository.save(armor);
        return armorMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public ArmorResponseDTO findById(Long id) {
        Armor armor = armorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Armor not found with ID: " + id));
        return armorMapper.toResponseDTO(armor);
    }

    @Transactional(readOnly = true)
    public List<ArmorResponseDTO> findAll() {
        return armorRepository.findAll().stream()
                .map(armorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ArmorResponseDTO> findByClass(Armor.ArmorClass armorClass) {
        return armorRepository.findByArmorClass(armorClass).stream()
                .map(armorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ArmorResponseDTO> findByRarity(Rarity rarity) {
        return armorRepository.findByRarity(rarity).stream()
                .map(armorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ArmorResponseDTO update(Long id, ArmorRequestDTO requestDTO) {
        Armor armor = armorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Armor not found with ID: " + id));

        Armor updated = armorMapper.toEntity(requestDTO);

        armor.setName(updated.getName());
        armor.setArmorClass(updated.getArmorClass());
        armor.setRarity(updated.getRarity());
        armor.setTotalDefense(updated.getTotalDefense());
        armor.setImageUrl(updated.getImageUrl());
        armor.setMarkdownContent(updated.getMarkdownContent());
        armor.setFlavorText(updated.getFlavorText());

        armor.getPieces().clear();
        updated.getPieces().forEach(armor::addPiece);

        Armor saved = armorRepository.save(armor);
        return armorMapper.toResponseDTO(saved);
    }

    public void delete(Long id) {
        if (!armorRepository.existsById(id)) {
            throw new RuntimeException("Armor not found with ID: " + id);
        }
        armorRepository.deleteById(id);
    }
}
