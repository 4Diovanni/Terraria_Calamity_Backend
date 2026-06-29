package com.terraria.calamity.application.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-key-for-terraria-calamity-rpg-1234567890", 86400000L);

    @Test
    void generateToken_thenExtractEmail_returnsSameEmail() {
        String token = jwtService.generateToken("player@terraria.com");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractEmail(token)).isEqualTo("player@terraria.com");
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void isValid_returnsFalse_forTamperedToken() {
        String token = jwtService.generateToken("player@terraria.com");

        assertThat(jwtService.isValid(token + "tampered")).isFalse();
    }
}
