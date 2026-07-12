---
tags: [backend, controller, admin]
aliases: [AdminController]
up: "[[Admin]]"
related:
  - "[[AdminDashboardService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/AdminController.java
---

# AdminController

Controller REST do painel admin, base `/api/v1/admin`. Uma única rota, restrita a
`ROLE_ADMIN` via `@PreAuthorize`.

## Métodos

### `getDashboard() -> AdminDashboardResponseDTO`
`GET /dashboard`. Devolve as contagens agregadas do sistema.
**Chama:** [[AdminDashboardService]]`.getDashboard`. `@PreAuthorize("hasRole('ADMIN')")`.

## Conexões

- Única dependência: [[AdminDashboardService]].
- Consumido pelo frontend via `adminService.ts` (ver [[AdminPage]]).
