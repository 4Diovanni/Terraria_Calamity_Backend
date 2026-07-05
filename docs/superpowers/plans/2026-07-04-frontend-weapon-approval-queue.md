# Fila de Aprovação de Armas (USER/ADMIN) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a aba "Contribuir": USER propõe criação/edição de arma e acompanha/cancela suas propostas; ADMIN vê dashboard + fila de revisão (aprovar/rejeitar).

**Architecture:** Reaproveita o `WeaponForm` da Entrega 1 (`feat/frontend-weapon-admin-crud`, já mesclada nesta branch) para o formulário de proposta — a única diferença é qual função é passada como `onSubmit` (`weaponSubmissionService.create` em vez de `weaponService.createWeapon`/`updateWeapon`). Uma página nova (`ContributePage`) na rota `/contribuir`, protegida por login (`ProtectedRoute` já existente, sem restrição de role — o conteúdo se ramifica internamente por `user.role` entre `UserContributeView` e `AdminContributeView`, dois componentes de arquivo próprio.

**Tech Stack:** React 19, TypeScript, Vite, Vitest + Testing Library, axios-mock-adapter, Tailwind (tokens `calamity-*`).

## Global Constraints

- Rodar `cd src/frontend && npx vitest run` — TODOS os testes devem passar antes de qualquer commit. Baseline no início desta entrega: 154 (herdados da Entrega 1, já mesclada nesta branch).
- Conventional Commits, um commit por task. Nunca commitar com testes falhando.
- Tokens `calamity-*`; sem emojis em componentes novos.
- Mobile-first: classes base para mobile, `sm:`/`md:`/`lg:` para telas maiores.
- Após cada task: PARAR e deixar o usuário validar visualmente no navegador (mobile 375px, desktop 1280px, dark/light mode) — regra do projeto (`CLAUDE.md`).
- Branch: `feat/frontend-weapon-approval-queue`, empilhada sobre `feat/frontend-weapon-admin-crud` (PR #56) — já contém `WeaponForm`, `weaponRarityToTier`, `WeaponFormData`, o contrato `Weapon` corrigido, e o tratamento de 409 no `apiClient`.
- Contrato exato do backend (branch `feat/backend-admin-roles-weapon-approval`, PR #54), confirmado lendo os DTOs reais:
  - `WeaponSubmissionResponseDTO`: `id, type (CREATE|UPDATE), status (PENDING|APPROVED|REJECTED), submittedByUsername, targetWeaponId (nullable), name, weaponClass, element, baseDamage, criticalChance, attacksPerTurn, range, rarity, price, quality, abilities, description, imageUrl, rejectionReason (nullable), createdAt, updatedAt`.
  - `WeaponSubmissionRequestDTO`: mesmos campos de `CreateWeaponDTO` + `targetWeaponId` opcional.
  - `RejectSubmissionRequestDTO`: `{ reason: string }`.
  - `AdminDashboardResponseDTO`: `totalUsers, totalAdmins, totalWeapons, pendingSubmissions, approvedSubmissions, rejectedSubmissions` (todos `long`).
  - Endpoints: `POST /api/v1/weapon-submissions`, `GET /api/v1/weapon-submissions/mine`, `DELETE /api/v1/weapon-submissions/{id}`, `GET /api/v1/weapon-submissions?status=` (ADMIN, default `PENDING`), `GET /api/v1/weapon-submissions/{id}` (ADMIN), `POST /api/v1/weapon-submissions/{id}/approve` (ADMIN), `POST /api/v1/weapon-submissions/{id}/reject` (ADMIN, body `{reason}`), `GET /api/v1/admin/dashboard` (ADMIN).

---

### Task 1: Tipos da fila de submissões

**Files:**
- Create: `src/frontend/src/types/weaponSubmission.ts`

**Interfaces:**
- Consumes: `WeaponFormData` (`src/frontend/src/types/weapon.ts`, já existe)
- Produces: `SubmissionType`, `SubmissionStatus`, `WeaponSubmission`, `WeaponSubmissionRequest`, `AdminDashboard` — usados por todas as tasks seguintes.

Sem teste dedicado nesta task — são só tipos (mesma convenção de `types/weapon.ts`, que também não tem arquivo de teste próprio).

- [ ] **Step 1: Criar o arquivo de tipos**

```ts
// src/frontend/src/types/weaponSubmission.ts
import { WeaponFormData } from './weapon';

export type SubmissionType = 'CREATE' | 'UPDATE';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WeaponSubmission extends WeaponFormData {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedByUsername: string;
  targetWeaponId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeaponSubmissionRequest extends WeaponFormData {
  targetWeaponId?: string | null;
}

export interface AdminDashboard {
  totalUsers: number;
  totalAdmins: number;
  totalWeapons: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}
```

- [ ] **Step 2: Rodar a suíte completa (confirma que só adicionar tipos não quebra nada)**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (154/154, nenhuma mudança de comportamento)

- [ ] **Step 3: Commit**

```bash
git add src/frontend/src/types/weaponSubmission.ts
git commit -m "feat(frontend): adiciona tipos da fila de submissoes de arma"
```

**PARAR — validação manual não se aplica (sem UI). Prosseguir para a Task 2.**

---

### Task 2: `weaponSubmissionService`

**Files:**
- Create: `src/frontend/src/services/weaponSubmissionService.ts`
- Test: `src/frontend/src/services/weaponSubmissionService.test.ts`

**Interfaces:**
- Consumes: `WeaponSubmission`, `WeaponSubmissionRequest`, `SubmissionStatus` (Task 1), `apiClient` (existente)
- Produces: `weaponSubmissionService.{create, getMine, cancel, getAll, getById, approve, reject}` — usados pelas Tasks 5, 7, 8.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/frontend/src/services/weaponSubmissionService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { weaponSubmissionService } from './weaponSubmissionService';
import { WeaponSubmission, WeaponSubmissionRequest } from '../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../types/weapon';

const BASE_URL = '/api/v1/weapon-submissions';

const sampleSubmission: WeaponSubmission = {
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
  description: 'desc',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const requestData: WeaponSubmissionRequest = {
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
  description: 'desc',
  imageUrl: '',
};

describe('weaponSubmissionService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('creates a submission', async () => {
    mock.onPost(BASE_URL).reply(201, sampleSubmission);
    const result = await weaponSubmissionService.create(requestData);
    expect(result.id).toBe('1');
  });

  it('creates an update submission with targetWeaponId', async () => {
    mock.onPost(BASE_URL).reply(201, { ...sampleSubmission, type: 'UPDATE', targetWeaponId: '42' });
    const result = await weaponSubmissionService.create({ ...requestData, targetWeaponId: '42' });
    expect(result.type).toBe('UPDATE');
    expect(result.targetWeaponId).toBe('42');
  });

  it('lists my submissions', async () => {
    mock.onGet(`${BASE_URL}/mine`).reply(200, [sampleSubmission]);
    const result = await weaponSubmissionService.getMine();
    expect(result).toHaveLength(1);
  });

  it('cancels a submission', async () => {
    mock.onDelete(`${BASE_URL}/1`).reply(204);
    await expect(weaponSubmissionService.cancel('1')).resolves.toBeUndefined();
  });

  it('lists submissions filtered by status, defaulting to PENDING', async () => {
    mock.onGet(BASE_URL, { params: { status: 'PENDING' } }).reply(200, [sampleSubmission]);
    const result = await weaponSubmissionService.getAll();
    expect(result).toHaveLength(1);
  });

  it('gets a submission by id', async () => {
    mock.onGet(`${BASE_URL}/1`).reply(200, sampleSubmission);
    const result = await weaponSubmissionService.getById('1');
    expect(result.id).toBe('1');
  });

  it('approves a submission', async () => {
    mock.onPost(`${BASE_URL}/1/approve`).reply(200, { ...sampleSubmission, status: 'APPROVED' });
    const result = await weaponSubmissionService.approve('1');
    expect(result.status).toBe('APPROVED');
  });

  it('rejects a submission with a reason', async () => {
    mock.onPost(`${BASE_URL}/1/reject`).reply(200, {
      ...sampleSubmission,
      status: 'REJECTED',
      rejectionReason: 'Dano incompatível',
    });
    const result = await weaponSubmissionService.reject('1', 'Dano incompatível');
    expect(result.status).toBe('REJECTED');
    expect(result.rejectionReason).toBe('Dano incompatível');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run weaponSubmissionService`
Expected: FALHA de resolução de módulo — `weaponSubmissionService.ts` não existe ainda.

- [ ] **Step 3: Implementar**

```ts
// src/frontend/src/services/weaponSubmissionService.ts
import apiClient from './apiClient';
import { WeaponSubmission, WeaponSubmissionRequest, SubmissionStatus } from '../types/weaponSubmission';

const BASE_URL = '/api/v1/weapon-submissions';

export const weaponSubmissionService = {
  async create(data: WeaponSubmissionRequest): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('❌ [WeaponSubmissionService] Erro ao criar submissão:', error);
      throw error;
    }
  },

  async getMine(): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(`${BASE_URL}/mine`);
      return response.data;
    } catch (error) {
      console.error('❌ [WeaponSubmissionService] Erro ao buscar minhas submissões:', error);
      throw error;
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`❌ [WeaponSubmissionService] Erro ao cancelar submissão ${id}:`, error);
      throw error;
    }
  },

  async getAll(status: SubmissionStatus = 'PENDING'): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(BASE_URL, { params: { status } });
      return response.data;
    } catch (error) {
      console.error('❌ [WeaponSubmissionService] Erro ao listar submissões:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.get<WeaponSubmission>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponSubmissionService] Erro ao buscar submissão ${id}:`, error);
      throw error;
    }
  },

  async approve(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponSubmissionService] Erro ao aprovar submissão ${id}:`, error);
      throw error;
    }
  },

  async reject(id: string, reason: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponSubmissionService] Erro ao rejeitar submissão ${id}:`, error);
      throw error;
    }
  },
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run weaponSubmissionService`
Expected: PASS (8/8)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/services/weaponSubmissionService.ts src/frontend/src/services/weaponSubmissionService.test.ts
git commit -m "feat(frontend): adiciona weaponSubmissionService"
```

