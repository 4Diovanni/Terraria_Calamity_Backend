package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

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

    @Test
    void getDashboard_asUser_isForbidden() throws Exception {
        String token = tokenFor("dashuser@terraria.com", Role.USER);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getDashboard_asAdmin_returnsCounts() throws Exception {
        String token = tokenFor("dashadmin@terraria.com", Role.ADMIN);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.totalAdmins").isNumber())
                .andExpect(jsonPath("$.totalWeapons").isNumber());
    }
}
