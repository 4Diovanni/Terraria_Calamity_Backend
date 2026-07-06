# Frontend: Validação Real de Sessão (bug do "Entrar" sumindo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o bug em que o link "Entrar" da navbar às vezes fica escondido mesmo quando o usuário não está de fato autenticado, fazendo o `AuthContext` validar a sessão contra o backend (`GET /api/v1/auth/me`) em vez de só decodificar o JWT salvo no `localStorage`.

**Architecture:** `AuthContext` deixa de confiar na decodificação local do payload do JWT para "reidratar" o usuário no mount. Em vez disso, se houver um token salvo, ele chama `authService.getCurrentUser()` (novo método que bate no `GET /api/v1/auth/me`); em caso de sucesso popula `user`, em caso de erro (401/rede) limpa o token e mantém `user = null`. O `Header` passa a respeitar `isLoading` para não piscar "Entrar" e depois trocar de estado enquanto essa checagem (agora assíncrona, potencialmente lenta por causa do cold start do Render) está em andamento.

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, axios.

## Global Constraints

- Rodar `npx vitest run` em `src/frontend` após cada task — todos os testes devem passar antes do commit.
- Commits atômicos (Conventional Commits), um por task.
- Branch: `fix/frontend-auth-session-validation`, criada a partir de `main` atualizada. NUNCA misturar backend nesta branch.
- Depende do endpoint `GET /api/v1/auth/me` do plano `2026-07-06-backend-auth-me-endpoint.md` já mergeado (ou rodando localmente).
- Não usar emojis nos componentes. Usar tokens `calamity-*` (nenhuma mudança visual de cor é necessária nesta correção).

---

### Task 1: `authService.getCurrentUser()`

**Files:**
- Modify: `src\frontend\src\services\authService.ts`

**Interfaces:**
- Consumes: `apiClient` (axios instance já configurada, injeta o Bearer token automaticamente via interceptor — `src\frontend\src\services\apiClient.ts:55-73`).
- Produces: `authService.getCurrentUser(): Promise<AuthUser>` — usado pelo `AuthContext` (Task 2).

- [ ] **Step 1: Implementar o método**

Adicionar ao objeto `authService` em `authService.ts` (após `register`, antes do `};` final):

```ts
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(`${BASE_URL}/me`);
    return response.data;
  },
```

Ajustar o import do topo do arquivo para incluir `AuthUser`:

```ts
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
```

- [ ] **Step 2: Verificar compilação de tipos**

Run: `cd src/frontend && npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/src/services/authService.ts
git commit -m "feat(auth): adiciona authService.getCurrentUser para validar sessao no backend"
```

---

### Task 2: `AuthContext` valida o token contra o backend no mount

**Files:**
- Modify: `src\frontend\src\context\AuthContext.tsx`
- Test: `src\frontend\src\context\AuthContext.test.tsx`

**Interfaces:**
- Consumes: `authService.getCurrentUser()` (Task 1), `setAuthToken`/`removeAuthToken` (`apiClient.ts`, já usados no arquivo).
- Produces: mesmo contrato público `AuthContextValue` (`user`, `token`, `isLoading`, `login`, `register`, `logout`) — nenhuma mudança de assinatura, só de comportamento interno do `useEffect` de mount.

- [ ] **Step 1: Escrever/reescrever os testes que exercitam o mount**

Em `AuthContext.test.tsx`, atualizar o mock do `authService` (linhas 9-14) para incluir `getCurrentUser`:

```tsx
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));
```

Substituir os dois testes `'rehydrates user from a valid (non-expired) token in localStorage'` e `'clears an expired token from localStorage on mount'` (linhas 126-162) por:

```tsx
  it('rehydrates user by validating the stored token against the backend', async () => {
    localStorage.setItem('jwt_token', 'stored.jwt.token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      username: 'stored',
      email: 'stored@example.com',
      role: 'USER',
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('user').textContent).toBe('stored');
    expect(screen.getByTestId('token').textContent).toBe('stored.jwt.token');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('stored.jwt.token');
  });

  it('clears an invalid/expired token when the backend rejects it on mount', async () => {
    localStorage.setItem('jwt_token', 'stale.jwt.token');
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(apiClientModule.removeAuthToken).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `cd src/frontend && npx vitest run src/context/AuthContext.test.tsx`
Expected: FAIL — o mount ainda decodifica o token localmente e nunca chama `authService.getCurrentUser`.

- [ ] **Step 3: Reescrever o `useEffect` de mount do `AuthProvider`**

Em `AuthContext.tsx`, substituir o bloco `useEffect` (linhas 35-48):

```tsx
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      const payload = decodeJwtPayload(storedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        setAuthToken(storedToken);
        setToken(storedToken);
        setUser({ username: payload.username, email: payload.email, role: payload.role });
      } else {
        removeAuthToken();
      }
    }
    setIsLoading(false);
  }, []);
