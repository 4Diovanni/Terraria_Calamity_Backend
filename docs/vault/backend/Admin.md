---
tags: [backend, admin]
aliases: [Admin, Painel Administrativo]
up: "[[Backend-MOC]]"
related:
  - "[[Submission]]"
  - "[[Auth]]"
  - "[[AdminPage]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/AdminController.java
  - src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java
  - src/main/java/com/terraria/calamity/domain/dto/AdminDashboardResponseDTO.java
---

# Admin — Painel Administrativo (Backend)

Endpoint único de dashboard, exclusivo para role `ADMIN`, com contagens agregadas do
sistema.

## Arquivos

- `AdminController.java` — `GET /api/v1/admin/dashboard`, `@PreAuthorize("hasRole('ADMIN')")`
- `AdminDashboardService.java` — agrega contagens: total de usuários, total de admins,
  total de armas, submissões pendentes/aprovadas/rejeitadas
- `AdminDashboardResponseDTO.java` — payload de resposta do dashboard

## Classes (notas de método)

- [[AdminController]] — rota `GET /dashboard` (só admin)
- [[AdminDashboardService]] — agrega as contagens

## Conexões

- Protegido por [[Auth]] (role `ADMIN` via `@PreAuthorize`).
- Números agregados vêm de `UserRepository`, `WeaponRepository` e
  `SubmissionRepository` (ver [[Submission]]).
- Consumido pelo frontend em `AdminDashboardView.tsx` — ver [[AdminPage]].
