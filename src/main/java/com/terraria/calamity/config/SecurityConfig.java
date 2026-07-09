package com.terraria.calamity.config;

import com.terraria.calamity.application.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuração de Segurança — autenticação stateless via JWT.
 * Endpoints públicos: apenas POST /api/v1/auth/register e /login, além de
 * GETs de weapons/elements/armor e actuator. O restante de /api/v1/auth/,
 * incluindo GET /me, exige autenticação. Demais endpoints exigem um JWT
 * válido (Authorization: Bearer <token>).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8000"
        ));
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://terraria-calamity-backend*.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(
            RateLimitFilter filter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RateLimitFilter rateLimitFilter,
            AuthenticationProvider authenticationProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // API REST stateless com JWT → CSRF desabilitado
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // ========== AUTENTICAÇÃO (público) ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()

                // ========== ENDPOINTS PÚBLICOS (GET) ==========
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/elements**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor/**").permitAll()

                // Health checks e actuator
                .requestMatchers("/actuator/**").permitAll()

                // ========== ARMAS — SOMENTE ADMIN (direto, sem fila) ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/weapons").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/weapons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/weapons/**").hasRole("ADMIN")

                // ========== ARMADURAS (fora do escopo desta spec — preservado como estava) ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/armor").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/armor/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/armor/**").authenticated()

                // ========== FILA DE SUBMISSÕES — QUALQUER AUTENTICADO ==========
                // (regras finas de ADMIN dentro deste path via @PreAuthorize nos métodos)
                .requestMatchers("/api/v1/submissions/**").authenticated()

                // ========== DASHBOARD ADMINISTRATIVO — SOMENTE ADMIN ==========
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            // jwtAuthenticationFilter precisa ser registrado antes (contra um filtro built-in)
            // para que sua ordem exista quando rateLimitFilter o referencia como âncora abaixo.
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
