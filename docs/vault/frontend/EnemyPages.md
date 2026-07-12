---
tags: [frontend, enemy, page, mock-data]
aliases: [Página de Inimigos, EnemyPages]
up: "[[Frontend-MOC]]"
related:
  - "[[BiomePages]]"
  - "[[BossPages]]"
status: ativo
source:
  - src/frontend/src/components/pages/EnemiesPage.tsx
  - src/frontend/src/components/pages/EnemyDetailPage.tsx
  - src/frontend/src/components/pages/EnemyCard.tsx
  - src/frontend/src/components/pages/EnemyChip.tsx
  - src/frontend/src/services/enemyService.ts
  - src/frontend/src/types/enemy.ts
---

# EnemyPages — Listagem e Detalhe de Inimigo

Listagem e detalhe de inimigo comum (não-boss), com tipo (`EnemyType`), stats e lore.

## Arquivos

- `EnemiesPage.tsx` — listagem
- `EnemyDetailPage.tsx` — detalhe (stats via `StatBar`, `markdownContent`)
- `EnemyCard.tsx` / `EnemyChip.tsx` — card na listagem e chip compacto (usado dentro
  de `BiomeDetailPage`)
- `enemyService.ts` — **dados mockados estáticos**, o backend ainda não modela
  inimigo; assinatura assíncrona de propósito, para trocar por chamada real sem
  tocar nas páginas quando o endpoint existir
- `types/enemy.ts` — `Enemy`, `EnemyType`, `ENEMY_TYPE_LABEL`

## Notas

Sem contraparte no backend. Mesmo padrão de mock assíncrono de [[BossPages]] e
[[BiomePages]] — decisão deliberada de arquitetura (ver `Content pages roadmap` na
memória do projeto).

## Conexões

- Reaproveitado dentro de [[BiomePages]] (`BiomeDetailPage` lista inimigos do bioma).