**PARAR — validação manual não se aplica (sem UI). Prosseguir para a Task 3.**

---

### Task 3: `adminService`

**Files:**
- Create: `src/frontend/src/services/adminService.ts`
- Test: `src/frontend/src/services/adminService.test.ts`

**Interfaces:**
- Consumes: `AdminDashboard` (Task 1), `apiClient` (existente)
- Produces: `adminService.getDashboard()` — usado pela Task 8.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/frontend/src/services/adminService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { adminService } from './adminService';

describe('adminService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('fetches the dashboard counts', async () => {
    mock.onGet('/api/v1/admin/dashboard').reply(200, {
      totalUsers: 10,
      totalAdmins: 2,
      totalWeapons: 50,
      pendingSubmissions: 3,
      approvedSubmissions: 7,
      rejectedSubmissions: 1,
    });

    const dashboard = await adminService.getDashboard();
    expect(dashboard.totalUsers).toBe(10);
    expect(dashboard.pendingSubmissions).toBe(3);
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run adminService`
Expected: FALHA de resolução de módulo — `adminService.ts` não existe ainda.

- [ ] **Step 3: Implementar**

```ts
// src/frontend/src/services/adminService.ts
import apiClient from './apiClient';
import { AdminDashboard } from '../types/weaponSubmission';

const BASE_URL = '/api/v1/admin';

export const adminService = {
  async getDashboard(): Promise<AdminDashboard> {
    try {
      const response = await apiClient.get<AdminDashboard>(`${BASE_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('❌ [AdminService] Erro ao buscar dashboard:', error);
      throw error;
    }
  },
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run adminService`
Expected: PASS (1/1)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/services/adminService.ts src/frontend/src/services/adminService.test.ts
git commit -m "feat(frontend): adiciona adminService"
```

**PARAR — validação manual não se aplica (sem UI). Prosseguir para a Task 4.**

---

### Task 4: `SubmissionStatusBadge`

**Files:**
- Create: `src/frontend/src/components/pages/SubmissionStatusBadge.tsx`
- Test: `src/frontend/src/components/pages/SubmissionStatusBadge.test.tsx`

**Interfaces:**
- Consumes: `SubmissionStatus` (Task 1)
- Produces: `SubmissionStatusBadge({ status })` — usado pelas Tasks 7 e 8.

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// src/frontend/src/components/pages/SubmissionStatusBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';

describe('SubmissionStatusBadge', () => {
  it.each([
    ['PENDING', 'Pendente'],
    ['APPROVED', 'Aprovado'],
    ['REJECTED', 'Rejeitado'],
  ] as const)('renders %s as %s', (status, label) => {
    render(<SubmissionStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run SubmissionStatusBadge`
Expected: FALHA de resolução de módulo — o componente não existe ainda.

- [ ] **Step 3: Implementar**

```tsx
// src/frontend/src/components/pages/SubmissionStatusBadge.tsx
import { SubmissionStatus } from '../../types/weaponSubmission';

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

export const SubmissionStatusBadge = ({ status }: SubmissionStatusBadgeProps) => (
  <span className={`inline-block px-3 py-1 rounded text-xs font-display uppercase ${STATUS_COLOR[status]}`}>
    {STATUS_LABEL[status]}
  </span>
);
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run SubmissionStatusBadge`
Expected: PASS (3/3)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/SubmissionStatusBadge.tsx src/frontend/src/components/pages/SubmissionStatusBadge.test.tsx
git commit -m "feat(frontend): adiciona SubmissionStatusBadge"
```

**PARAR — validação manual não se aplica isoladamente (componente ainda não está numa página). Prosseguir para a Task 5.**

---

### Task 5: `WeaponDetailPage` — botão "Sugerir Edição" (USER)

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`

**Interfaces:**
- Consumes: `weaponSubmissionService.create` (Task 2), `WeaponForm` (Entrega 1)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar o import do mock e os 2 novos testes ao `describe('WeaponDetailPage', ...)`:

```tsx
// no topo do arquivo, junto aos outros vi.mock:
vi.mock('../../services/weaponSubmissionService', () => ({
  weaponSubmissionService: { create: vi.fn() },
}));
```

```tsx
// adicionar ao import já existente do topo do arquivo:
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
```

```tsx
  it('does not show "Sugerir Edição" for non-authenticated users', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Sugerir Edição' })).not.toBeInTheDocument();
  });

  it('shows "Sugerir Edição" for USER (not ADMIN) and submits a targeted proposal', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    vi.mocked(weaponSubmissionService.create).mockResolvedValue({} as never);
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sugerir Edição' }));
    const dialog = screen.getByRole('dialog', { name: 'Sugerir Edição' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar Proposta' }));

    await waitFor(() =>
      expect(weaponSubmissionService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Terra Blade', targetWeaponId: '42' })
      )
    );
    expect(await screen.findByText(/Proposta enviada/)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: FALHA — botão "Sugerir Edição" não existe ainda.

- [ ] **Step 3: Implementar**

Adicionar o import no topo de `WeaponDetailPage.tsx`:

```tsx
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
```

Dentro do componente, junto às outras declarações de estado (após `const [deleteError, setDeleteError] = useState<string | null>(null);`):

```tsx
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  const handleSuggestEdit = async (data: WeaponFormData) => {
    if (!weapon) return;
    await weaponSubmissionService.create({ ...data, targetWeaponId: weapon.id });
    setIsSuggestOpen(false);
    setSuggestSuccess(true);
  };
```

No `aside`, trocar o bloco de botões condicionais (hoje só `user?.role === 'ADMIN'`) para incluir o caminho do USER:

```tsx
      {user?.role === 'ADMIN' && (
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsConfirmingDelete(true)}>
            Deletar
          </Button>
        </div>
      )}

      {user && user.role !== 'ADMIN' && (
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuggestSuccess(false);
              setIsSuggestOpen(true);
            }}
          >
            Sugerir Edição
          </Button>
          {suggestSuccess && (
            <p role="status" className="text-sm text-calamity-accent-green">
              Proposta enviada! Acompanhe o status em "Minhas Propostas".
            </p>
          )}
        </div>
      )}
```

E, junto ao `Drawer` de exclusão (dentro da fragment do `return`, depois dele):

```tsx
      {user && user.role !== 'ADMIN' && (
        <Drawer open={isSuggestOpen} onOpenChange={setIsSuggestOpen} title="Sugerir Edição" side="right">
          <WeaponForm
            initialValues={weapon}
            onSubmit={handleSuggestEdit}
            onCancel={() => setIsSuggestOpen(false)}
            submitLabel="Enviar Proposta"
          />
        </Drawer>
      )}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: PASS (10/10)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx
git commit -m "feat(frontend): adiciona sugestao de edicao (USER) na WeaponDetailPage"
```

**PARAR — validação manual do usuário: logar como USER comum (não admin), abrir uma arma, conferir que só "Sugerir Edição" aparece (não "Editar"/"Deletar"), enviar uma proposta e ver a mensagem de sucesso. Mobile e desktop, dark/light. Só prosseguir para a Task 6 após aprovação.**

---

### Task 6: `ContributePage` — scaffold, rota e aba no `Header`

**Files:**
- Create: `src/frontend/src/components/pages/ContributePage.tsx`
- Create: `src/frontend/src/components/pages/UserContributeView.tsx` (stub — conteúdo completo na Task 7)
- Create: `src/frontend/src/components/pages/AdminContributeView.tsx` (stub — conteúdo completo na Task 8)
- Test: `src/frontend/src/components/pages/ContributePage.test.tsx`
- Modify: `src/frontend/src/components/common/Header.tsx`
- Modify: `src/frontend/src/components/common/Header.test.tsx`
- Modify: `src/frontend/src/App.tsx`

**Interfaces:**
- Consumes: `useAuth` (existente)
- Produces: rota `/contribuir`; `UserContributeView`/`AdminContributeView` (esqueletos que as Tasks 7/8 substituem por inteiro).

- [ ] **Step 1: Escrever os testes que falham**

```tsx
// src/frontend/src/components/pages/ContributePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContributePage } from './ContributePage';

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ContributePage', () => {
  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByText(/proponha uma arma/i)).toBeInTheDocument();
  });

  it('renders the ADMIN view for admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(<ContributePage />);
    expect(screen.getByText(/dashboard e fila/i)).toBeInTheDocument();
  });
});
```

Adicionar ao `describe('Header', ...)` em `Header.test.tsx`:

```tsx
  it('does not show "Contribuir" tab when logged out', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: 'Contribuir' })).not.toBeInTheDocument();
  });

  it('shows "Contribuir" tab linking to /contribuir when logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Contribuir' })).toHaveAttribute('href', '/contribuir');
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `cd src/frontend && npx vitest run ContributePage.test.tsx Header.test.tsx`
Expected: FALHA — `ContributePage.tsx` não existe; aba "Contribuir" não existe no `Header`.

