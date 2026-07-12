---
tags: [frontend, auth, page]
aliases: [Login e Registro, AuthPages]
up: "[[Frontend-MOC]]"
related:
  - "[[ProfilePage]]"
status: ativo
source:
  - src/frontend/src/components/pages/LoginPage.tsx
  - src/frontend/src/components/pages/RegisterPage.tsx
  - src/frontend/src/components/common/AuthLayout.tsx
  - src/frontend/src/components/common/ProtectedRoute.tsx
  - src/frontend/src/hooks/useAuth.ts
  - src/frontend/src/context/AuthContext.tsx
  - src/frontend/src/services/authService.ts
---

# AuthPages — Login, Registro e Rota Protegida

Telas públicas de autenticação (rotas `/login` e `/register`, fora do `Layout`
principal) e o guard de rota usado por [[ProfilePage]].

## Arquivos

- `LoginPage.tsx` — formulário de login; trata 401 (credenciais inválidas) e 400
  (validação) com mensagens distintas
- `RegisterPage.tsx` — formulário de registro
- `AuthLayout.tsx` — moldura visual compartilhada pelas duas telas
- `ProtectedRoute.tsx` — redireciona para `/login` se `!user` (aguarda `isLoading`
  antes de decidir)
- `useAuth.ts` — hook de acesso ao `AuthContext`
- `AuthContext.tsx` — estado global de sessão (`user`, `login`, `register`, `logout`)
- `authService.ts` — client HTTP de `/api/v1/auth`

## Módulos (notas de método)

- [[authService-ts]] — client HTTP de auth (espelha [[AuthController]])
- [[AuthContext]] — estado global de sessão (validação no mount, login/register/logout)
- [[useAuth]] — hook de acesso ao contexto de sessão

## Conexões

- Protege o acesso a [[ProfilePage]] via `ProtectedRoute`.
- Consome a API descrita em [[Auth]] (nota-índice do backend).
