# Página de Perfil do Usuário — Design Spec

**Data:** 2026-07-01
**Escopo:** Página `/perfil` com dados do usuário autenticado e botão de logout. Refatoração do Header para transformar o username em link de navegação para o perfil.

---

## 1. Objetivo

Criar uma página de perfil view-only (`/perfil`) acessada ao clicar no username no Header. A página exibe os dados do usuário autenticado (username, email, role) e contém o botão "Sair", que sai do Header. A página exige autenticação — usuários não autenticados são redirecionados para `/login`.

---

## 2. Arquitetura

### Visão geral

```
App.tsx
  └── <AuthProvider>
        ├── /login → <LoginPage>
        ├── /register → <RegisterPage>
        └── /* → <Layout>
              └── /perfil → <ProtectedRoute> → <ProfilePage>
                  (redireciona para /login se user === null)

Header.tsx (modificado)
  ├── Desktop: <Link to="/perfil">{user.username}</Link>  (era <span>)
  ├── Desktop: remove botão "Sair"
  ├── Mobile drawer: <Link to="/perfil">{user.username}</Link>
  └── Mobile drawer: remove botão "Sair"

ProfilePage.tsx (novo)
  └── usa useAuth() → { user, logout }
      └── card codex + botão logout → navigate('/login')
```

### ProtectedRoute

Componente simples que redireciona para `/login` se o usuário não estiver autenticado:

```tsx
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;           // evita flash de redirect durante rehydrate
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
```

Este é o primeiro uso de `ProtectedRoute` no projeto (a spec anterior de auth preparou a arquitetura para isso).

---

## 3. Estrutura de Arquivos

### Novos

| Arquivo | Responsabilidade |
|---|---|
| `src/components/common/ProtectedRoute.tsx` | Redireciona para /login se não autenticado |
| `src/components/pages/ProfilePage.tsx` | Página de perfil do usuário |
| `src/components/pages/ProfilePage.test.tsx` | Testes da página de perfil |
| `src/components/common/ProtectedRoute.test.tsx` | Testes do ProtectedRoute |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | Adiciona rota `/perfil` envolta em `<ProtectedRoute>` |
| `src/components/common/Header.tsx` | Username vira `<Link to="/perfil">`, remove botão "Sair" |
| `src/components/common/Header.test.tsx` | Adiciona testes para link do username |

---

## 4. Design Visual

### Brief de design

**Sujeito:** Terraria Calamity RPG — codex de jogo dark fantasy.
**Audiência:** Jogador autenticado.
**Trabalho da página:** Mostrar quem você é no mundo do jogo.

### Tokens utilizados

Apenas tokens `calamity-*` do Tailwind — sem hex hardcoded. Tipografia herdada do CSS global: Cinzel para display/labels, Crimson Text para corpo.

### Elemento de assinatura

Os dados do usuário são apresentados como uma **entrada de codex** — não como um formulário genérico. Uma borda lateral esquerda em `calamity-accent-gold` (`border-l-2`) marca a "ficha do aventureiro" como entrada selecionada no codex. Role é exibida como "classificação de entidade", email como "coordenada de contato".

### Layout (mobile-first, 375px → 1280px)

```
┌─────────────────────────────────────┐
│  [Header]                           │
├─────────────────────────────────────┤
│                                     │
│  container mx-auto px-4 py-12      │
│                                     │
│  PERFIL DO AVENTUREIRO              │  Cinzel, text-xs uppercase tracking-[0.2em]
│  ── divider ───────────────────     │  border-calamity-border
│                                     │
│  ┌── border-l-2 accent-gold ─────┐  │
│  │  [username]                   │  │  text-2xl font-display text-calamity-text-primary
│  │                               │  │
│  │  ENTIDADE    USUÁRIO          │  │  label: text-xs Cinzel muted | valor: Cinzel primary
│  │  CONTATO     email@...        │  │  label: text-xs Cinzel muted | valor: Crimson Text secondary
│  └───────────────────────────────┘  │
│                                     │
│  ── divider ───────────────────     │
│                                     │
│  [ Encerrar sessão ]                │  button outline, text-calamity-text-secondary
│                                     │
└─────────────────────────────────────┘
```

**Desktop (md:):** card centralizado com `max-w-lg mx-auto`, padding maior.

### Estados

- **isLoading (rehydrate):** `ProtectedRoute` retorna `null` (sem flash de redirect)
- **user === null após rehydrate:** redirect automático para `/login` via `ProtectedRoute`
- **Logout:** chama `logout()` do `AuthContext` + `navigate('/login')`

### Botão "Encerrar sessão"

```tsx
<button
  type="button"
  onClick={() => { logout(); navigate('/login'); }}
  className="text-sm font-display uppercase tracking-wider
             text-calamity-text-secondary hover:text-calamity-primary
             border border-calamity-border hover:border-calamity-primary
             px-4 py-2 transition-colors duration-300"
>
  Encerrar sessão
</button>
```

Discreto por design — o logout não precisa de destaque visual na página de perfil; o usuário já tem o contexto.

---

## 5. Header Refatorado

### Desktop — antes vs depois

**Antes:**
```tsx
<span className="text-sm font-display text-calamity-text-secondary">
  {user.username}
</span>
<button onClick={() => { logout(); navigate('/login'); }}>Sair</button>
```

**Depois:**
```tsx
<Link
  to="/perfil"
  className="text-sm font-display text-calamity-text-secondary
             hover:text-calamity-text-primary transition-colors duration-300"
>
  {user.username}
</Link>
```

### Mobile drawer — antes vs depois

**Antes:**
```tsx
<span className="block text-sm font-display text-calamity-text-secondary mb-3">
  {user.username}
</span>
<button onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}>Sair</button>
```

**Depois:**
```tsx
<Link
  to="/perfil"
  onClick={() => setMenuOpen(false)}
  className="block text-sm font-display text-calamity-text-secondary
             hover:text-calamity-text-primary transition-colors duration-300"
>
  {user.username}
</Link>
```

---

## 6. Testes

Os 55 testes existentes devem continuar passando. Novos testes:

### ProtectedRoute.test.tsx

| Cenário | Comportamento esperado |
|---|---|
| `user === null`, `isLoading === false` | Redireciona para `/login` |
| `isLoading === true` | Renderiza `null` (sem redirect) |
| `user` autenticado | Renderiza `children` |

### ProfilePage.test.tsx

| Cenário | Comportamento esperado |
|---|---|
| Renderiza com usuário autenticado | Exibe username, email, role |
| Role "USER" | Exibe "USUÁRIO" (label traduzida) |
| Role "ADMIN" | Exibe "ADMINISTRADOR" |
| Clique em "Encerrar sessão" | Chama `logout()` |
| Após logout | Navega para `/login` |

### Header.test.tsx (adições)

| Cenário | Comportamento esperado |
|---|---|
| Usuário autenticado — desktop | Exibe link com username apontando para `/perfil` |
| Usuário autenticado — drawer | Link do username fecha o drawer ao clicar |
| Usuário autenticado | Não exibe botão "Sair" no Header |

---

## 7. Regras de Design Aplicadas

- Tokens `calamity-*` exclusivamente — sem hex hardcoded
- Sem emojis
- Mobile-first: classes base para 375px, `md:` para desktop
- Tap targets: botão "Encerrar sessão" com `px-4 py-2` (≥ 44px de altura com line-height)
- Elemento de assinatura (`border-l-2 calamity-accent-gold`) é o único detalhe decorativo — tudo mais é disciplinado e silencioso
- Label de role traduzida para PT-BR na UI (`USER` → `USUÁRIO`, `ADMIN` → `ADMINISTRADOR`)
