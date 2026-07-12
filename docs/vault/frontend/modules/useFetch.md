---
tags: [frontend, hook]
aliases: [useFetch]
up: "[[Frontend-MOC]]"
related:
  - "[[useWeapons]]"
status: ativo
source: src/frontend/src/hooks/useFetch.ts
---

# useFetch.ts

Hook genérico de fetch de dados por URL.

## Métodos

### `useFetch<T>(url, options?) -> { data, loading, error, refetch }`
`GET` na `url` via `axios` (dispara quando `dependencies` mudam; `skip` pula). Estado
data/loading/error + `refetch` manual.

## Notas

**Usa `axios` direto, não [[apiClient-ts]]** — logo, sem JWT, sem retry/backoff, sem o
tratamento de erro central. Sem uso conhecido nas páginas atuais (os módulos de dado
usam services dedicados). Candidato a revisão/remoção ou a migrar para o `apiClient`.

## Conexões

- Utilitário genérico; hoje efetivamente não conectado ao fluxo de dados real
  (que passa por [[apiClient-ts]] + services).
