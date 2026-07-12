---
tags: [frontend, service, biome, mock-data]
aliases: [biomeService, biomeService.ts]
up: "[[BiomePages]]"
related:
  - "[[enemyService-ts]]"
  - "[[bossService-ts]]"
status: ativo
source: src/frontend/src/services/biomeService.ts
---

# biomeService.ts

Client de biomas — **dados mockados estáticos** (`MOCK_BIOMES`), sem backend. O
`Biome.name` casa em texto com o campo `biome` dos inimigos (ver [[enemyService-ts]]),
o que permite a página do bioma listar suas criaturas.

## Métodos

### `getAllBiomes() -> Biome[]`
Cópia de todos. **Chamado por:** [[BiomePages]] (`BiomesPage`).

### `getBiomeById(id) -> Biome`
Cópia de um; erro se não achar. **Chamado por:** [[BiomePages]] (`BiomeDetailPage`,
junto de [[enemyService-ts]]`.getEnemiesByBiome`).

## Conexões

- Sem contraparte no backend (ver [[Backend-MOC]]).
- Usado junto de [[enemyService-ts]] em `BiomeDetailPage`.
