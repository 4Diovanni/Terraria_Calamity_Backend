---
tags: [frontend, service, admin]
aliases: [adminService, adminService.ts]
up: "[[AdminPage]]"
related:
  - "[[apiClient-ts]]"
  - "[[AdminController]]"
status: ativo
source: src/frontend/src/services/adminService.ts
---

# adminService.ts

Client HTTP do painel admin (`/api/v1/admin`), sobre [[apiClient-ts]]. Contraparte
frontend do [[AdminController]].

## Métodos

### `getDashboard() -> AdminDashboard`
`GET /dashboard`. **Chamado por:** [[AdminPage]] (`AdminDashboardView`). **Chama:**
[[AdminController]]`.getDashboard`. Só funciona para `ROLE_ADMIN` (backend retorna 403 senão).

## Conexões

- Sobre [[apiClient-ts]]; consumido por [[AdminPage]].
- Espelha o [[AdminController]] do backend.
