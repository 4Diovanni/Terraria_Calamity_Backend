---
tags: [frontend, ui, design-system]
aliases: [Design System, UIComponents, Componentes de UI]
up: "[[Frontend-MOC]]"
related:
  - "[[Carousel]]"
status: ativo
source:
  - src/frontend/src/components/ui/Button.tsx
  - src/frontend/src/components/ui/Card.tsx
  - src/frontend/src/components/ui/Badge.tsx
  - src/frontend/src/components/ui/StateComponents.tsx
  - src/frontend/src/components/ui/Drawer.tsx
  - src/frontend/src/components/ui/DetailLayout.tsx
  - src/frontend/src/components/ui/EntityHero.tsx
  - src/frontend/src/components/ui/StatBar.tsx
  - src/frontend/src/components/ui/MarkdownContent.tsx
  - src/frontend/src/components/ui/DetailFooter.tsx
  - src/frontend/src/components/ui/PageSidebar.tsx
  - src/frontend/src/components/ui/ScrollToTop.tsx
  - src/frontend/src/components/ui/ThemeToggle.tsx
  - src/frontend/src/components/ui/index.ts
---

# UIComponents — Design System (`components/ui`)

Componentes de UI reutilizáveis, exportados via barrel `index.ts`. [[Carousel]] tem
nota própria por ser peça central do layout das páginas de conteúdo.

## Arquivos

- `Button.tsx`, `Card.tsx` (+ `CardHeader`/`CardBody`/`CardFooter`), `Badge.tsx` —
  primitivos de UI
- `StateComponents.tsx` — `Loading`, `Error`, `Success`, `EmptyState`, `Skeleton`
- `Drawer.tsx` — painel lateral (usado em criação/edição de arma, revisão de
  submissão); ganhou prop `size` opcional (ver plano de preview de submissões)
- `DetailLayout.tsx`, `EntityHero.tsx`, `StatBar.tsx`, `MarkdownContent.tsx`,
  `DetailFooter.tsx` — blocos padronizados das páginas de detalhe (arma, armadura,
  boss, bioma, inimigo)
- `PageSidebar.tsx` — barra lateral de navegação/filtro
- `ScrollToTop.tsx`, `ThemeToggle.tsx` — utilitários de UX e alternância dark/light

## Notas

Todo componente aqui segue os tokens `calamity-*` do Tailwind, sem hex hardcoded
(exceto cores semânticas de gameplay/lore, ex. `themeColor` em [[BossPages]]) —
regra do `CLAUDE.md`.

## Conexões

- Usado por todas as páginas de listagem/detalhe: [[WeaponsPage]], [[ArmorPages]],
  [[BossPages]], [[BiomePages]], [[EnemyPages]].