- [ ] **Step 3: Implementar os stubs**

```tsx
// src/frontend/src/components/pages/UserContributeView.tsx (stub)
export const UserContributeView = () => (
  <p className="text-calamity-text-secondary">
    Em breve: proponha uma arma nova ou acompanhe suas propostas.
  </p>
);
```

```tsx
// src/frontend/src/components/pages/AdminContributeView.tsx (stub)
export const AdminContributeView = () => (
  <p className="text-calamity-text-secondary">
    Em breve: dashboard e fila de revisão de submissões.
  </p>
);
```

```tsx
// src/frontend/src/components/pages/ContributePage.tsx
import { useAuth } from '../../hooks/useAuth';
import { UserContributeView } from './UserContributeView';
import { AdminContributeView } from './AdminContributeView';

export const ContributePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-8">
          Contribuir
        </h1>
        {user?.role === 'ADMIN' ? <AdminContributeView /> : <UserContributeView />}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Implementar a aba no `Header`**

Em `Header.tsx`, adicionar logo abaixo da declaração de `tabs`:

```tsx
const CONTRIBUTE_TAB = { label: 'Contribuir', path: '/contribuir' };
```

Dentro do componente, logo após `const { user } = useAuth();`:

```tsx
  const visibleTabs = user ? [...tabs, CONTRIBUTE_TAB] : tabs;
