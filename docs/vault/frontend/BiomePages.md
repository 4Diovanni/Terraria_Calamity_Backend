---
tags: [frontend, biome, page, mock-data]
aliases: [Página de Biomas, BiomePages]
up: "[[Frontend-MOC]]"
related:
  - "[[BossPages]]"
  - "[[EnemyPages]]"
status: ativo
source:
  - src/frontend/src/components/pages/BiomesPage.tsx
  - src/frontend/src/components/pages/BiomeDetailPage.tsx
  - src/frontend/src/components/pages/BiomeCard.tsx
  - src/frontend/src/components/pages/BiomeFacts.tsx
  - src/frontend/src/services/biomeService.ts
  - src/frontend/src/types/biome.ts
---

# BiomePages — Listagem e Detalhe de Bioma

Listagem e detalhe de bioma; a página de detalhe também lista os inimigos daquele
bioma, buscados via [[EnemyPages]].

## Arquivos

- `BiomesPage.tsx` — listagem
- `BiomeDetailPage.tsx` — detalhe; busca `biomeService` + `enemyService` juntos para
  montar a lista de criaturas do bioma
- `BiomeCard.tsx` / `BiomeFacts.tsx` — card na listagem e bloco de fatos (localização,
  momento do jogo, perigo) no detalhe
- `biomeService.ts` — **dados mockados estáticos**, o backend ainda não modela bioma
- `types/biome.ts` — `Biome` (summary, facts, imageUrl)

## Notas

Sem contraparte no backend. `Biome.name` casa em texto (string, sem FK) com o campo
`biome` de [[EnemyPages]] e [[BossPages]] — é assim que `BiomeDetailPage` filtra os
inimigos do bioma.

## Conexões

- Consumido junto com [[EnemyPages]] em `BiomeDetailPage.tsx`.
