---
tags: [frontend, admin, page]
aliases: [Painel Administrativo Frontend, AdminPage]
up: "[[Frontend-MOC]]"
related:
  - "[[Contributions]]"
  - "[[WeaponsPage]]"
status: ativo
source:
  - src/frontend/src/components/pages/AdminDashboardView.tsx
  - src/frontend/src/components/pages/AdminContributeView.tsx
  - src/frontend/src/services/adminService.ts
---

# Admin — Painel Administrativo (Frontend)

Área exclusiva de admin com duas abas: números agregados do sistema e fila de revisão
de submissões pendentes.

## Arquivos

- `AdminDashboardView.tsx` — cards com `totalUsers`, `totalAdmins`, `totalWeapons`,
  `pendingSubmissions`, `approvedSubmissions`, `rejectedSubmissions`
- `AdminContributeView.tsx` — fila de submissões filtrável por status
  (`PENDING`/`APPROVED`/`REJECTED`), com diff inline ([[Contributions]]), botão
  "Ver preview completo" (`SubmissionPreview`), aprovar/rejeitar (motivo obrigatório)
- `adminService.ts` — chamada ao endpoint `GET /api/v1/admin/dashboard`

## Conexões

- Consome o endpoint descrito em [[Admin]] (nota-índice do backend em
  `docs/vault/backend/Admin.md`).
- Fila de revisão reaproveita [[Contributions]] (diff, preview, badge de status).
- Acesso restrito a `role: ADMIN` — ver [[Auth]] (nota-índice do backend).