```

Trocar a função `renderLinks` para iterar sobre `visibleTabs` em vez de `tabs` — só a primeira linha da declaração muda, o corpo do `.map` continua idêntico:

```tsx
  const renderLinks = (onNavigate?: () => void) =>
    visibleTabs.map((tab) => (
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
```

- [ ] **Step 5: Implementar a rota em `App.tsx`**

Adicionar o import:

```tsx
import { ContributePage } from './components/pages/ContributePage';
```

Adicionar a rota, logo antes da rota `perfil` já existente:

```tsx
                  <Route
                    path="contribuir"
                    element={
                      <ProtectedRoute>
                        <ContributePage />
                      </ProtectedRoute>
                    }
                  />
```

- [ ] **Step 6: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run ContributePage.test.tsx Header.test.tsx`
Expected: PASS (2/2 + 8/8)

- [ ] **Step 7: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/frontend/src/components/pages/ContributePage.tsx src/frontend/src/components/pages/UserContributeView.tsx src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/ContributePage.test.tsx src/frontend/src/components/common/Header.tsx src/frontend/src/components/common/Header.test.tsx src/frontend/src/App.tsx
git commit -m "feat(frontend): adiciona rota /contribuir, aba no Header e scaffold da ContributePage"
```

**PARAR — validação manual do usuário: logar (qualquer role), conferir que a aba "Contribuir" aparece no Header e leva pra `/contribuir`, mostrando o placeholder certo pro seu role. Deslogado, a aba não aparece. Mobile e desktop, dark/light. Só prosseguir para a Task 7 após aprovação.**

---

### Task 7: `UserContributeView` completo — Nova Proposta + Minhas Propostas

**Files:**
- Modify: `src/frontend/src/components/pages/UserContributeView.tsx` (substituição completa do stub)
- Create: `src/frontend/src/components/pages/UserContributeView.test.tsx`
- Modify: `src/frontend/src/components/pages/ContributePage.test.tsx`

**Interfaces:**
- Consumes: `WeaponForm` (Entrega 1), `SubmissionStatusBadge` (Task 4), `weaponSubmissionService` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// src/frontend/src/components/pages/UserContributeView.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserContributeView } from './UserContributeView';
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponSubmissionService', () => ({
  weaponSubmissionService: { create: vi.fn(), getMine: vi.fn(), cancel: vi.fn() },
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
  description: 'desc',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const rejectedSubmission: WeaponSubmission = {
  ...pendingSubmission,
  id: '2',
  status: 'REJECTED',
  rejectionReason: 'Dano incompatível com a raridade',
};

describe('UserContributeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the "Nova Proposta" form by default', () => {
    render(<UserContributeView />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('creates a proposal and shows a success message', async () => {
    vi.mocked(weaponSubmissionService.create).mockResolvedValue(pendingSubmission);
    render(<UserContributeView />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar Proposta' }));

    await waitFor(() => expect(weaponSubmissionService.create).toHaveBeenCalled());
    expect(await screen.findByText(/Proposta enviada/)).toBeInTheDocument();
  });

  it('lists my submissions with status and cancels a pending one', async () => {
    vi.mocked(weaponSubmissionService.getMine).mockResolvedValue([pendingSubmission, rejectedSubmission]);
    vi.mocked(weaponSubmissionService.cancel).mockResolvedValue(undefined);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));

    await waitFor(() => expect(screen.getAllByText('Terra Blade')).toHaveLength(2));
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Rejeitado')).toBeInTheDocument();
    expect(screen.getByText('Motivo: Dano incompatível com a raridade')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(weaponSubmissionService.cancel).toHaveBeenCalledWith('1'));
  });

  it('shows an empty state when there are no submissions', async () => {
    vi.mocked(weaponSubmissionService.getMine).mockResolvedValue([]);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));

    expect(await screen.findByText('Nenhuma proposta ainda')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run UserContributeView.test.tsx`
Expected: FALHA — o stub da Task 6 não tem formulário nem sub-abas.

- [ ] **Step 3: Implementar**

```tsx
// src/frontend/src/components/pages/UserContributeView.tsx (substitui o stub inteiro)
import { useState, useEffect, useCallback } from 'react';
import { WeaponForm } from './WeaponForm';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { EmptyState } from '../ui/EmptyState';
import { WeaponFormData } from '../../types/weapon';
import { WeaponSubmission } from '../../types/weaponSubmission';

type Tab = 'new' | 'mine';

export const UserContributeView = () => {
  const [tab, setTab] = useState<Tab>('new');
  const [submissions, setSubmissions] = useState<WeaponSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchMine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weaponSubmissionService.getMine();
      setSubmissions(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar suas propostas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'mine') fetchMine();
  }, [tab, fetchMine]);

  const handleCreate = async (data: WeaponFormData) => {
    await weaponSubmissionService.create(data);
    setCreateSuccess(true);
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      await weaponSubmissionService.cancel(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-4 border-b-2 border-calamity-border mb-8">
        <button
          type="button"
          onClick={() => setTab('new')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'new'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Nova Proposta
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'mine'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Minhas Propostas
        </button>
      </div>

      {tab === 'new' && (
        <div className="max-w-2xl">
          {createSuccess && (
            <p role="status" className="mb-4 text-sm text-calamity-accent-green">
              Proposta enviada! Acompanhe o status em "Minhas Propostas".
            </p>
          )}
          <WeaponForm
            onSubmit={handleCreate}
            onCancel={() => setCreateSuccess(false)}
            submitLabel="Enviar Proposta"
          />
        </div>
      )}

      {tab === 'mine' && (
        <div>
          {loading && <Loading message="Carregando suas propostas..." fullHeight={false} />}
          {error && <ErrorView message={error} onRetry={fetchMine} fullHeight={false} />}
          {!loading && !error && submissions.length === 0 && (
            <EmptyState
              title="Nenhuma proposta ainda"
              message="Suas propostas de criação ou edição de armas aparecerão aqui."
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold font-display text-calamity-accent-gold">
                        {submission.name}
                      </h3>
                      <p className="text-sm text-calamity-text-secondary">
                        {submission.type === 'UPDATE' ? 'Edição de arma existente' : 'Nova arma'}
                      </p>
                    </div>
                    <SubmissionStatusBadge status={submission.status} />
                  </div>
                  {submission.status === 'REJECTED' && submission.rejectionReason && (
                    <p className="mt-3 text-sm text-calamity-primary">
                      Motivo: {submission.rejectionReason}
                    </p>
                  )}
                  {submission.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      isLoading={cancelingId === submission.id}
                      onClick={() => handleCancel(submission.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
```

Atualizar `ContributePage.test.tsx` (o teste de USER da Task 6 checava o texto do stub, que não existe mais):

```tsx
// trocar:
  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByText(/proponha uma arma/i)).toBeInTheDocument();
  });
// por:
  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByRole('button', { name: 'Nova Proposta' })).toBeInTheDocument();
  });
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run UserContributeView.test.tsx ContributePage.test.tsx`
Expected: PASS (4/4 + 2/2 — o teste de ADMIN da `ContributePage.test.tsx` continua no stub, será atualizado na Task 8)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/UserContributeView.tsx src/frontend/src/components/pages/UserContributeView.test.tsx src/frontend/src/components/pages/ContributePage.test.tsx
git commit -m "feat(frontend): implementa Nova Proposta e Minhas Propostas (USER)"
```

**PARAR — validação manual do usuário: logar como USER comum, ir em "Contribuir", testar as duas sub-abas — enviar uma proposta nova e ver "Minhas Propostas" com status/motivo/cancelar. Mobile e desktop, dark/light. Só prosseguir para a Task 8 após aprovação.**

---

### Task 8: `AdminContributeView` completo — Dashboard + Fila de Revisão

**Files:**
- Modify: `src/frontend/src/components/pages/AdminContributeView.tsx` (substituição completa do stub)
- Create: `src/frontend/src/components/pages/AdminContributeView.test.tsx`
- Modify: `src/frontend/src/components/pages/ContributePage.test.tsx`

**Interfaces:**
- Consumes: `adminService.getDashboard` (Task 3), `weaponSubmissionService.{getAll,approve,reject}` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// src/frontend/src/components/pages/AdminContributeView.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContributeView } from './AdminContributeView';
import { adminService } from '../../services/adminService';
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
import { WeaponSubmission, AdminDashboard } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/weaponSubmissionService', () => ({
  weaponSubmissionService: { getAll: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const dashboard: AdminDashboard = {
  totalUsers: 10,
  totalAdmins: 2,
  totalWeapons: 50,
  pendingSubmissions: 1,
  approvedSubmissions: 3,
  rejectedSubmissions: 1,
};

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
    vi.mocked(adminService.getDashboard).mockResolvedValue(dashboard);
    vi.mocked(weaponSubmissionService.getAll).mockResolvedValue([pendingSubmission]);
  });

  it('renders the dashboard counts', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
  });

  it('lists pending submissions by default and expands to show details', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(weaponSubmissionService.getAll).toHaveBeenCalledWith('PENDING');

    fireEvent.click(screen.getByText('Terra Blade'));
    expect(screen.getByText(/Uma lâmina lendária/)).toBeInTheDocument();
  });

  it('approves a submission', async () => {
    vi.mocked(weaponSubmissionService.approve).mockResolvedValue({ ...pendingSubmission, status: 'APPROVED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));

    await waitFor(() => expect(weaponSubmissionService.approve).toHaveBeenCalledWith('1'));
  });

  it('rejects a submission with a reason', async () => {
    vi.mocked(weaponSubmissionService.reject).mockResolvedValue({ ...pendingSubmission, status: 'REJECTED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar' }));
    fireEvent.change(screen.getByPlaceholderText('Motivo da rejeição'), {
      target: { value: 'Dano incompatível' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));

    await waitFor(() =>
      expect(weaponSubmissionService.reject).toHaveBeenCalledWith('1', 'Dano incompatível')
    );
  });

  it('switches status filter and refetches', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Aprovadas' }));

    await waitFor(() => expect(weaponSubmissionService.getAll).toHaveBeenCalledWith('APPROVED'));
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run AdminContributeView.test.tsx`
Expected: FALHA — o stub da Task 6 não tem dashboard nem fila.

- [ ] **Step 3: Implementar**

```tsx
// src/frontend/src/components/pages/AdminContributeView.tsx (substitui o stub inteiro)
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { EmptyState } from '../ui/EmptyState';
import { AdminDashboard, SubmissionStatus, WeaponSubmission } from '../../types/weaponSubmission';

const STATUS_FILTERS: SubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const STATUS_FILTER_LABEL: Record<SubmissionStatus, string> = {
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Rejeitadas',
};

const DASHBOARD_CARDS: { key: keyof AdminDashboard; label: string }[] = [
  { key: 'totalUsers', label: 'Usuários' },
  { key: 'totalAdmins', label: 'Admins' },
  { key: 'totalWeapons', label: 'Armas' },
  { key: 'pendingSubmissions', label: 'Pendentes' },
  { key: 'approvedSubmissions', label: 'Aprovadas' },
  { key: 'rejectedSubmissions', label: 'Rejeitadas' },
];

export const AdminContributeView = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
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
      const [dashboardData, submissionsData] = await Promise.all([
        adminService.getDashboard(),
        weaponSubmissionService.getAll(statusFilter),
      ]);
      setDashboard(dashboardData);
      setSubmissions(submissionsData);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Erro ao carregar o painel administrativo.');
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
      await weaponSubmissionService.approve(id);
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
      await weaponSubmissionService.reject(id, rejectionReason);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
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
                  <p>Classe: {submission.weaponClass} · Elemento: {submission.element}</p>
                  <p>Dano: {submission.baseDamage} · Crítico: {submission.criticalChance}%</p>
                  <p>
                    Raridade: {submission.rarity} · Preço: {submission.price} · Qualidade: {submission.quality}
                  </p>
                  <p>Descrição: {submission.description}</p>

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

Substituir por completo `ContributePage.test.tsx` (agora precisa mockar os services que o `AdminContributeView` real usa):

```tsx
// src/frontend/src/components/pages/ContributePage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContributePage } from './ContributePage';
import { adminService } from '../../services/adminService';

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/weaponSubmissionService', () => ({
  weaponSubmissionService: { getAll: vi.fn(), getMine: vi.fn() },
}));

