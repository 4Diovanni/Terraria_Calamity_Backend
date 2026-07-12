---
tags: [frontend, profile, page]
aliases: [Página de Perfil, ProfilePage]
up: "[[Frontend-MOC]]"
related:
  - "[[AdminPage]]"
  - "[[Contributions]]"
  - "[[AuthPages]]"
status: ativo
source:
  - src/frontend/src/components/pages/ProfilePage.tsx
---

# ProfilePage — Hub de Perfil e Área Logada

Rota `/perfil`, protegida por [[AuthPages]] (`ProtectedRoute`). Único componente que
hospeda as três abas da área logada — **não são rotas próprias**.

## Abas

- **Perfil** — dados do usuário logado (`username`, `role`)
- **Contribuições** — `AdminContributeView` se `role === 'ADMIN'`, senão
  `UserContributeView` (ver [[Contributions]])
- **Dashboard** — `AdminDashboardView`, aba só visível/acessível para `role === 'ADMIN'`
  (ver [[AdminPage]])

## Conexões

- Gateway único para [[AdminPage]] e [[Contributions]] — ambas as notas descrevem
  views renderizadas aqui dentro, não páginas/rotas independentes.
- Acesso via `ProtectedRoute` — ver [[AuthPages]].
