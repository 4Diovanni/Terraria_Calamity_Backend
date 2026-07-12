---
tags: [frontend, admin, page]
aliases: [Painel Administrativo Frontend, AdminPage]
up: "[[Frontend-MOC]]"
related:
  - "[[Contributions]]"
  - "[[WeaponsPage]]"
  - "[[ProfilePage]]"
status: ativo
source:
  - src/frontend/src/components/pages/AdminDashboardView.tsx
  - src/frontend/src/components/pages/AdminContributeView.tsx
  - src/frontend/src/services/adminService.ts
---

# Admin — Views Administrativas (Frontend)

**Não é uma rota própria** — não existe `/admin` no `App.tsx`. Estas duas views são
renderizadas dentro das abas "Contribuições" e "Dashboard" de [[ProfilePage]]
(rota `/perfil`), condicionadas a `user?.role === 'ADMIN'`.

## Arquivos

- `AdminDashboardView.tsx` — cards com `totalUsers`, `totalAdmins`, `totalWeapons`,
  `pendingSubmissions`, `approvedSubmissions`, `rejectedSubmissions`
- `AdminContributeView.tsx` — fila de submissões filtrável por status
  (`PENDING`/`APPROVED`/`REJECTED`), com diff inline ([[Contributions]]), botão
  "Ver preview completo" (`SubmissionPreview`), aprovar/rejeitar (motivo obrigatório)
- `adminService.ts` — chamada ao endpoint `GET /api/v1/admin/dashboard`

## Módulos (notas de método)

- [[adminService-ts]] — client HTTP do dashboard (espelha [[AdminController]])

## Conexões

- Consome o endpoint descrito em [[Admin]] (nota-índice do backend em
  `docs/vault/backend/Admin.md`).
- Fila de revisão reaproveita [[Contributions]] (diff, preview, badge de status).
- Acesso restrito a `role: ADMIN` — ver [[Auth]] (nota-índice do backend).
- Montado dentro de [[ProfilePage]], não é uma rota independente.
