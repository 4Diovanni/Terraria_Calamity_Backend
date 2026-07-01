# Página de Perfil do Usuário Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página `/perfil` com dados do usuário autenticado e botão de logout, refatorar o Header para que o username seja um link para essa página, e introduzir o `ProtectedRoute` como primeiro componente de proteção de rota.

**Architecture:** `ProtectedRoute` envolve rotas que exigem autenticação — redireciona para `/login` se `user === null` e renderiza `null` durante `isLoading` para evitar flash de redirect. `ProfilePage` lê o usuário do `AuthContext` via `useAuth()` e exibe os dados em estilo codex RPG. O Header remove o botão "Sair" e transforma o username em `<Link to="/perfil">`.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS (tokens `calamity-*`), Vitest + Testing Library.

## Global Constraints

- Todos os tokens de cor devem ser `calamity-*` do Tailwind — sem hex hardcoded em componentes de tema.
- Sem emojis em nenhum componente.
- Mobile-first: classes base para 375px, `md:` para desktop.
- Tap targets: mínimo 44×44px (o botão "Encerrar sessão" com `px-4 py-2` atende isso com a line-height padrão).
- Labels de role traduzidas na UI: `USER` → `USUÁRIO`, `ADMIN` → `ADMINISTRADOR`.
- Fonte display: Cinzel (herdada do CSS global). Fonte body: Crimson Text (herdada do CSS global).
- Total de testes antes desta implementação: **55**. Todos devem continuar passando.
- Comando para rodar testes: `cd src/frontend && npx vitest run`

---

### Task 1: ProtectedRoute

**Files:**
- Create: `src/frontend/src/components/common/ProtectedRoute.tsx`
- Create: `src/frontend/src/components/common/ProtectedRoute.test.tsx`

**Interfaces:**
- Consome: `useAuth()` de `../../hooks/useAuth` → `{ user: AuthUser | null, isLoading: boolean }`
- Produz: `ProtectedRoute({ children: React.ReactNode })` — exportação nomeada

- [ ] **Step 1: Escrever o teste que vai falhar**

Crie `src/frontend/src/components/common/ProtectedRoute.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const baseAuth = {
  token: null,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza children quando usuário está autenticado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' },
    });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Conteúdo protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  it('redireciona para /login quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, user: null });
    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <div>Protegido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('não renderiza children durante carregamento inicial para evitar flash de redirect', () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, user: null, isLoading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```
cd src/frontend
npx vitest run src/components/common/ProtectedRoute.test.tsx
```

Esperado: FAIL com "Cannot find module './ProtectedRoute'"

- [ ] **Step 3: Implementar o ProtectedRoute**

Crie `src/frontend/src/components/common/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

```
cd src/frontend
npx vitest run src/components/common/ProtectedRoute.test.tsx
```

Esperado: 3 testes PASS

- [ ] **Step 5: Rodar a suite completa para garantir nenhuma regressão**

```
cd src/frontend
npx vitest run
```

Esperado: 58 testes PASS (55 existentes + 3 novos)

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/common/ProtectedRoute.tsx
git add src/frontend/src/components/common/ProtectedRoute.test.tsx
git commit -m "feat(frontend): ProtectedRoute — redireciona para /login se não autenticado"
```

---

### Task 2: ProfilePage

**Files:**
- Create: `src/frontend/src/components/pages/ProfilePage.tsx`
- Create: `src/frontend/src/components/pages/ProfilePage.test.tsx`

**Interfaces:**
- Consome: `useAuth()` → `{ user: AuthUser | null, logout: () => void }`
- Consome: `useNavigate()` do react-router-dom
- Produz: `ProfilePage()` — exportação nomeada, sem props

- [ ] **Step 1: Escrever os testes que vão falhar**

Crie `src/frontend/src/components/pages/ProfilePage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const userBase = {
  username: 'Arcanjo',
  email: 'arcanjo@calamity.com',
  role: 'USER' as const,
};

