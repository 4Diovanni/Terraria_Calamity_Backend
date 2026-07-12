---
tags: [backend, config, security]
aliases: [SecurityConfig]
up: "[[Auth]]"
related:
  - "[[JwtAuthenticationFilter]]"
  - "[[RateLimitFilter]]"
  - "[[CustomUserDetailsService]]"
status: ativo
source: src/main/java/com/terraria/calamity/config/SecurityConfig.java
---

# SecurityConfig

Configuração central de segurança: stateless via JWT, CORS, e o mapa de
autorização por rota. `@EnableWebSecurity` + `@EnableMethodSecurity` (habilita
`@PreAuthorize` usado em [[AdminController]]/[[SubmissionController]]).

## Métodos (beans)

### `passwordEncoder() -> PasswordEncoder`
BCrypt. Usado por [[AuthService]] e pelo `authenticationProvider`.

### `authenticationManager(AuthenticationConfiguration) -> AuthenticationManager`
Expõe o manager que [[AuthService]]`.login` usa.

### `authenticationProvider(CustomUserDetailsService, PasswordEncoder) -> AuthenticationProvider`
`DaoAuthenticationProvider` ligando [[CustomUserDetailsService]] + BCrypt.

### `corsConfigurationSource() -> CorsConfigurationSource`
Libera localhost (3000/5173/8000) e o padrão `*.vercel.app`, com credenciais.

### `jwtFilterRegistration(...)` / `rateLimitFilterRegistration(...)`
Registram os filtros com `enabled=false` para impedir o **registro automático
duplicado** no container de servlets — eles são adicionados só na cadeia via
`addFilterBefore` (nota não óbvia).

### `securityFilterChain(HttpSecurity, ...) -> SecurityFilterChain`
Monta a cadeia: CSRF off, sessão STATELESS, regras de autorização (register/login e
GETs públicos; POST/PUT/DELETE de arma só ADMIN; `/admin/**` só ADMIN; submissions
autenticado), e a ordem dos filtros: [[RateLimitFilter]] antes de
[[JwtAuthenticationFilter]] antes do `UsernamePasswordAuthenticationFilter`.

## Conexões

- Orquestra [[JwtAuthenticationFilter]], [[RateLimitFilter]], [[CustomUserDetailsService]].
- Regras detalhadas em [[SECURITY_IMPLEMENTATION]].