describe('ContributePage', () => {
  beforeEach(() => {
    vi.mocked(adminService.getDashboard).mockResolvedValue({
      totalUsers: 0,
      totalAdmins: 0,
      totalWeapons: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
    });
  });

  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByRole('button', { name: 'Nova Proposta' })).toBeInTheDocument();
  });

  it('renders the ADMIN view for admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(<ContributePage />);
    expect(screen.getByRole('button', { name: 'Pendentes' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run AdminContributeView.test.tsx ContributePage.test.tsx`
Expected: PASS (5/5 + 2/2)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/AdminContributeView.test.tsx src/frontend/src/components/pages/ContributePage.test.tsx
git commit -m "feat(frontend): implementa dashboard e fila de revisao (ADMIN)"
```

**PARAR — validação manual do usuário: logar como ADMIN, ir em "Contribuir", conferir os 6 cards de contagem, filtrar por status, expandir uma submissão pendente e aprovar/rejeitar (com motivo). Mobile e desktop, dark/light. Esta é a última task do plano.**

---

## Self-Review

**1. Cobertura da spec (seção 4 do design doc):**
- Tipos e services (`WeaponSubmission`, `AdminDashboard`, `weaponSubmissionService`, `adminService`) → Tasks 1, 2, 3.
- Aba "Contribuir" + rota protegida → Task 6.
- USER: Nova Proposta + Minhas Propostas (status, motivo, cancelar) → Task 7.
- ADMIN: dashboard + fila (filtro, expandir, aprovar, rejeitar com motivo) → Task 8.
- "Sugerir Edição" na `WeaponDetailPage` (USER) → Task 5.
- Fora de escopo (repetido do spec): fila para outras entidades, edição da submissão pelo ADMIN antes de aprovar, notificações.

**2. Placeholders:** nenhum "TBD"/"TODO" — todos os steps têm código completo e comandos exatos. Os stubs da Task 6 são deliberados (documentados como "substituídos por inteiro" nas Tasks 7/8, com o código final mostrado ali).

**3. Consistência de tipos:** `WeaponSubmission`/`WeaponSubmissionRequest`/`AdminDashboard` (Task 1) são os únicos tipos usados por `weaponSubmissionService`/`adminService` (Tasks 2-3) e por `UserContributeView`/`AdminContributeView`/`WeaponDetailPage` (Tasks 5, 7, 8) — mesmos nomes de campo em todo lugar, incluindo o `targetWeaponId` opcional usado tanto na Task 5 (edição sugerida) quanto implicitamente ausente na Task 7 (criação nova).

---

## Ordem de execução

Tasks 1 → 8, nesta ordem (cada uma depende de arquivos criados pela anterior — a única exceção é a Task 3, independente da Task 2, mas mantida em sequência por simplicidade). Rodar `cd src/frontend && npx vitest run` completo ao final de cada task. Parar para validação manual do usuário após cada task, conforme regra do projeto.
