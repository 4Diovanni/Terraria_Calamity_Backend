---
tags: [backend, service, auth]
aliases: [CustomUserDetailsService]
up: "[[Auth]]"
related:
  - "[[UserRepository]]"
  - "[[SecurityConfig]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/CustomUserDetailsService.java
---

# CustomUserDetailsService

Ponte entre o `User` do domínio e o Spring Security. Implementa `UserDetailsService`;
usa o **e-mail como "username"**.

## Métodos

### `loadUserByUsername(email) -> UserDetails`
Busca o `User` por e-mail (`UsernameNotFoundException` se não achar) e o adapta para
`UserDetails` com a authority `ROLE_<role>` e o flag `disabled` a partir de `enabled`.
**Chamado por:** Spring Security (via `AuthenticationManager`, durante o login em
[[AuthService]]). **Chama:** [[UserRepository]]`.findByEmail`.

## Conexões

- Registrado como `UserDetailsService` em [[SecurityConfig]].
- Depende de [[UserRepository]].
