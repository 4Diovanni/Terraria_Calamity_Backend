package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
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
class WeaponSubmissionControllerIntegrationTest {

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

    private String createSubmissionJson(Long targetWeaponId) throws Exception {
        WeaponSubmissionRequestDTO dto = new WeaponSubmissionRequestDTO(
                targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
        return objectMapper.writeValueAsString(dto);
    }

    @Test
    void create_asAuthenticatedUser_returnsCreatedWithPendingStatus() throws Exception {
        String token = tokenFor("submitter1@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.type").value("CREATE"))
                .andExpect(jsonPath("$.submittedByUsername").value("submitter1"));
    }

    @Test
    void create_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status != 401 && status != 403) {
                        throw new AssertionError("Expected 401 or 403, got " + status);
                    }
                });
    }

    @Test
    void findMine_returnsOnlyOwnSubmissions() throws Exception {
        String tokenA = tokenFor("mineA@terraria.com", Role.USER);
        String tokenB = tokenFor("mineB@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/weapon-submissions/mine")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/v1/weapon-submissions/mine")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void cancel_byNonAuthor_isForbidden() throws Exception {
        String authorToken = tokenFor("author2@terraria.com", Role.USER);
        String otherToken = tokenFor("stranger2@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/weapon-submissions/" + submissionId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void cancel_byAuthor_returnsNoContent() throws Exception {
        String authorToken = tokenFor("author3@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/weapon-submissions/" + submissionId)
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isNoContent());
    }
}
