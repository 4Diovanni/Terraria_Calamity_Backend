package com.terraria.calamity.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Disponibiliza um bean {@link ObjectMapper} (Jackson clássico —
 * {@code com.fasterxml.jackson}) para uso interno em conversões Map↔DTO,
 * como em {@code WeaponPayloadMapper}. O Spring Boot 4.1 nesta stack de
 * dependências não registra automaticamente um bean desse tipo (a
 * autoconfiguração de JSON da camada HTTP usa o namespace Jackson 3
 * {@code tools.jackson}), então este bean é explícito e não interfere na
 * serialização HTTP do Spring MVC.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
