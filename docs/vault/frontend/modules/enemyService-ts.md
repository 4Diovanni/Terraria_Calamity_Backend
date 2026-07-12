---
tags: [frontend, service, enemy, mock-data]
aliases: [enemyService, enemyService.ts]
up: "[[EnemyPages]]"
related:
  - "[[biomeService-ts]]"
  - "[[bossService-ts]]"
status: ativo
source: src/frontend/src/services/enemyService.ts
---

# enemyService.ts

Client de inimigos — **dados mockados estáticos** (`MOCK_ENEMIES`), sem backend.

## Métodos

### `getAllEnemies() -> Enemy[]`
Cópia de todos. **Chamado por:** [[EnemyPages]] (`EnemiesPage`).

### `getEnemyById(id) -> Enemy`
Cópia de um; erro se não achar. **Chamado por:** [[EnemyPages]] (`EnemyDetailPage`).

### `getEnemiesByBiome(biome) -> Enemy[]`
Filtra pelo campo `biome` (string). **Chamado por:** [[BiomePages]] (`BiomeDetailPage`)
para listar as criaturas do bioma.

## Conexões

- Sem contraparte no backend (ver [[Backend-MOC]]).
- Reaproveitado por [[BiomePages]] via `getEnemiesByBiome` (casamento por string com
  [[biomeService-ts]]).