```

por:

```tsx
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setAuthToken(storedToken);
    authService
      .getCurrentUser()
      .then((currentUser) => {
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(() => {
        removeAuthToken();
      })
      .finally(() => setIsLoading(false));
  }, []);
```

Remover a função `decodeJwtPayload` (linhas 17-28), que fica sem uso.

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run src/context/AuthContext.test.tsx`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/context/AuthContext.tsx src/frontend/src/context/AuthContext.test.tsx
git commit -m "fix(auth): valida a sessao com o backend no carregamento em vez de confiar so no exp local do JWT"
```

---

### Task 3: `Header` respeita `isLoading` para não piscar entre estados

**Files:**
- Modify: `src\frontend\src\components\common\Header.tsx`
- Test: `src\frontend\src\components\common\Header.test.tsx`

**Interfaces:**
- Consumes: `isLoading` de `useAuth()` (já existe na interface `AuthContextValue`, só não era lido pelo `Header` até agora).
- Produces: nenhuma mudança de props/exports públicos do componente.

- [ ] **Step 1: Escrever os testes que falham**

Adicionar em `Header.test.tsx`, dentro do `describe('Header', ...)`, após o teste `'shows username as link to /perfil when user is logged in'`:

```tsx
  it('does not show "Entrar" while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ ...noUser, isLoading: true });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: /entrar/i })).not.toBeInTheDocument();
  });

  it('does not show the username link while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ ...withUser, isLoading: true });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: 'Arcanjo' })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `cd src/frontend && npx vitest run src/components/common/Header.test.tsx`
Expected: FAIL — hoje o `Header` ignora `isLoading` e sempre mostra "Entrar" ou o usuário.

- [ ] **Step 3: Ler `isLoading` e usá-lo para esconder as duas branches**

Em `Header.tsx`, linha 50, trocar:

```tsx
  const { user } = useAuth();
```

por:

```tsx
  const { user, isLoading } = useAuth();
```

Envolver a condição do bloco desktop (linhas 98-120):

```tsx
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              ...
            </div>
          ) : (
            <Link to="/login" ...>
              Entrar
            </Link>
          )}
```

com um gate em `isLoading`:

```tsx
          {!isLoading && (user ? (
            <div className="hidden md:flex items-center gap-4">
              ...
            </div>
          ) : (
            <Link to="/login" ...>
              Entrar
            </Link>
          ))}
```

E o mesmo para o bloco do drawer mobile (linhas 136-161), envolvendo o `{user ? (...) : (...)}` interno com `{!isLoading && (...)}`.

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run src/components/common/Header.test.tsx`
Expected: PASS (todos os testes da suíte, incluindo os 2 novos).

- [ ] **Step 5: Rodar a suíte completa do frontend para checar regressões**

Run: `cd src/frontend && npx vitest run`
Expected: PASS — todos os 31+ testes (31 pré-existentes + os adicionados nesta e nas tasks anteriores).

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/common/Header.tsx src/frontend/src/components/common/Header.test.tsx
git commit -m "fix(header): esconde Entrar/usuario enquanto a sessao ainda esta sendo validada"
```

---

## Validação manual (após todas as tasks)

Conforme as regras do projeto, parar aqui e validar no browser antes de abrir o PR:

1. Fazer login normalmente → navbar mostra usuário, `/perfil` funciona.
2. Fechar a aba, reabrir o site dentro de 24h → navbar deve mostrar o usuário de novo (sessão real, validada contra o backend) sem flash de "Entrar".
3. No DevTools, editar/corromper o valor de `jwt_token` no `localStorage` (ex.: trocar um caractere) e recarregar → a navbar deve mostrar "Entrar" corretamente, sem estado "logado fantasma".
4. Testar em mobile (375px) e desktop (1280px), dark e light mode.
5. Testar com o backend "frio" (cold start do Render) para confirmar que o `Header` não pisca "Entrar" durante o carregamento — deve ficar em branco naquele slot até resolver.
