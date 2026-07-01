# Frontend Auth — Login e Register — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar as páginas `/login` e `/register` no frontend React que se comunicam com a API de auth do backend (`POST /api/v1/auth/login`, `POST /api/v1/auth/register`), gerenciando o JWT via `AuthContext` global.

**Architecture:** `AuthContext` (Provider em `App.tsx`) mantém `user`, `token` e `isLoading`; `authService` encapsula as chamadas HTTP; `AuthLayout` é o layout sem header/footer compartilhado pelas duas páginas. O `apiClient.ts` existente já lida com JWT no header e redirect 401 → sem alterações nele.

**Tech Stack:** React 19, React Router v7, TypeScript, Tailwind CSS (tokens `calamity-*`), Axios (apiClient existente), Vitest + Testing Library, `axios-mock-adapter`.

## Global Constraints

- Tokens Tailwind `calamity-*` em todos os estilos de tema — zero hex hardcoded nos componentes
- Sem emojis em nenhum componente
- Mobile-first: classes base para 375px, `sm:`/`md:` para desktop
- Componente `Button` existente em `src/frontend/src/components/ui/Button.tsx` — reutilizar sem modificação
- Todo commit deve passar todos os 31 testes existentes + novos testes da task
- Rodar testes: `cd src/frontend && npx vitest run`
- Branch: criar `feat/frontend-auth-login-register` a partir da `main` atualizada antes de começar
- Todos os arquivos novos ficam em `src/frontend/src/`
- API base URL: `VITE_API_URL` ou `http://localhost:8080` (proxy Vite `/api` → `http://localhost:8080`)
- Endpoints: `POST /api/v1/auth/login` (200) e `POST /api/v1/auth/register` (201)
- `AuthResponse` do backend: `{ token: string, type: "Bearer", username: string, email: string, role: "USER"|"ADMIN" }`
- Token salvo em `localStorage` via `setAuthToken()` / removido via `removeAuthToken()` (ambos em `apiClient.ts`)

---

### Task 1: Tipos de auth + authService

Cria os tipos TypeScript de auth e o serviço que encapsula as chamadas HTTP. Nenhuma UI — apenas camada de dados.

**Files:**
- Create: `src/frontend/src/types/auth.ts`
- Create: `src/frontend/src/services/authService.ts`
- Create: `src/frontend/src/services/authService.test.ts`
- Modify: `src/frontend/src/types/index.ts` (adicionar re-export)
- Modify: `src/frontend/src/services/index.ts` (adicionar re-export)

**Interfaces:**
- Consumes: `apiClient` de `../services/apiClient` (já existe)
- Produces:
  - `AuthUser { username: string; email: string; role: 'USER' | 'ADMIN' }` — consumido pelas Tasks 2, 3, 4
  - `AuthResponse { token: string; type: 'Bearer'; username: string; email: string; role: 'USER' | 'ADMIN' }` — consumido pelas Tasks 2, 3, 4
  - `LoginRequest { email: string; password: string }` — consumido pela Task 2
  - `RegisterRequest { username: string; email: string; password: string }` — consumido pela Task 2
  - `authService.login(data: LoginRequest): Promise<AuthResponse>` — consumido pela Task 2
  - `authService.register(data: RegisterRequest): Promise<AuthResponse>` — consumido pela Task 2

- [ ] **Step 1: Criar branch de desenvolvimento**

```bash
git checkout main && git pull origin main
git checkout -b feat/frontend-auth-login-register
```

- [ ] **Step 2: Escrever o teste do authService (vai falhar — arquivo não existe)**

