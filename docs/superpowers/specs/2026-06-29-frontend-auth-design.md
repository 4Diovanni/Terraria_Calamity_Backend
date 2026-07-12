---
tags: [spec, frontend, auth]
aliases: [Frontend Auth Login e Register — Design]
up: "[[INDEX]]"
related:
  - "[[AuthPages]]"
  - "[[Auth]]"
  - "[[2026-06-29-frontend-auth-login-register]]"
status: ativo
---

# Frontend Auth (Login / Register) — Design Spec

> Ver também: plano: [[2026-06-29-frontend-auth-login-register]] · [[AuthPages]] · [[Auth]]

**Data:** 2026-06-29  
**Escopo:** Páginas de login e registro no frontend React, consumindo a API de auth do backend (PR #37).

---

## 1. Objetivo

Criar as telas de login (`/login`) e registro (`/register`) no frontend React, integrando com os endpoints `POST /api/v1/auth/login` e `POST /api/v1/auth/register` do backend Spring Boot já implementado.

---

## 2. Arquitetura

### Visão geral

```
AuthContext (Provider em App.tsx)
  ├── estado: { user: AuthUser | null, token: string | null, isLoading: boolean }
  ├── ações: login(email, password), register(username, email, password), logout()
  └── rehydrate: lê jwt_token do localStorage no mount

authService.ts
  ├── POST /api/v1/auth/login   → AuthResponse
  └── POST /api/v1/auth/register → AuthResponse

App.tsx
  ├── <AuthProvider> envolve tudo
  │   ├── /login → <LoginPage>  (fora do <Layout>)
  │   ├── /register → <RegisterPage> (fora do <Layout>)
  │   └── demais rotas dentro do <Layout> existente

useAuth hook
  └── atalho para useContext(AuthContext); lança erro se usado fora do Provider
```

O `apiClient.ts` já faz `localStorage.removeItem('jwt_token')` e redireciona para `/login` em respostas 401 — esse comportamento é preservado sem alteração.

### Suporte futuro a rotas protegidas

O `AuthContext` expõe `user` e `isLoading`. Quando for necessário, um `ProtectedRoute` pode ser implementado como:

```tsx
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
```

Isso não é implementado nesta spec — apenas a arquitetura é preparada para isso.

---

## 3. Estrutura de Arquivos

### Novos

| Arquivo | Responsabilidade |
|---|---|
| `src/context/AuthContext.tsx` | Provider, estado global de auth, ações login/register/logout |
| `src/hooks/useAuth.ts` | `useContext(AuthContext)` com guard de null |
| `src/services/authService.ts` | Chamadas HTTP para `/api/v1/auth/*` via `apiClient` |
| `src/types/auth.ts` | `AuthUser`, `AuthResponse`, `LoginRequest`, `RegisterRequest` |
| `src/components/common/AuthLayout.tsx` | Layout centralizado sem header/footer |
| `src/components/pages/LoginPage.tsx` | Formulário de login |
| `src/components/pages/RegisterPage.tsx` | Formulário de registro |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | Adiciona `<AuthProvider>`, rotas `/login` e `/register` fora do `<Layout>` |
| `src/services/index.ts` | Re-exporta `authService` |
| `src/hooks/index.ts` | Re-exporta `useAuth` |
| `src/types/index.ts` | Re-exporta `auth.ts` |

### Testes

| Arquivo de teste | Cobre |
|---|---|
| `src/context/AuthContext.test.tsx` | login, register, logout, rehydrate do localStorage |
| `src/services/authService.test.ts` | chamadas HTTP mockadas com `axios-mock-adapter` |
| `src/components/pages/LoginPage.test.tsx` | render, submit, erro inline, loading |
| `src/components/pages/RegisterPage.test.tsx` | render, submit, erro inline, loading |

---

## 4. Tipos (`src/types/auth.ts`)

```ts
export interface AuthUser {
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
```

---

## 5. AuthContext (`src/context/AuthContext.tsx`)

### Estado
```ts
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}
```

### Ações
- `login(email, password)` → chama `authService.login()`, salva token via `setAuthToken()`, atualiza `user`
- `register(username, email, password)` → chama `authService.register()`, mesma sequência
- `logout()` → chama `removeAuthToken()`, limpa `user` e `token`

### Rehydrate
No `useEffect` inicial, lê `localStorage.getItem('jwt_token')`. Se existir, decodifica o payload (segundo segmento do JWT, base64url) para extrair `{ username, email, role, exp }`. Se `exp * 1000 > Date.now()`, restaura o estado sem chamada à API. Se expirado, chama `removeAuthToken()` e mantém `user: null`.

---

## 6. authService (`src/services/authService.ts`)

```ts
const login = (data: LoginRequest): Promise<AuthResponse>
const register = (data: RegisterRequest): Promise<AuthResponse>
```

Ambas usam `apiClient` (axios já configurado com base URL e interceptors).

---

## 7. Fluxo de Dados

### Login
```
LoginPage
  → authContext.login(email, password)
    → authService.login()  [POST /api/v1/auth/login]
      ✓ 200 → setAuthToken(token) + user no contexto → navigate('/')
      ✗ 401 → erro inline: "E-mail ou senha inválidos"
      ✗ 400 → erro inline: "Preencha todos os campos corretamente"
      ✗ rede  → erro inline: "Erro de conexão. Tente novamente."
```

### Register
```
RegisterPage
  → authContext.register(username, email, password)
    → authService.register()  [POST /api/v1/auth/register]
      ✓ 201 → setAuthToken(token) + user no contexto → navigate('/')
      ✗ 409 → erro inline: "E-mail ou nome de usuário já cadastrado"
      ✗ 400 → erro inline: "Preencha todos os campos corretamente"
      ✗ rede  → erro inline: "Erro de conexão. Tente novamente."
```

### Estado do formulário (por página)
- `isSubmitting: boolean` — desabilita botão + exibe `isLoading` no componente `Button` existente durante a chamada
- `error: string | null` — mensagem inline abaixo do botão de submit
- Campos controlados com `useState` simples (sem biblioteca de formulário)

### Logout
Qualquer componente chama `authContext.logout()` → `removeAuthToken()` + limpa estado + `navigate('/login')`.

---

## 8. Design Visual

### AuthLayout
- Fundo: `bg-calamity-bg-dark`, tela inteira, sem header/footer
- Card centralizado: `bg-calamity-bg-secondary`, borda `border-calamity-border`, `rounded-none` (padrão do projeto)
- Logo/título "Terraria Calamity RPG" clicável, leva para `/`, fonte `Cinzel` (herdada do global CSS)
- Mobile-first: card ocupa `w-full max-w-md mx-auto`

### Inputs
- `bg-calamity-bg-tertiary`, borda `border-calamity-border`
- Foco: `focus:ring-2 focus:ring-calamity-primary focus:outline-none`
- Label acima do campo, fonte `Crimson Text`

### Botão de submit
- Componente `Button` existente com `variant="primary"`, `size="lg"`, `isLoading={isSubmitting}`, `className="w-full"`

### Erro inline
- `text-calamity-primary` (vermelho crimson), `text-sm`, aparece abaixo do botão após submit com falha

### Link de alternância
- `LoginPage` → link para `/register`: "Não tem conta? Registre-se"
- `RegisterPage` → link para `/login`: "Já tem conta? Entrar"
- Usa `<Link>` do React Router, cor `text-calamity-primary` (herdada do CSS global de links)

---

## 9. Regras de Design Aplicadas

- Tokens `calamity-*` do Tailwind em todos os componentes de tema — sem hex hardcoded
- Sem emojis
- Mobile-first: classes base para 375px, `sm:`/`md:` para desktop
- Componente `Button` existente reutilizado sem modificação

---

## 10. Testes — Cobertura Esperada

Os 31 testes existentes devem continuar passando. Novos testes:

| Cenário | Arquivo |
|---|---|
| `login()` sucesso → user no contexto + token salvo | `AuthContext.test.tsx` |
| `login()` falha → erro propagado | `AuthContext.test.tsx` |
| `register()` sucesso → user no contexto + token salvo | `AuthContext.test.tsx` |
| `logout()` → limpa estado e token | `AuthContext.test.tsx` |
| Rehydrate do localStorage no mount | `AuthContext.test.tsx` |
| `authService.login` → POST correto + retorna AuthResponse | `authService.test.ts` |
| `authService.register` → POST correto + retorna AuthResponse | `authService.test.ts` |
| LoginPage renderiza campos e botão | `LoginPage.test.tsx` |
| LoginPage submit com sucesso → sem erro visível | `LoginPage.test.tsx` |
| LoginPage submit com erro 401 → exibe mensagem inline | `LoginPage.test.tsx` |
| LoginPage botão desabilitado durante loading | `LoginPage.test.tsx` |
| RegisterPage renderiza campos username/email/password | `RegisterPage.test.tsx` |
| RegisterPage submit com sucesso → sem erro visível | `RegisterPage.test.tsx` |
| RegisterPage submit com erro 409 → exibe mensagem inline | `RegisterPage.test.tsx` |
| RegisterPage botão desabilitado durante loading | `RegisterPage.test.tsx` |
