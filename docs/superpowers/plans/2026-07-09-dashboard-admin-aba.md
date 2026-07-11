# Dashboard Admin como Aba Própria (Fase 2, parte 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extrair os 6 cards de estatística do admin de dentro de `AdminContributeView` para um componente próprio, `AdminDashboardView`, exibido numa terceira aba "Dashboard" no Perfil, visível só para administradores.

**Architecture:** `AdminDashboardView` busca `adminService.getDashboard()` no próprio `useEffect`, com seu próprio loading/erro — sem depender de `AdminContributeView`. `ProfilePage` ganha uma aba "Dashboard" renderizada condicionalmente a `user?.role === 'ADMIN'`. `AdminContributeView` perde a busca/renderização do dashboard, mantendo só a fila de submissões.

**Tech Stack:** React + TypeScript + Vite, Vitest + Testing Library.

## Global Constraints

- Rodar `cd src/frontend && npx vitest run` — todos os testes devem passar antes de cada commit (contagem não é fixa).
- NUNCA commitar com testes falhando.
- Cada task gera seu próprio commit, Conventional Commits (`feat(scope):`, `refactor(scope):`).
- Nenhuma mudança de backend — reaproveita `/api/v1/admin/dashboard` que já existe.
- Mesmo conteúdo dos 6 cards de hoje (Usuários, Admins, Armas, Pendentes, Aprovadas, Rejeitadas), sem dado novo, sem gráfico.
- A aba "Dashboard" não aparece de forma alguma (nem desabilitada) para usuário com role diferente de `ADMIN`.
- Ordem final das abas no Perfil: Perfil, Contribuições, Dashboard.

---

## Task 1: `AdminDashboardView` — novo componente

**Files:**
- Create: `src/frontend/src/components/pages/AdminDashboardView.tsx`
- Test: `src/frontend/src/components/pages/AdminDashboardView.test.tsx`

**Interfaces:**
- Consumes: `adminService.getDashboard(): Promise<AdminDashboard>` (já existente, `src/frontend/src/services/adminService.ts`); `AdminDashboard` (já existente, `src/frontend/src/types/weaponSubmission.ts`); `Loading`/`Error as ErrorView` de `../ui` (já existentes, aceitam `message?`, `fullHeight?`, e `Error` aceita `onRetry?`).
- Produces: `AdminDashboardView()` — componente React sem props. Usado por `ProfilePage` (Task 3).

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/frontend/src/components/pages/AdminDashboardView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminDashboardView } from './AdminDashboardView';
import { adminService } from '../../services/adminService';
import { AdminDashboard } from '../../types/weaponSubmission';

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

const dashboard: AdminDashboard = {
  totalUsers: 10,
  totalAdmins: 2,
  totalWeapons: 50,
  pendingSubmissions: 1,
  approvedSubmissions: 3,
  rejectedSubmissions: 1,
};