Crie `src/frontend/src/services/authService.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { authService } from './authService';
import type { AuthResponse } from '../types/auth';

describe('authService', () => {
  let mock: MockAdapter;

  const mockAuthResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzM4NCJ9.payload.signature',
    type: 'Bearer',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('posts to /api/v1/auth/login and returns AuthResponse', async () => {
      mock.onPost('/api/v1/auth/login').reply(200, mockAuthResponse);

      const result = await authService.login({ email: 'test@example.com', password: 'secret' });

      expect(mock.history.post[0].url).toBe('/api/v1/auth/login');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates 400 errors from the API', async () => {
      mock.onPost('/api/v1/auth/login').reply(400, { message: 'Validation error' });

      await expect(
        authService.login({ email: 'bad', password: '' })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('register', () => {
    it('posts to /api/v1/auth/register and returns AuthResponse on 201', async () => {
      mock.onPost('/api/v1/auth/register').reply(201, mockAuthResponse);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret',
      });

      expect(mock.history.post[0].url).toBe('/api/v1/auth/register');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('propagates 409 errors from the API', async () => {
      mock.onPost('/api/v1/auth/register').reply(409, { message: 'Duplicate' });

      await expect(
        authService.register({ username: 'u', email: 'x@x.com', password: 'p' })
      ).rejects.toMatchObject({ status: 409 });
    });
  });
});
```

- [ ] **Step 3: Verificar que os testes falham**

```bash
cd src/frontend && npx vitest run src/services/authService.test.ts
```

Esperado: FAIL — `Cannot find module './authService'`

- [ ] **Step 4: Criar `src/frontend/src/types/auth.ts`**

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

- [ ] **Step 5: Criar `src/frontend/src/services/authService.ts`**

```ts
import apiClient from './apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const BASE_URL = '/api/v1/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/login`, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/register`, data);
    return response.data;
  },
};
```

Sem `try/catch` aqui — os erros (incluindo os transformados pelo interceptor do `apiClient`) propagam para o chamador (AuthContext), que decide a mensagem de erro por código HTTP.

- [ ] **Step 6: Adicionar re-exports nos barrels**

Em `src/frontend/src/types/index.ts`, adicionar ao final:
```ts
export * from './auth';
```

Em `src/frontend/src/services/index.ts`, adicionar ao final:
```ts
export * from './authService';
```

- [ ] **Step 7: Rodar todos os testes**

```bash
cd src/frontend && npx vitest run
```

Esperado: todos os testes passando (31 anteriores + 4 novos = 35 total)

- [ ] **Step 8: Commit**

```bash
git add src/frontend/src/types/auth.ts \
        src/frontend/src/types/index.ts \
        src/frontend/src/services/authService.ts \
        src/frontend/src/services/authService.test.ts \
        src/frontend/src/services/index.ts
git commit -m "feat(frontend): auth types and authService with login/register"
```

---

### Task 2: AuthContext + useAuth + App.tsx

Cria o contexto global de autenticação, o hook de conveniência e atualiza `App.tsx` para envolver tudo no `AuthProvider` e adicionar as rotas `/login` e `/register`.

**Files:**
- Create: `src/frontend/src/context/AuthContext.tsx`
- Create: `src/frontend/src/hooks/useAuth.ts`
- Create: `src/frontend/src/context/AuthContext.test.tsx`
- Modify: `src/frontend/src/hooks/index.ts` (adicionar re-export)
- Modify: `src/frontend/src/App.tsx` (AuthProvider + novas rotas)

**Interfaces:**
- Consumes:
  - `authService.login(data: LoginRequest): Promise<AuthResponse>` (Task 1)
  - `authService.register(data: RegisterRequest): Promise<AuthResponse>` (Task 1)
  - `AuthUser`, `AuthResponse` de `../types/auth` (Task 1)
  - `setAuthToken(token: string): void` de `../services/apiClient` (já existe)
  - `removeAuthToken(): void` de `../services/apiClient` (já existe)
- Produces:
  - `AuthContextValue { user: AuthUser | null; token: string | null; isLoading: boolean; login(email, password): Promise<void>; register(username, email, password): Promise<void>; logout(): void }`
  - `AuthProvider` — componente React exportado de `context/AuthContext.tsx`
  - `useAuth(): AuthContextValue` — exportado de `hooks/useAuth.ts`

- [ ] **Step 1: Escrever os testes do AuthContext (vão falhar)**

