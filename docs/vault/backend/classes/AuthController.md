---
tags: [backend, controller, auth]
aliases: [AuthController]
up: "[[Auth]]"
related:
  - "[[AuthService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/AuthController.java
---

# AuthController

Controller REST de autenticação, base `/api/v1/auth`. Delega tudo ao [[AuthService]].

## Métodos

### `register(RegisterRequest) -> 201 + AuthResponse`
Cria usuário e devolve JWT. **Chama:** [[AuthService]]`.register`. Público.

### `login(LoginRequest) -> 200 + AuthResponse`
Autentica por e-mail/senha e devolve JWT. **Chama:** [[AuthService]]`.login`. Público.

### `me(Authentication) -> 200 + UserResponse`
Devolve os dados do usuário logado a partir do token já validado pelo
[[JwtAuthenticationFilter]]. **Chama:** [[AuthService]]`.getCurrentUser`. Protegido
(cai na regra `authenticated()`).

## Conexões

- Única dependência: [[AuthService]].
- Regras de acesso público/protegido definidas em [[SecurityConfig]].
- Consumido pelo frontend via `authService.ts` (ver [[AuthPages]]).
