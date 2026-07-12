---
tags: [frontend, service, auth]
aliases: [authService, authService.ts]
up: "[[AuthPages]]"
related:
  - "[[apiClient-ts]]"
  - "[[AuthContext]]"
  - "[[AuthController]]"
status: ativo
source: src/frontend/src/services/authService.ts
---

# authService.ts

Client HTTP de autenticação (`/api/v1/auth`), sobre [[apiClient-ts]]. Contraparte
frontend do [[AuthController]].

## Métodos

### `login(LoginRequest) -> AuthResponse`
`POST /login`. **Chama:** [[AuthController]]`.login`. **Chamado por:** [[AuthContext]].

### `register(RegisterRequest) -> AuthResponse`
`POST /register`. **Chama:** [[AuthController]]`.register`.

### `getCurrentUser() -> AuthUser`
`GET /me` — valida a sessão contra o backend. **Chama:** [[AuthController]]`.me`.
**Chamado por:** [[AuthContext]] ao reidratar a sessão.

## Conexões

- Sobre [[apiClient-ts]]; consumido por [[AuthContext]] (ver [[AuthPages]]).
- Espelha o [[AuthController]] do backend.