Crie `src/frontend/src/context/AuthContext.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import * as apiClientModule from '../services/apiClient';
import { authService } from '../services/authService';
import type { AuthResponse } from '../types/auth';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const mockAuthResponse: AuthResponse = {
  token: 'mock.jwt.token',
  type: 'Bearer',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
};

function AuthConsumer() {
  const { user, token, isLoading, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.username : 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(apiClientModule, 'setAuthToken').mockImplementation(() => {});
    vi.spyOn(apiClientModule, 'removeAuthToken').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with isLoading true then resolves to false with no user', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('login() sets user and token on success', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('user').textContent).toBe('testuser');
    expect(screen.getByTestId('token').textContent).toBe('mock.jwt.token');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('register() sets user and token on success', async () => {
    vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });

    expect(screen.getByTestId('user').textContent).toBe('testuser');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('logout() clears user and token', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(apiClientModule.removeAuthToken).toHaveBeenCalled();
  });

  it('rehydrates user from a valid (non-expired) token in localStorage', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const payload = { username: 'stored', email: 'stored@example.com', role: 'USER', exp };
    const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('jwt_token', fakeToken);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('user').textContent).toBe('stored');
    expect(screen.getByTestId('token').textContent).toBe(fakeToken);
  });

  it('clears an expired token from localStorage on mount', async () => {
    const payload = { username: 'old', email: 'old@example.com', role: 'USER', exp: 1 };
    const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('jwt_token', fakeToken);

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
});
```

- [ ] **Step 2: Verificar que os testes falham**

```bash
cd src/frontend && npx vitest run src/context/AuthContext.test.tsx
```

Esperado: FAIL — `Cannot find module './AuthContext'`

