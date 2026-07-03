package com.terraria.calamity.application.service;

import com.terraria.calamity.api.controller.ArmorController.ArmorRequestDTO;
import com.terraria.calamity.application.mapper.ArmorMapper;
import com.terraria.calamity.domain.dto.ArmorResponseDTO;
import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.Rarity;
import com.terraria.calamity.domain.repository.ArmorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArmorServiceTest {

    @Mock private ArmorRepository armorRepository;
    @Mock private ArmorMapper armorMapper;

    @InjectMocks private ArmorService armorService;

    @Test
    void findById_returnsMappedDto_whenFound() {
        Armor armor = Armor.builder().name("Victide").armorClass(Armor.ArmorClass.UNIVERSAL)
                .rarity(Rarity.COMMON).totalDefense(12).build();
        ArmorResponseDTO dto = new ArmorResponseDTO(
                1L, "Victide", Armor.ArmorClass.UNIVERSAL, Rarity.COMMON, 12, "", "", "", List.of(), null, null);
        when(armorRepository.findById(1L)).thenReturn(Optional.of(armor));
        when(armorMapper.toResponseDTO(armor)).thenReturn(dto);

        ArmorResponseDTO result = armorService.findById(1L);

        assertThat(result.name()).isEqualTo("Victide");
    }

    @Test
    void findById_throws_whenNotFound() {
        when(armorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> armorService.findById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    @Test
    void create_savesEntityFromMapperAndReturnsMappedResponse() {
        ArmorRequestDTO request = ArmorRequestDTO.builder()
                .name("Victide").armorClass("UNIVERSAL").rarity("COMMON").totalDefense(12).pieces(List.of()).build();
        Armor entity = Armor.builder().name("Victide").armorClass(Armor.ArmorClass.UNIVERSAL)
                .rarity(Rarity.COMMON).totalDefense(12).build();
        Armor saved = Armor.builder().name("Victide").armorClass(Armor.ArmorClass.UNIVERSAL)
                .rarity(Rarity.COMMON).totalDefense(12).build();
        ArmorResponseDTO dto = new ArmorResponseDTO(
                1L, "Victide", Armor.ArmorClass.UNIVERSAL, Rarity.COMMON, 12, "", "", "", List.of(), null, null);

        when(armorMapper.toEntity(request)).thenReturn(entity);
        when(armorRepository.save(entity)).thenReturn(saved);
        when(armorMapper.toResponseDTO(saved)).thenReturn(dto);

        ArmorResponseDTO result = armorService.create(request);

        assertThat(result).isEqualTo(dto);
    }

    @Test
    void delete_throws_whenNotFound() {
        when(armorRepository.existsById(5L)).thenReturn(false);

        assertThatThrownBy(() -> armorService.delete(5L))
                .isInstanceOf(RuntimeException.class);
    }
}
