---
tags: [frontend, hook, auth]
aliases: [useAuth]
up: "[[AuthPages]]"
related:
  - "[[AuthContext]]"
status: ativo
source: src/frontend/src/hooks/useAuth.ts
---

# useAuth.ts

Hook de acesso ao [[AuthContext]].

## Métodos

### `useAuth() -> AuthContextValue`
Lê o [[AuthContext]] via `useContext`; lança se usado fora do `AuthProvider`.
**Chamado por:** todo componente que precisa de sessão — [[AuthPages]] (login/register),
[[ProfilePage]], `ProtectedRoute`, `Header`, [[WeaponsPage]] (para saber se pode criar arma).

## Conexões

- Único ponto de leitura do [[AuthContext]].