- [ ] **Step 3: Criar o diretório e `src/frontend/src/context/AuthContext.tsx`**

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { setAuthToken, removeAuthToken } from '../services/apiClient';
import type { AuthUser } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(
  token: string
): { username: string; email: string; role: 'USER' | 'ADMIN'; exp: number } | null {
  try {
    const segment = token.split('.')[1];
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      const payload = decodeJwtPayload(storedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({ username: payload.username, email: payload.email, role: payload.role });
      } else {
        removeAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser({ username: data.username, email: data.email, role: data.role });
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await authService.register({ username, email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser({ username: data.username, email: data.email, role: data.role });
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Criar `src/frontend/src/hooks/useAuth.ts`**

```ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextValue } from '../context/AuthContext';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 5: Adicionar re-export no barrel de hooks**

Em `src/frontend/src/hooks/index.ts`, adicionar ao final:
```ts
export * from './useAuth';
```

- [ ] **Step 6: Atualizar `src/frontend/src/App.tsx`**

Substitua o conteúdo completo:

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { WeaponsPage } from './components/pages/WeaponsPage';
import { WeaponDetailPage } from './components/pages/WeaponDetailPage';
import { EnemiesPage } from './components/pages/EnemiesPage';
import { NPCsPage } from './components/pages/NPCsPage';
import { BiomesPage } from './components/pages/BiomesPage';
import { ItemsPage } from './components/pages/ItemsPage';
import { NotFound } from './components/pages/NotFound';
import { Layout } from './components/common/Layout';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="weapons" element={<WeaponsPage />} />
                  <Route path="weapons/:id" element={<WeaponDetailPage />} />
                  <Route path="enemies" element={<EnemiesPage />} />
                  <Route path="npcs" element={<NPCsPage />} />
                  <Route path="biomes" element={<BiomesPage />} />
                  <Route path="items" element={<ItemsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

Nota: `LoginPage` e `RegisterPage` ainda não existem — TypeScript vai reclamar até a Task 3/4. Na Task 2 o implementer pode criar stubs temporários ou adicionar `// @ts-ignore` nos imports novos. Os testes do contexto não dependem dessas páginas.

- [ ] **Step 7: Rodar todos os testes**

```bash
cd src/frontend && npx vitest run
```

Esperado: todos passando (35 anteriores + 6 novos do AuthContext = 41 total). Se falhar por causa dos imports de `LoginPage`/`RegisterPage` no App.tsx, crie stubs temporários:

`src/frontend/src/components/pages/LoginPage.tsx`:
```tsx
export function LoginPage() { return <div>Login</div>; }
```

`src/frontend/src/components/pages/RegisterPage.tsx`:
```tsx
export function RegisterPage() { return <div>Register</div>; }
```

(Esses stubs serão substituídos nas Tasks 3 e 4.)

- [ ] **Step 8: Commit**

```bash
git add src/frontend/src/context/AuthContext.tsx \
        src/frontend/src/context/AuthContext.test.tsx \
        src/frontend/src/hooks/useAuth.ts \
        src/frontend/src/hooks/index.ts \
        src/frontend/src/App.tsx \
        src/frontend/src/components/pages/LoginPage.tsx \
        src/frontend/src/components/pages/RegisterPage.tsx
git commit -m "feat(frontend): AuthContext, useAuth hook and route wiring"
```

---

### Task 3: AuthLayout + LoginPage

Cria o layout compartilhado das páginas de auth e a página de login com formulário, validação de erro inline e loading state.

**Files:**
- Create: `src/frontend/src/components/common/AuthLayout.tsx`
- Modify (substituir stub): `src/frontend/src/components/pages/LoginPage.tsx`
- Create: `src/frontend/src/components/pages/LoginPage.test.tsx`

**Interfaces:**
- Consumes:
  - `useAuth(): AuthContextValue` de `../../hooks/useAuth` (Task 2) — usa apenas `login`
  - `Button` de `../ui/Button` (já existe) — `variant="primary"`, `size="lg"`, `isLoading`, `className="w-full"`
  - `ErrorResponse` de `../../types/api` (já existe) — `{ status: number; message: string; timestamp: string }`
  - `Link`, `useNavigate` de `react-router-dom` (já existe)
- Produces:
  - `AuthLayout` — layout `min-h-screen` centralizado, sem header/footer, aceita `children: ReactNode`
  - `LoginPage` — formulário de login com campos `email` e `password`, erro inline e loading

- [ ] **Step 1: Escrever os testes da LoginPage (vão falhar)**

Crie `src/frontend/src/components/pages/LoginPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    token: null,
    isLoading: false,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('renders email, password fields and submit button', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('calls login with form values and navigates to / on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays inline error message on 401', async () => {
    mockLogin.mockRejectedValue({ status: 401 });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'x@x.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText(/e-mail ou senha inv/i)).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays inline error message on network error', async () => {
    mockLogin.mockRejectedValue({ status: 500 });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText(/erro de conex/i)).toBeInTheDocument()
    );
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveLogin!: () => void;
    mockLogin.mockReturnValue(new Promise<void>((r) => { resolveLogin = r; }));
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'x@x.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled();
    resolveLogin();
  });
});
```

- [ ] **Step 2: Verificar que os testes falham**

```bash
cd src/frontend && npx vitest run src/components/pages/LoginPage.test.tsx
```

Esperado: FAIL — o componente `LoginPage` atual é um stub sem formulário real.

- [ ] **Step 3: Criar `src/frontend/src/components/common/AuthLayout.tsx`**

```tsx
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-calamity-bg-dark px-4 py-8">
      <div className="w-full max-w-md bg-calamity-bg-secondary border border-calamity-border p-8">
        <Link to="/" className="block mb-8 text-center no-underline">
          <h1 className="text-2xl font-display text-calamity-text-primary tracking-wide">
            Terraria Calamity RPG
          </h1>
        </Link>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Substituir o stub em `src/frontend/src/components/pages/LoginPage.tsx`**

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { AuthLayout } from '../common/AuthLayout';
import type { ErrorResponse } from '../../types/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const apiError = err as ErrorResponse;
      if (apiError.status === 401) {
        setError('E-mail ou senha inválidos');
      } else if (apiError.status === 400) {
        setError('Preencha todos os campos corretamente');
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Entrar
        </Button>
        {error && (
          <p className="mt-3 text-sm text-calamity-primary">{error}</p>
        )}
        <p className="mt-4 text-sm text-center text-calamity-text-secondary">
          Não tem conta?{' '}
          <Link to="/register">Registre-se</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
```

- [ ] **Step 5: Rodar todos os testes**

```bash
cd src/frontend && npx vitest run
```

Esperado: todos passando (41 anteriores + 5 novos do LoginPage = 46 total)

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/common/AuthLayout.tsx \
        src/frontend/src/components/pages/LoginPage.tsx \
        src/frontend/src/components/pages/LoginPage.test.tsx
git commit -m "feat(frontend): AuthLayout and LoginPage with inline error handling"
```

---

### Task 4: RegisterPage

Cria a página de registro com três campos (username, email, password), erro inline por código HTTP e loading state. Substitui o stub criado na Task 2.

**Files:**
- Modify (substituir stub): `src/frontend/src/components/pages/RegisterPage.tsx`
- Create: `src/frontend/src/components/pages/RegisterPage.test.tsx`

**Interfaces:**
- Consumes:
  - `useAuth(): AuthContextValue` de `../../hooks/useAuth` (Task 2) — usa apenas `register`
  - `AuthLayout` de `../common/AuthLayout` (Task 3)
  - `Button` de `../ui/Button` (já existe) — `variant="primary"`, `size="lg"`, `isLoading`, `className="w-full"`
  - `ErrorResponse` de `../../types/api` (já existe) — `{ status: number }`
  - `Link`, `useNavigate` de `react-router-dom`
- Produces:
  - `RegisterPage` — formulário com campos `username`, `email`, `password`; erros 409/400/rede; loading; link para `/login`

- [ ] **Step 1: Escrever os testes da RegisterPage (vão falhar)**

Crie `src/frontend/src/components/pages/RegisterPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    token: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders username, email, password fields and submit button', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByLabelText(/nome de usu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('calls register with form values and navigates to / on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'jogador1' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'jogador@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(mockRegister).toHaveBeenCalledWith(
      'jogador1',
      'jogador@example.com',
      'senha123'
    );
  });

  it('displays inline error on 409 (duplicate email or username)', async () => {
    mockRegister.mockRejectedValue({ status: 409 });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'duplicado' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'dup@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(screen.getByText(/e-mail ou nome de usu/i)).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays inline error on network/server error', async () => {
    mockRegister.mockRejectedValue({ status: 500 });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(screen.getByText(/erro de conex/i)).toBeInTheDocument()
    );
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveRegister!: () => void;
    mockRegister.mockReturnValue(new Promise<void>((r) => { resolveRegister = r; }));
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'u' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'u@u.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'p' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
    resolveRegister();
  });
});
```

- [ ] **Step 2: Verificar que os testes falham**

```bash
cd src/frontend && npx vitest run src/components/pages/RegisterPage.test.tsx
```

Esperado: FAIL — o stub atual não tem formulário real.

- [ ] **Step 3: Substituir o stub em `src/frontend/src/components/pages/RegisterPage.tsx`**

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { AuthLayout } from '../common/AuthLayout';
import type { ErrorResponse } from '../../types/api';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      const apiError = err as ErrorResponse;
      if (apiError.status === 409) {
        setError('E-mail ou nome de usuário já cadastrado');
      } else if (apiError.status === 400) {
        setError('Preencha todos os campos corretamente');
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            Nome de usuário
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm mb-1 text-calamity-text-secondary font-display"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
            required
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Criar conta
        </Button>
        {error && (
          <p className="mt-3 text-sm text-calamity-primary">{error}</p>
        )}
        <p className="mt-4 text-sm text-center text-calamity-text-secondary">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
```

