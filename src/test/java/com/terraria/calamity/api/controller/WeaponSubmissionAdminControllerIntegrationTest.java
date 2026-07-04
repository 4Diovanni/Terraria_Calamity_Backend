package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WeaponSubmissionAdminControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private WeaponRepository weaponRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String tokenFor(String email, Role role) {
        userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password(passwordEncoder.encode("secret123"))
                .role(role)
                .enabled(true)
                .build());
        return jwtService.generateToken(email);
    }

    private Long createPendingSubmission(String authorToken) throws Exception {
        WeaponSubmissionRequestDTO dto = new WeaponSubmissionRequestDTO(
                null, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
        String body = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void listPending_asUser_isForbidden() throws Exception {
        String userToken = tokenFor("listuser@terraria.com", Role.USER);

        mockMvc.perform(get("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void approve_createSubmission_publishesWeaponAndMarksApproved() throws Exception {
        String authorToken = tokenFor("author-approve@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-approve@terraria.com", Role.ADMIN);
        long weaponCountBefore = weaponRepository.count();

        Long submissionId = createPendingSubmission(authorToken);

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        Assertions.assertThat(weaponRepository.count()).isEqualTo(weaponCountBefore + 1);
    }

    @Test
    void reject_setsStatusAndReason() throws Exception {
        String authorToken = tokenFor("author-reject@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-reject@terraria.com", Role.ADMIN);

        Long submissionId = createPendingSubmission(authorToken);

        RejectSubmissionRequestDTO rejectDTO = new RejectSubmissionRequestDTO("Dano muito alto para a raridade");

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Dano muito alto para a raridade"));
    }

    @Test
    void approve_twice_returnsConflict() throws Exception {
        String authorToken = tokenFor("author-double@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-double@terraria.com", Role.ADMIN);

        Long submissionId = createPendingSubmission(authorToken);

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }
}
