package com.terraria.calamity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuração de Segurança da Aplicação
 *
 * Define quais endpoints são públicos e quais requerem autenticação.
 * Endpoints GET para listar armas são públicos.
 * Endpoints POST/PUT/DELETE requerem autenticação (a ser implementada).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    /**
     * Encoder de senha usando BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Gerenciador de autenticação
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configuração de segurança HTTP
     * Define permissões de acesso para cada endpoint
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desabilita CSRF (frontend SPA)
            .csrf().disable()
            
            // Define política de sessão (stateless para APIs)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            
            // Autorização de requisições
            .authorizeHttpRequests(authz -> authz
                // ========== ENDPOINTS PÚBLICOS (GET) ==========
                // Listar todas as armas
                .requestMatchers("GET", "/api/weapons").permitAll()
                // Obter arma por ID
                .requestMatchers("GET", "/api/weapons/**").permitAll()
                // Health checks e actuator
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                
                // ========== ENDPOINTS PROTEGIDOS ==========
                // Criar arma (requer autenticação - admin)
                .requestMatchers("POST", "/api/weapons").authenticated()
                // Atualizar arma (requer autenticação - admin)
                .requestMatchers("PUT", "/api/weapons/**").authenticated()
                // Deletar arma (requer autenticação - admin)
                .requestMatchers("DELETE", "/api/weapons/**").authenticated()
                
                // Qualquer outra requisição requer autenticação
                .anyRequest().authenticated()
            )
            
            // HTTP Basic Auth (temporário, será substituído por JWT)
            .httpBasic();
        
        return http.build();
    }
}