- [ ] **Step 4: Rodar todos os testes**

```bash
cd src/frontend && npx vitest run
```

Esperado: todos passando (46 anteriores + 5 novos do RegisterPage = 51 total)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/RegisterPage.tsx \
        src/frontend/src/components/pages/RegisterPage.test.tsx
git commit -m "feat(frontend): RegisterPage with username/email/password and inline errors"
```

---

## Validação Manual

Após todas as tasks concluídas, validar no browser com `cd src/frontend && npm run dev`:

- [ ] Acessar `/login` — card centralizado, campos E-mail e Senha, botão "Entrar", link para `/register`
- [ ] Acessar `/register` — campos Nome de usuário, E-mail, Senha, botão "Criar conta", link para `/login`
- [ ] Login com credenciais erradas → mensagem de erro inline vermelha abaixo do botão
- [ ] Registro com e-mail já cadastrado → mensagem de erro inline
- [ ] Login com sucesso → redireciona para `/`
- [ ] Registro com sucesso → redireciona para `/`
- [ ] Rotas existentes (`/`, `/weapons`, etc.) continuam funcionando normalmente
- [ ] Verificar mobile 375px: card ocupa largura total com padding lateral
- [ ] Verificar desktop 1280px: card centralizado com max-w-md
- [ ] Dark mode e light mode: tokens `calamity-*` aplicados corretamente (sem cor hardcoded)
