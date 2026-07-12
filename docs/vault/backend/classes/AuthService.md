---
tags: [backend, service, auth]
aliases: [AuthService]
up: "[[Auth]]"
related:
  - "[[AuthController]]"
  - "[[JwtService]]"
  - "[[UserRepository]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/AuthService.java
---

# AuthService

Orquestra registro e login. `@Transactional`.

## Métodos

### `register(RegisterRequest) -> AuthResponse`
Valida unicidade de e-mail/username (`DuplicateResourceException`), faz hash BCrypt,
persiste com `Role.USER` e emite JWT. **Chamado por:** [[AuthController]].
**Chama:** [[UserRepository]], `PasswordEncoder`, [[JwtService]]`.generateToken`.

### `login(LoginRequest) -> AuthResponse`
Autentica via `AuthenticationManager`; erro vira `BadCredentialsException`. Emite JWT.
**Chamado por:** [[AuthController]]. **Chama:** [[JwtService]], [[UserRepository]].

### `getCurrentUser(email) -> UserResponse`
Busca o usuário do token e devolve `username`/`email`/`role`. **Chamado por:**
[[AuthController]]`.me`. **Chama:** [[UserRepository]]`.findByEmail`.

## Conexões

- Depende de [[UserRepository]], [[JwtService]], `PasswordEncoder` e
  `AuthenticationManager` (configurados em [[SecurityConfig]]).
- Exposto por [[AuthController]].
