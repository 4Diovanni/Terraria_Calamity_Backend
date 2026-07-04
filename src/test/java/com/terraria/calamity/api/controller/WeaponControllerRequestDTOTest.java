package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeaponControllerRequestDTOTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void weaponRequestDTO_deserializesFromJson() throws Exception {
        String json = """
                {
                  "name": "Terra Blade",
                  "weaponClass": "MELEE",
                  "element": "NEUTRAL",
                  "baseDamage": 55,
                  "criticalChance": 10,
                  "attacksPerTurn": 2.0,
                  "range": 3,
                  "rarity": 16,
                  "price": 100,
                  "quality": 8,
                  "abilities": "Corta em linha reta",
                  "description": "Uma lamina lendaria",
                  "imageUrl": ""
                }
                """;

        WeaponController.WeaponRequestDTO dto =
                objectMapper.readValue(json, WeaponController.WeaponRequestDTO.class);

        assertThat(dto.getName()).isEqualTo("Terra Blade");
        assertThat(dto.getWeaponClass()).isEqualTo("MELEE");
        assertThat(dto.getBaseDamage()).isEqualTo(55);
        assertThat(dto.getRarity()).isEqualTo(16);
        assertThat(dto.getPrice()).isEqualTo(100);
    }

    @Test
    void weaponRequestDTO_deserializesEmptyJsonObject() throws Exception {
        WeaponController.WeaponRequestDTO dto =
                objectMapper.readValue("{}", WeaponController.WeaponRequestDTO.class);

        assertThat(dto).isNotNull();
        assertThat(dto.getName()).isNull();
    }
}
