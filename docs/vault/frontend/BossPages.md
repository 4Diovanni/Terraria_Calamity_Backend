---
tags: [frontend, boss, page, mock-data]
aliases: [Página de Bosses, BossPages]
up: "[[Frontend-MOC]]"
related:
  - "[[BiomePages]]"
  - "[[EnemyPages]]"
status: ativo
source:
  - src/frontend/src/components/pages/BossesPage.tsx
  - src/frontend/src/components/pages/BossDetailPage.tsx
  - src/frontend/src/components/pages/BossCard.tsx
  - src/frontend/src/components/pages/BossStat.tsx
  - src/frontend/src/services/bossService.ts
  - src/frontend/src/types/boss.ts
---

# BossPages — Listagem e Detalhe de Boss

Listagem com busca e página de detalhe com progressão, HP/dano/defesa e lore em
Markdown.

## Arquivos

- `BossesPage.tsx` — listagem com busca por nome
- `BossDetailPage.tsx` — detalhe (progressão, fases, stats, `markdownContent`)
- `BossCard.tsx` / `BossStat.tsx` — card na listagem e stat individual no detalhe
- `bossService.ts` — **dados mockados estáticos**, o backend ainda não modela boss
  (sem `BossController`); cada boss carrega `themeColor` (hex de lore) para tingir a
  página de detalhe
- `types/boss.ts` — `Boss` (progression, progressionLabel, phases, hp, damage,
  defense, markdownContent, flavorText)

## Notas

Sem contraparte no backend — ver [[Backend-MOC]] (todos os módulos de backend já
indexados, nenhum cobre boss). `themeColor` é a exceção documentada de hex
hardcoded para cor semântica de lore (regra do `CLAUDE.md`).

## Conexões

- `biome` do boss casa em texto com `Biome.name` em [[BiomePages]] (sem FK real,
  string).