const authBase = {
  user: userBase,
  logout: mockLogout,
  token: 'tok',
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authBase);
  });

  it('exibe o username do usuário autenticado', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Arcanjo')).toBeInTheDocument();
  });

  it('exibe o email do usuário', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('arcanjo@calamity.com')).toBeInTheDocument();
  });

  it('exibe role USER traduzida como USUÁRIO', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('USUÁRIO')).toBeInTheDocument();
  });

  it('exibe role ADMIN traduzida como ADMINISTRADOR', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('ADMINISTRADOR')).toBeInTheDocument();
  });

  it('chama logout ao clicar em "Encerrar sessão"', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /encerrar sessão/i }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('navega para /login após encerrar sessão', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /encerrar sessão/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```
cd src/frontend
npx vitest run src/components/pages/ProfilePage.test.tsx
```

Esperado: FAIL com "Cannot find module './ProfilePage'"

- [ ] **Step 3: Implementar a ProfilePage**

Crie `src/frontend/src/components/pages/ProfilePage.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = {
  USER: 'USUÁRIO',
  ADMIN: 'ADMINISTRADOR',
};

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs font-display uppercase tracking-[0.2em] text-calamity-text-secondary mb-3">
          Perfil do aventureiro
        </p>
        <div className="border-b border-calamity-border mb-8" />

        <div className="border-l-2 border-calamity-accent-gold pl-6 mb-8">
          <h1 className="text-2xl font-display text-calamity-text-primary mb-6">
            {user?.username}
          </h1>
          <dl className="flex flex-col gap-4">
            <div className="flex gap-6 items-baseline">
              <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                Entidade
              </dt>
              <dd className="text-sm font-display text-calamity-text-primary">
                {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
              </dd>
            </div>
            <div className="flex gap-6 items-baseline">
              <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                Contato
              </dt>
              <dd className="text-sm text-calamity-text-secondary break-all">
                {user?.email}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-b border-calamity-border mb-8" />

        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary border border-calamity-border hover:border-calamity-primary px-4 py-2 transition-colors duration-300"
        >
          Encerrar sessão
        </button>
      </div>
    </main>
  );
};
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

```
cd src/frontend
npx vitest run src/components/pages/ProfilePage.test.tsx
```

Esperado: 6 testes PASS

- [ ] **Step 5: Rodar a suite completa para garantir nenhuma regressão**

```
cd src/frontend
npx vitest run
```

Esperado: 64 testes PASS (58 anteriores + 6 novos)

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/ProfilePage.tsx
git add src/frontend/src/components/pages/ProfilePage.test.tsx
git commit -m "feat(frontend): ProfilePage — perfil view-only com estilo codex e logout"
```

---

### Task 3: Wiring — App.tsx + Header refactor

**Files:**
- Modify: `src/frontend/src/App.tsx`
- Modify: `src/frontend/src/components/common/Header.tsx`
- Modify: `src/frontend/src/components/common/Header.test.tsx`

**Interfaces:**
- Consome: `ProtectedRoute` de `./components/common/ProtectedRoute` (Task 1)
- Consome: `ProfilePage` de `./components/pages/ProfilePage` (Task 2)

- [ ] **Step 1: Escrever os novos testes do Header antes de alterar o componente**

Substitua o conteúdo de `src/frontend/src/components/common/Header.test.tsx` pelo seguinte (mantém os 3 testes existentes e adiciona 3 novos, com mock refatorado para controle por teste):

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const noUser = {
  user: null,
  logout: mockLogout,
  token: null,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
};

const withUser = {
  ...noUser,
  user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' as const },
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(noUser);
  });

  it('opens the mobile nav drawer when the menu button is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer after a nav link is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Armas'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows "Entrar" link when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows username as link to /perfil when user is logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link', { name: 'Arcanjo' });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/perfil'));
  });

  it('username link in mobile drawer closes drawer on click', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('link', { name: 'Arcanjo' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show "Sair" button when user is logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar os testes do Header para confirmar que os 3 novos falham**

```
cd src/frontend
npx vitest run src/components/common/Header.test.tsx
```

Esperado: 3 testes existentes PASS + 3 novos FAIL

- [ ] **Step 3: Refatorar o Header.tsx**

Substitua as seções de auth do Header. O arquivo completo atualizado de `src/frontend/src/components/common/Header.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

const tabs = [
  { label: 'Inicio', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

interface HamburgerIconProps {
  isOpen: boolean;
}

const HamburgerIcon = ({ isOpen }: HamburgerIconProps) => (
  <span className="block w-5 h-[14px] relative" aria-hidden="true">
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current top-1/2 -translate-y-1/2',
        'transition-all duration-200 ease-in-out',
        isOpen ? 'opacity-0 scale-x-0' : '',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0',
      ].join(' ')}
    />
  </span>
);

export const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = (onNavigate?: () => void) =>
    tabs.map((tab) => (
      <Link
        key={tab.path}
        to={tab.path}
        onClick={onNavigate}
        className={`text-sm font-display uppercase tracking-wider transition-all duration-300 pb-1 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-accent-gold border-calamity-accent-gold'
            : 'text-calamity-text-secondary border-transparent hover:text-calamity-text-primary hover:border-calamity-accent-gold'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b border-calamity-border sticky top-0 z-50 transition-all duration-300">
      <div
        className={`container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300 ${
          compact ? 'py-2' : 'py-4'
        } md:py-4`}
      >
        <Link
          to="/"
          className={`font-bold font-display text-calamity-accent-gold hover:opacity-90 transition-all duration-300 ${
            compact ? 'text-lg' : 'text-xl'
          } md:text-2xl`}
        >
          Terraria Calamity
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link
              to="/perfil"
              className="hidden md:block text-sm font-display text-calamity-text-secondary hover:text-calamity-text-primary transition-colors duration-300"
            >
              {user.username}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden md:block text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary border border-calamity-border hover:border-calamity-primary px-3 py-1 transition-colors duration-300"
            >
              Entrar
            </Link>
          )}
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-calamity-text-primary border border-calamity-border hover:border-calamity-primary transition-colors duration-300"
          >
            <HamburgerIcon isOpen={menuOpen} />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav className="flex flex-col gap-6">
          {renderLinks(() => setMenuOpen(false))}
          <div className="pt-2 border-t border-calamity-border">
            {user ? (
              <Link
                to="/perfil"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-display text-calamity-text-secondary hover:text-calamity-text-primary transition-colors duration-300"
              >
                {user.username}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </Drawer>
    </header>
  );
};
```

Nota: `useNavigate` foi removido das importações pois o Header não chama mais `navigate()`.

- [ ] **Step 4: Rodar os testes do Header para confirmar que todos os 6 passam**

```
cd src/frontend
npx vitest run src/components/common/Header.test.tsx
```

Esperado: 6 testes PASS

- [ ] **Step 5: Adicionar a rota /perfil no App.tsx**

Edite `src/frontend/src/App.tsx`. Adicione as importações de `ProtectedRoute` e `ProfilePage` e a rota `/perfil` dentro do `<Layout>`:

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
import { ProfilePage } from './components/pages/ProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
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
                  <Route
                    path="perfil"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
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

- [ ] **Step 6: Rodar a suite completa**

```
cd src/frontend
npx vitest run
```

Esperado: **67 testes PASS** (55 existentes + 3 ProtectedRoute + 6 ProfilePage + 3 Header novos)

- [ ] **Step 7: Commit**

```bash
git add src/frontend/src/App.tsx
git add src/frontend/src/components/common/Header.tsx
git add src/frontend/src/components/common/Header.test.tsx
git commit -m "feat(frontend): wiring /perfil + refactor Header — username vira link para perfil"
```
