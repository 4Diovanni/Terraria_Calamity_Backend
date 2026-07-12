---
tags: [backend, config, auth]
aliases: [JwtAuthenticationFilter]
up: "[[Auth]]"
related:
  - "[[JwtService]]"
  - "[[CustomUserDetailsService]]"
  - "[[SecurityConfig]]"
status: ativo
source: src/main/java/com/terraria/calamity/config/JwtAuthenticationFilter.java
---

# JwtAuthenticationFilter

`OncePerRequestFilter` que autentica a requisição a partir do Bearer token. Registrado
na cadeia por [[SecurityConfig]].

## Métodos

### `doFilterInternal(request, response, chain) -> void`
Lê `Authorization: Bearer <token>`; se ausente, segue sem autenticar (cabe à
[[SecurityConfig]] barrar rotas protegidas). Se presente e o contexto ainda vazio:
extrai o e-mail ([[JwtService]]`.extractEmail`), carrega o usuário
([[CustomUserDetailsService]]`.loadUserByUsername`), e se habilitado/não-bloqueado,
popula o `SecurityContext`. Token inválido/expirado → segue não autenticado
(exceção engolida de propósito).

## Conexões

- Depende de [[JwtService]] (validação) e [[CustomUserDetailsService]] (carga do usuário).
- Ordenado por [[SecurityConfig]] logo após [[RateLimitFilter]].