describe('AdminDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard counts', async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(dashboard);
    render(<AdminDashboardView />);

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows a loading state while fetching', () => {
    vi.mocked(adminService.getDashboard).mockReturnValue(new Promise(() => {}));
    render(<AdminDashboardView />);
    expect(screen.getByText('Carregando painel administrativo...')).toBeInTheDocument();
  });

  it('shows an error with retry when the fetch fails', async () => {
    vi.mocked(adminService.getDashboard).mockRejectedValueOnce(new Error('boom'));
    render(<AdminDashboardView />);

    expect(await screen.findByText('boom')).toBeInTheDocument();

    vi.mocked(adminService.getDashboard).mockResolvedValueOnce(dashboard);
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run AdminDashboardView.test.tsx`
Expected: FAIL — módulo `./AdminDashboardView` não existe

- [ ] **Step 3: Implementar `AdminDashboardView.tsx`**

Criar `src/frontend/src/components/pages/AdminDashboardView.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { Loading, Error as ErrorView } from '../ui';
import { AdminDashboard } from '../../types/weaponSubmission';

const DASHBOARD_CARDS: { key: keyof AdminDashboard; label: string }[] = [
  { key: 'totalUsers', label: 'Usuários' },
  { key: 'totalAdmins', label: 'Admins' },
  { key: 'totalWeapons', label: 'Armas' },
  { key: 'pendingSubmissions', label: 'Pendentes' },
  { key: 'approvedSubmissions', label: 'Aprovadas' },
  { key: 'rejectedSubmissions', label: 'Rejeitadas' },
];

export const AdminDashboardView = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar o painel administrativo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <Loading message="Carregando painel administrativo..." fullHeight={false} />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchDashboard} fullHeight={false} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {DASHBOARD_CARDS.map(({ key, label }) => (
        <div
          key={key}
          className="bg-calamity-bg-secondary border-2 border-calamity-border p-4 text-center"
        >
          <p className="text-3xl font-bold font-display text-calamity-accent-gold">
            {dashboard ? dashboard[key] : '—'}
          </p>
          <p className="text-xs font-display uppercase text-calamity-text-secondary mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run AdminDashboardView.test.tsx`
Expected: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/AdminDashboardView.tsx src/frontend/src/components/pages/AdminDashboardView.test.tsx
git commit -m "feat(frontend): adiciona componente AdminDashboardView com busca propria de dados"
```

---

## Task 2: Simplificar `AdminContributeView` (remove dashboard)

**Files:**
- Modify: `src/frontend/src/components/pages/AdminContributeView.tsx`
- Modify: `src/frontend/src/components/pages/AdminContributeView.test.tsx`

**Interfaces:**
- Consumes: nada de novo (Task 1 não é usado aqui — `AdminDashboardView` é independente, não importado por `AdminContributeView`).
- Produces: `AdminContributeView` continua exportado sem mudança de assinatura (`AdminContributeView()`, sem props) — só perde a responsabilidade de dashboard. Usado por `ProfilePage` (já era, sem mudança na Task 3).

- [ ] **Step 1: Atualizar o teste removendo a cobertura de dashboard**

Substituir o conteúdo de `src/frontend/src/components/pages/AdminContributeView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContributeView } from './AdminContributeView';
import { submissionService } from '../../services/submissionService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/submissionService', () => ({
  submissionService: { getAll: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const pendingSubmission: WeaponSubmission = {
  id: '1',
  type: 'CREATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: null,
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: '',
  description: 'Uma lâmina lendária',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('AdminContributeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submissionService.getAll).mockResolvedValue([pendingSubmission]);
  });

  it('lists pending submissions by default and expands to show details', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(submissionService.getAll).toHaveBeenCalledWith('WEAPON', 'PENDING');

    fireEvent.click(screen.getByText('Terra Blade'));
    expect(screen.getByText(/Uma lâmina lendária/)).toBeInTheDocument();
  });

  it('approves a submission', async () => {
    vi.mocked(submissionService.approve).mockResolvedValue({ ...pendingSubmission, status: 'APPROVED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));

    await waitFor(() => expect(submissionService.approve).toHaveBeenCalledWith('1'));
  });

  it('rejects a submission with a reason', async () => {
    vi.mocked(submissionService.reject).mockResolvedValue({ ...pendingSubmission, status: 'REJECTED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar' }));
    fireEvent.change(screen.getByPlaceholderText('Motivo da rejeição'), {
      target: { value: 'Dano incompatível' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));

    await waitFor(() =>
      expect(submissionService.reject).toHaveBeenCalledWith('1', 'Dano incompatível')
    );
  });

  it('switches status filter and refetches', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Aprovadas' }));

    await waitFor(() => expect(submissionService.getAll).toHaveBeenCalledWith('WEAPON', 'APPROVED'));
  });
});
```

- [ ] **Step 2: Não rodar o teste ainda — esta é uma task de refatoração**

Diferente das tasks anteriores, esta não segue RED→GREEN clássico: o arquivo de teste acima já descreve o
comportamento final (sem dashboard), mas `AdminContributeView.tsx` ainda não foi alterado. Rodar o teste
agora daria um resultado instável (pode passar ou falhar dependendo de como o `adminService` real reage
sem mock, já que nenhum dos 4 testes restantes verifica conteúdo de dashboard). Pule direto para a Step 3
e só rode os testes depois de implementar a mudança.

- [ ] **Step 3: Simplificar `AdminContributeView.tsx`**

Substituir o conteúdo de `src/frontend/src/components/pages/AdminContributeView.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { submissionService } from '../../services/submissionService';
import { SubmissionDiff } from './SubmissionDiff';
import { Button } from '../ui/Button';
import { Loading, Error as ErrorView, EmptyState } from '../ui';
import { SubmissionStatus, WeaponSubmission } from '../../types/weaponSubmission';

const STATUS_FILTERS: SubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const STATUS_FILTER_LABEL: Record<SubmissionStatus, string> = {
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Rejeitadas',
};

export const AdminContributeView = () => {
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus>('PENDING');
  const [submissions, setSubmissions] = useState<WeaponSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const submissionsData = await submissionService.getAll('WEAPON', statusFilter);
      setSubmissions(submissionsData);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar a fila de submissões.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      await submissionService.approve(id);
      await fetchAll();
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setActionError(message || 'Erro ao aprovar submissão.');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return;
    setActionError(null);
    try {
      await submissionService.reject(id, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
      await fetchAll();
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setActionError(message || 'Erro ao rejeitar submissão.');
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 font-display uppercase text-sm border-2 ${
              statusFilter === status
                ? 'border-calamity-accent-gold text-calamity-accent-gold'
                : 'border-calamity-border text-calamity-text-secondary'
            }`}
          >
            {STATUS_FILTER_LABEL[status]}
          </button>
        ))}
      </div>

      {actionError && <p role="alert" className="mb-4 text-sm text-calamity-primary">{actionError}</p>}

      {loading && <Loading message="Carregando fila de submissões..." fullHeight={false} />}
      {error && <ErrorView message={error} onRetry={fetchAll} fullHeight={false} />}
      {!loading && !error && submissions.length === 0 && (
        <EmptyState
          title="Nenhuma submissão aqui"
          message="Não há submissões neste status no momento."
          fullHeight={false}
        />
      )}
      {!loading && !error && submissions.length > 0 && (
        <ul className="space-y-4">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="bg-calamity-bg-secondary border-2 border-calamity-border p-6"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <div>
                  <h3 className="text-lg font-bold font-display text-calamity-accent-gold">
                    {submission.name}
                  </h3>
                  <p className="text-sm text-calamity-text-secondary">
                    {submission.type === 'UPDATE' ? 'Edição' : 'Criação'} · por{' '}
                    {submission.submittedByUsername}
                  </p>
                </div>
                <span className="text-calamity-text-secondary">
                  {expandedId === submission.id ? '−' : '+'}
                </span>
              </button>

              {expandedId === submission.id && (
                <div className="mt-4 pt-4 border-t border-calamity-border space-y-2 text-sm text-calamity-text-secondary">
                  <SubmissionDiff submission={submission} />

                  {submission.status === 'PENDING' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex gap-3">
                        <Button variant="primary" size="sm" onClick={() => handleApprove(submission.id)}>
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRejectingId(rejectingId === submission.id ? null : submission.id)}
                        >
                          Rejeitar
                        </Button>
                      </div>
                      {rejectingId === submission.id && (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Motivo da rejeição"
                            rows={2}
                            className="w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!rejectionReason.trim()}
                            onClick={() => handleReject(submission.id)}
                          >
                            Confirmar Rejeição
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

(Mudanças em relação ao arquivo atual: removidos o import de `adminService`, o tipo `AdminDashboard` do import de tipos, o array `DASHBOARD_CARDS`, o estado `dashboard`, a busca de dashboard dentro de `fetchAll` — que agora só busca `submissionService.getAll` — e todo o bloco JSX do grid de cards antes do filtro de status. A mensagem de erro genérica muda de "painel administrativo" para "fila de submissões", já que este componente não lida mais com dashboard.)

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run AdminContributeView.test.tsx`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/AdminContributeView.test.tsx
git commit -m "refactor(frontend): remove dashboard de AdminContributeView, fica so com a fila de submissoes"
```

---

## Task 3: Aba "Dashboard" condicional no `ProfilePage`

**Files:**
- Modify: `src/frontend/src/components/pages/ProfilePage.tsx`
- Modify: `src/frontend/src/components/pages/ProfilePage.test.tsx`

**Interfaces:**
- Consumes: `AdminDashboardView` (Task 1).
- Produces: nenhuma interface nova — `ProfilePage` ganha uma terceira aba condicional.

- [ ] **Step 1: Escrever os testes (falhando) da aba Dashboard**

Em `src/frontend/src/components/pages/ProfilePage.test.tsx`, trocar a linha do import de testing-library (linha 2) para incluir `waitFor`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
```

Adicionar, ao final do `describe('ProfilePage', ...)`, antes do `});` de fechamento:

```tsx
  it('não mostra a aba Dashboard para usuário comum', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('mostra a aba Dashboard para admin e renderiza AdminDashboardView ao clicar', async () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));

    await waitFor(() => expect(screen.getByText('Usuários')).toBeInTheDocument());
  });
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run ProfilePage.test.tsx`
Expected: FAIL — o botão "Dashboard" não existe ainda em `ProfilePage`

- [ ] **Step 3: Adicionar a aba Dashboard em `ProfilePage.tsx`**

Em `src/frontend/src/components/pages/ProfilePage.tsx`, adicionar o import de `AdminDashboardView` (linha 5, junto dos outros imports de componente):

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserContributeView } from './UserContributeView';
import { AdminContributeView } from './AdminContributeView';
import { AdminDashboardView } from './AdminDashboardView';
```

Trocar o tipo `Tab` (linha 12) de:

```tsx
type Tab = 'profile' | 'contributions';
```

para:

```tsx
type Tab = 'profile' | 'contributions' | 'dashboard';
```

Adicionar o terceiro botão de aba, logo depois do botão "Contribuições" e antes do `</div>` que fecha a barra de abas:

```tsx
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
              tab === 'dashboard'
                ? 'text-calamity-accent-gold border-calamity-accent-gold'
                : 'text-calamity-text-secondary border-transparent'
            }`}
          >
            Dashboard
          </button>
        )}
```

Adicionar o novo bloco de conteúdo, logo depois do bloco `{tab === 'contributions' && (...)}` e antes do `</main>` de fechamento:

```tsx
      {tab === 'dashboard' && (
        <div>
          <AdminDashboardView />
        </div>
      )}
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run ProfilePage.test.tsx`
Expected: PASS (11 testes: 9 originais + 2 novos)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/ProfilePage.tsx src/frontend/src/components/pages/ProfilePage.test.tsx
git commit -m "feat(frontend): adiciona aba Dashboard no Perfil, visivel so para admin"
```

---

## Task 4: Verificação final

**Files:** nenhum arquivo novo — só validação.

**Interfaces:** nenhuma.

- [ ] **Step 1: Rodar a suíte completa do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (todos os testes, incluindo os novos desta feature: 3 de `AdminDashboardView.test.tsx` + 2 novos em `ProfilePage.test.tsx`)

- [ ] **Step 2: Confirmar que `AdminContributeView` não referencia mais dashboard**

Run: `grep -n "adminService\|AdminDashboard\|DASHBOARD_CARDS" src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/AdminContributeView.test.tsx`
Expected: nenhum resultado

- [ ] **Step 3: Validação manual (parar aqui e deixar o usuário conferir no browser)**

Com o backend e o frontend rodando localmente:
- Como USER, em `/perfil`: confirmar que só aparecem as abas "Perfil" e "Contribuições" — sem "Dashboard".
- Como ADMIN, em `/perfil`: confirmar as 3 abas na ordem Perfil / Contribuições / Dashboard; clicar em "Contribuições" e confirmar que só aparece a fila de submissões (sem os cards no topo); clicar em "Dashboard" e confirmar que os 6 cards aparecem lá, com os mesmos números de antes.
- Conferir em mobile (375px), desktop (1280px), dark mode e light mode.

Este passo é manual, conforme a prática do projeto (testes automatizados verificam correção de código, não qualidade visual).
