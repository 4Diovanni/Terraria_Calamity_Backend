---
tags: [frontend, hook, weapons]
aliases: [useWeapons]
up: "[[WeaponsPage]]"
related:
  - "[[weaponService-ts]]"
  - "[[apiClient-ts]]"
status: ativo
source: src/frontend/src/hooks/useWeapons.ts
---

# useWeapons.ts

Hook que carrega a lista de armas da API uma vez ao montar, com estado de
"acordando servidor" durante os retries de cold start.

## Métodos

### `useWeapons() -> { weapons, loading, error, wakingUp, retryAttempt, refetch }`
No mount, chama [[weaponService-ts]]`.getAllWeapons`. Registra um `onRetry`
([[apiClient-ts]]) para expor `wakingUp`/`retryAttempt` enquanto o apiClient retenta
(cold start do Render). `refetch` permite recarregar manualmente. **Chamado por:**
[[WeaponsPage]].

## Conexões

- Sobre [[weaponService-ts]]; usa o `onRetry` de [[apiClient-ts]].
- Consumido por [[WeaponsPage]].
