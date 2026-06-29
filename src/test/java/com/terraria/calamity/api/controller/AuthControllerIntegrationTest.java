package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AuthControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    @Test
    void register_thenLogin_succeeds() throws Exception {
        RegisterRequest register = new RegisterRequest("provid", "provid@terraria.com", "secret123");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("provid"))
                .andExpect(jsonPath("$.role").value("USER"));

        LoginRequest login = new LoginRequest("provid@terraria.com", "secret123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void register_duplicateEmail_returnsConflict() throws Exception {
        RegisterRequest first = new RegisterRequest("dup1", "dup@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        RegisterRequest second = new RegisterRequest("dup2", "dup@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_wrongPassword_returnsUnauthorized() throws Exception {
        RegisterRequest register = new RegisterRequest("wrongpw", "wrongpw@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("wrongpw@terraria.com", "wrongpass");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_invalidEmail_returnsBadRequest() throws Exception {
        RegisterRequest bad = new RegisterRequest("baduser", "not-an-email", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }
}
