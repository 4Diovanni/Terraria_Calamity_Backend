---
tags: [frontend, service, boss, mock-data]
aliases: [bossService, bossService.ts]
up: "[[BossPages]]"
related:
  - "[[biomeService-ts]]"
  - "[[enemyService-ts]]"
status: ativo
source: src/frontend/src/services/bossService.ts
---

# bossService.ts

Client de bosses — **dados mockados estáticos** (`MOCK_BOSSES`), sem backend
correspondente. Assinatura assíncrona de propósito, para trocar por chamada HTTP real
sem tocar nas páginas quando o endpoint existir.

## Métodos

### `getAllBosses() -> Boss[]`
Devolve cópia (`clone` via JSON) de todos. **Chamado por:** [[BossPages]] (`BossesPage`).

### `getBossById(id) -> Boss`
Cópia de um boss; erro se não achar. **Chamado por:** [[BossPages]] (`BossDetailPage`).

## Conexões

- Sem contraparte no backend (ver [[Backend-MOC]]).
- Mesmo padrão de mock de [[biomeService-ts]] e [[enemyService-ts]].
