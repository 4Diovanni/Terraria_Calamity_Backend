---
tags: [frontend, moc]
aliases: [Frontend, Mapa do Frontend]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Infra-MOC]]"
status: ativo
source:
  - src/frontend/src
---

# Frontend — Mapa

React + Vite + TypeScript + Tailwind. Identidade visual descrita em [[visual-identity]]
(skill `visual-identity`, tokens `calamity-*`).

## Módulos indexados

- [[Carousel]] — componente de carrossel reutilizável (`layout` fixo por seção)
- [[WeaponsPage]] — listagem, formulário e preview de armas

## Módulos ainda não indexados (retrofit futuro)

- Páginas de conteúdo: Armor, Boss, Biome, Enemy (`components/pages/*Page.tsx`)
- Autenticação de UI: `LoginPage`, `RegisterPage`, `ProtectedRoute`
- Perfil e contribuições: `ProfilePage`, `UserContributeView`, `AdminContributeView`
- Admin: `AdminDashboardView`, `SubmissionDiff`, `SubmissionPreview`
- `components/ui/*` — Badge, Button, Card, DetailFooter

## Estrutura

- `components/common` — layout, header, footer, rotas protegidas
- `components/pages` — uma página ou view por arquivo, com `*.test.tsx` par
- `components/ui` — componentes de UI reutilizáveis (design system)

## Conexões

- Consome a API do [[Backend-MOC]].
- Testes: `npx vitest run` (ver [[feedback_project_workflow]] na memória do projeto).
