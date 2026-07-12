---
tags: [frontend, context, auth]
aliases: [AuthContext, AuthProvider]
up: "[[AuthPages]]"
related:
  - "[[useAuth]]"
  - "[[authService-ts]]"
  - "[[apiClient-ts]]"
status: ativo
source: src/frontend/src/context/AuthContext.tsx
---

# AuthContext.tsx

Estado global de sessão (`user`, `token`, `isLoading`, `login`, `register`, `logout`).
`AuthProvider` embrulha a app (em `App.tsx`); consumido via [[useAuth]].

## Exports / Métodos

### `AuthContext` (createContext)
Contrato `AuthContextValue`. Lido por [[useAuth]].

### `AuthProvider({children})`
Provider. No mount: se há token no `localStorage`, chama [[authService-ts]]`.getCurrentUser`
para **validar a sessão contra o backend**; sucesso popula `user`, falha limpa o token.
Mantém `isLoading=true` até resolver (o Header depende disso pra não piscar "Entrar").

### `login(email, password)` / `register(username, email, password)` -> Promise
Chamam [[authService-ts]], então `setAuthToken` ([[apiClient-ts]]) e populam `user`/`token`.

### `logout()` -> void
`removeAuthToken` ([[apiClient-ts]]) e zera `user`/`token`.

## Conexões

- Exposto por [[useAuth]]; consome [[authService-ts]] e o token de [[apiClient-ts]].
- Base do fluxo de [[AuthPages]] e do guard em [[ProfilePage]].
