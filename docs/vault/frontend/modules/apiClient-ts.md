---
tags: [frontend, service, http]
aliases: [apiClient, apiClient.ts]
up: "[[Frontend-MOC]]"
related:
  - "[[authService-ts]]"
  - "[[weaponService-ts]]"
  - "[[useAuth]]"
status: ativo
source: src/frontend/src/services/apiClient.ts
---

# apiClient.ts

Instância Axios central usada por **todos** os services que batem no backend. Injeta o
JWT, trata erros por status e sobrevive ao cold start do Render (free tier) com
retry + backoff.

## Exports / Métodos

### instância `apiClient` (default export)
Axios com `baseURL` (`VITE_API_URL`), timeout 15s, `Content-Type: application/json`.

### interceptor de request
Anexa `Authorization: Bearer <token>` lendo `localStorage.jwt_token`; loga em debug.

### interceptor de response
Em erro retryável (timeout/rede/sem resposta) reexecuta até 3× com backoff
exponencial (base 3s), notificando o `retryListener`. Mapeia status para mensagem:
401 → limpa token e redireciona a `/login` (exceto em rotas `/auth/`, que propagam o
erro pra UI); 403/404/409/500 → mensagens específicas (409 usa a mensagem do backend).

### `onRetry(listener)` -> void
Registra callback disparado antes de cada retry (UI "acordando servidor" — ver [[useWeapons]]).

### `setAuthToken(token)` / `removeAuthToken()` -> void
Grava/remove o JWT no `localStorage` e no header default. **Chamado por:** [[AuthContext]].

### `clearInterceptors()` -> void
Limpa interceptors (uso em testes).

## Conexões

- Base de [[authService-ts]], [[weaponService-ts]], [[armorService-ts]],
  [[submissionService-ts]], [[adminService-ts]].
- `setAuthToken`/`removeAuthToken` orquestrados por [[AuthContext]] (ver [[AuthPages]]).
