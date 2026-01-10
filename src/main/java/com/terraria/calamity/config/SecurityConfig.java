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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuração de Segurança da Aplicação
 *
 * Define quais endpoints são públicos e quais requerem autenticação.
 * Endpoints GET para listar armas são públicos.
 * Endpoints POST/PUT/DELETE requerem autenticação (a ser implementada com JWT).
 *
 * IMPORTANTE: Os paths devem corresponder exatamente aos @RequestMapping dos controllers!
 * - Controller: @RequestMapping("/api/v1/weapons")
 * - Security: /api/v1/weapons
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
     * Configuração de CORS
     * Permite requisições do frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
            "*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configuração de segurança HTTP
     * Define permissões de acesso para cada endpoint
     *
     * ✅ Paths estão corrigidos para corresponder aos @RequestMapping
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Habilita CORS
            .cors().and()
            
            // Desabilita CSRF (frontend SPA)
            .csrf().disable()
            
            // Define política de sessão (stateless para APIs REST)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            
            // Autorização de requisições
            .authorizeHttpRequests(authz -> authz
                // ========== ENDPOINTS PÚBLICOS (GET) ==========
                // ✅ Listar todas as armas - GET /api/v1/weapons
                .requestMatchers("GET", "/api/v1/weapons").permitAll()
                
                // ✅ Obter arma por ID - GET /api/v1/weapons/{id}
                .requestMatchers("GET", "/api/v1/weapons/**").permitAll()
                
                // ✅ Buscar armas por elemento - GET /api/v1/weapons/element/{element}
                .requestMatchers("GET", "/api/v1/weapons/element/**").permitAll()
                
                // ✅ Buscar armas por classe - GET /api/v1/weapons/class/**
                .requestMatchers("GET", "/api/v1/weapons/class/**").permitAll()
                
                // ✅ Buscar armas por raridade - GET /api/v1/weapons/rarity/**
                .requestMatchers("GET", "/api/v1/weapons/rarity/**").permitAll()
                
                // ✅ Buscar armas por nome - GET /api/v1/weapons/search**
                .requestMatchers("GET", "/api/v1/weapons/search**").permitAll()
                
                // Health checks e actuator
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                
                // ========== ENDPOINTS PROTEGIDOS ==========
                // ❌ Criar arma (requer autenticação - admin) - POST /api/v1/weapons
                .requestMatchers("POST", "/api/v1/weapons").authenticated()
                
                // ❌ Atualizar arma (requer autenticação - admin) - PUT /api/v1/weapons/{id}
                .requestMatchers("PUT", "/api/v1/weapons/**").authenticated()
                
                // ❌ Deletar arma (requer autenticação - admin) - DELETE /api/v1/weapons/{id}
                .requestMatchers("DELETE", "/api/v1/weapons/**").authenticated()
                
                // ========== Qualquer outra requisição requer autenticação ==========
                .anyRequest().authenticated()
            )
            
            // HTTP Basic Auth (temporário, será substituído por JWT)
            .httpBasic();
        
        return http.build();
    }
}
