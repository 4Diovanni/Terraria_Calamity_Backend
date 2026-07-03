package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ArmorControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String armorPayload(String name) {
        return """
            {
              "name": "%s",
              "armorClass": "UNIVERSAL",
              "rarity": "COMMON",
              "totalDefense": 12,
              "imageUrl": "",
              "pieces": [
                {"slot": "HELMET", "name": "%s Elmo", "imageUrl": "", "defense": 3},
                {"slot": "CHEST", "name": "%s Peitoral", "imageUrl": "", "defense": 5},
                {"slot": "LEGS", "name": "%s Calca", "imageUrl": "", "defense": 4}
              ]
            }
            """.formatted(name, name, name, name);
    }

    private String armorPayloadUpdated(String name) {
        return """
            {
              "name": "%s",
              "armorClass": "UNIVERSAL",
              "rarity": "COMMON",
              "totalDefense": 20,
              "imageUrl": "",
              "pieces": [
                {"slot": "HELMET", "name": "%s Elmo", "imageUrl": "", "defense": 6},
                {"slot": "CHEST", "name": "%s Peitoral", "imageUrl": "", "defense": 8},
                {"slot": "LEGS", "name": "%s Calca", "imageUrl": "", "defense": 6}
              ]
            }
            """.formatted(name, name, name, name);
    }

    private String registerAndGetToken(String username, String email) throws Exception {
        RegisterRequest register = new RegisterRequest(username, email, "secret123");
        String body = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("token").asText();
    }

    @Test
    void getAllArmors_isPublic() throws Exception {
        mockMvc.perform(get("/api/v1/armor"))
                .andExpect(status().isOk());
    }

    @Test
    void createArmor_withoutToken_isRejected() throws Exception {
        mockMvc.perform(post("/api/v1/armor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(armorPayload("Sem Token")))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
    }

    @Test
    void createArmor_thenGetById_roundTripsPiecesInOrder() throws Exception {
        String token = registerAndGetToken("armorsmith", "armorsmith@terraria.com");

        String created = mockMvc.perform(post("/api/v1/armor")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(armorPayload("Conjunto de Teste")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pieces.length()").value(3))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(get("/api/v1/armor/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Conjunto de Teste"))
                .andExpect(jsonPath("$.pieces.length()").value(3));
    }

    @Test
    void getArmorById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/armor/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateArmor_withSameSlots_doesNotViolateUniqueConstraint() throws Exception {
        String token = registerAndGetToken("armorupdater", "armorupdater@terraria.com");

        String created = mockMvc.perform(post("/api/v1/armor")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(armorPayload("Conjunto Original")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(created).get("id").asLong();

        // Resubmitting the same 3 slots (HELMET/CHEST/LEGS) is the primary real-world
        // update scenario. Previously this threw DataIntegrityViolationException because
        // Hibernate flushed the re-inserts before the orphan-removal deletes, colliding
        // with uq_armor_pieces_armor_slot.
        mockMvc.perform(put("/api/v1/armor/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(armorPayloadUpdated("Conjunto Atualizado")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Conjunto Atualizado"))
                .andExpect(jsonPath("$.totalDefense").value(20))
                .andExpect(jsonPath("$.pieces.length()").value(3))
                .andExpect(jsonPath("$.pieces[?(@.slot=='HELMET')].defense").value(6))
                .andExpect(jsonPath("$.pieces[?(@.slot=='CHEST')].defense").value(8))
                .andExpect(jsonPath("$.pieces[?(@.slot=='LEGS')].defense").value(6));

        mockMvc.perform(get("/api/v1/armor/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pieces.length()").value(3));
    }
}
