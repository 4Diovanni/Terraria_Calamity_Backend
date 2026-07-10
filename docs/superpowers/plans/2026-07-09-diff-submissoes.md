# Diff Estilo GitHub nas Submissões (Fase 2, parte 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar, nas submissões de arma (fila do admin e "Minhas Propostas" do usuário), um diff estilo GitHub campo a campo — valor antigo riscado em vermelho, valor novo em verde, campos inalterados em cor normal.

**Architecture:** Uma função pura `computeWeaponDiff` compara os 13 campos de `WeaponFormData` entre a arma atual (buscada sob demanda) e a submissão. Um componente autocontido `SubmissionDiff` chama essa função e busca a arma atual via `weaponService.getWeaponById` só quando a submissão é `UPDATE` e só quando montado (ou seja, só quando o card correspondente está expandido). `AdminContributeView` e `UserContributeView` passam a renderizar `<SubmissionDiff submission={submission} />` na seção expandida de cada card, em vez dos campos soltos de hoje.

**Tech Stack:** React + TypeScript + Vite, Vitest + Testing Library.

## Global Constraints

- Rodar `cd src/frontend && npx vitest run` — todos os testes devem passar antes de cada commit (contagem não é fixa).
- NUNCA commitar com testes falhando.
- Cada task gera seu próprio commit, Conventional Commits (`feat(scope):`, `test(scope):`).
- Nenhuma mudança de backend nesta spec — cálculo do diff é 100% frontend.
- Usar só tokens `calamity-*` já existentes no Tailwind (`text-calamity-primary` para vermelho/riscado, `text-calamity-accent-green` para verde, `text-calamity-text-secondary` para campos inalterados) — nenhuma cor hex nova.
- Todos os 13 campos da arma aparecem sempre (alterados e inalterados), nunca só os alterados.
- CREATE (sem "antes"): todo campo aparece como alterado/verde, `oldValue: null`.

---

## Task 1: `computeWeaponDiff` — função pura de diff

**Files:**
- Create: `src/frontend/src/lib/weaponDiff.ts`
- Test: `src/frontend/src/lib/weaponDiff.test.ts`

**Interfaces:**
- Consumes: `Weapon`, `WeaponFormData` (de `../types/weapon`, já existentes); `WeaponSubmission` (de `../types/weaponSubmission`, já existente).
- Produces: `interface DiffField { label: string; oldValue: string | null; newValue: string; changed: boolean }`; `function computeWeaponDiff(current: Weapon | null, proposed: WeaponSubmission): DiffField[]`. Usado por `SubmissionDiff` (Task 2).

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/frontend/src/lib/weaponDiff.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeWeaponDiff } from './weaponDiff';
import { Weapon, WeaponTypeClass, Element } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

const currentWeapon: Weapon = {
  id: '3',
  name: 'Iron Shortsword',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 9,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre',
  description: 'Arma de ferro para combate básico.',
  imageUrl: 'img.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const proposedSubmission: WeaponSubmission = {
  id: '1',
  type: 'UPDATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: '3',
  name: 'Iron Shortsword Reforjada',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 12,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre, agora com fio',
  description: 'Arma de ferro para combate básico.',
  imageUrl: 'img.png',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('computeWeaponDiff', () => {
  it('marks only the fields that actually differ as changed', () => {
    const diff = computeWeaponDiff(currentWeapon, proposedSubmission);

    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));

    expect(byLabel['Nome']).toEqual({ label: 'Nome', oldValue: 'Iron Shortsword', newValue: 'Iron Shortsword Reforjada', changed: true });
    expect(byLabel['Dano']).toEqual({ label: 'Dano', oldValue: '9', newValue: '12', changed: true });
    expect(byLabel['Habilidades']).toEqual({ label: 'Habilidades', oldValue: 'Melhor que cobre', newValue: 'Melhor que cobre, agora com fio', changed: true });

    expect(byLabel['Classe'].changed).toBe(false);
    expect(byLabel['Elemento'].changed).toBe(false);
    expect(byLabel['Raridade'].changed).toBe(false);
    expect(byLabel['Qualidade'].changed).toBe(false);
    expect(byLabel['Descrição'].changed).toBe(false);
    expect(byLabel['Imagem'].changed).toBe(false);
  });

  it('treats every field as changed with no oldValue when current is null (CREATE)', () => {
    const diff = computeWeaponDiff(null, proposedSubmission);

    expect(diff).toHaveLength(13);
    diff.forEach((field) => {
      expect(field.changed).toBe(true);
      expect(field.oldValue).toBeNull();
    });
    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));
    expect(byLabel['Nome'].newValue).toBe('Iron Shortsword Reforjada');
  });

  it('formats criticalChance with a percent sign and price with "moedas"', () => {
    const diff = computeWeaponDiff(currentWeapon, proposedSubmission);
    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));

    expect(byLabel['Crítico']).toEqual({ label: 'Crítico', oldValue: '4%', newValue: '4%', changed: false });
    expect(byLabel['Preço']).toEqual({ label: 'Preço', oldValue: '120 moedas', newValue: '120 moedas', changed: false });
  });
});
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run weaponDiff.test.ts`
Expected: FAIL — módulo `./weaponDiff` não existe

- [ ] **Step 3: Implementar `weaponDiff.ts`**

Criar `src/frontend/src/lib/weaponDiff.ts`:

```ts
import { Weapon, WeaponFormData } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

export interface DiffField {
  label: string;
  oldValue: string | null;
  newValue: string;
  changed: boolean;
}

type FieldKey = keyof WeaponFormData;

const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Nome',
  weaponClass: 'Classe',
  element: 'Elemento',
  baseDamage: 'Dano',
  criticalChance: 'Crítico',
  attacksPerTurn: 'Velocidade',
  range: 'Knockback',
  rarity: 'Raridade',
  price: 'Preço',
  quality: 'Qualidade',
  abilities: 'Habilidades',
  description: 'Descrição',
  imageUrl: 'Imagem',
};

const FIELD_ORDER: FieldKey[] = [
  'name',
  'weaponClass',
  'element',
  'baseDamage',
  'criticalChance',
  'attacksPerTurn',
  'range',
  'rarity',
  'price',
  'quality',
  'abilities',
  'description',
  'imageUrl',
];

function formatFieldValue(key: FieldKey, source: WeaponFormData): string {
  const value = source[key];
  if (key === 'criticalChance') return `${value}%`;
  if (key === 'price') return `${value} moedas`;
  return String(value);
}

export function computeWeaponDiff(current: Weapon | null, proposed: WeaponSubmission): DiffField[] {
  return FIELD_ORDER.map((key) => {
    const newValue = formatFieldValue(key, proposed);
    if (!current) {
      return { label: FIELD_LABELS[key], oldValue: null, newValue, changed: true };
    }
    const oldValue = formatFieldValue(key, current);
    return { label: FIELD_LABELS[key], oldValue, newValue, changed: oldValue !== newValue };
  });
}
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run weaponDiff.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/lib/weaponDiff.ts src/frontend/src/lib/weaponDiff.test.ts
git commit -m "feat(frontend): adiciona computeWeaponDiff para comparar arma atual vs proposta"
```

---

## Task 2: `SubmissionDiff` — componente de apresentação

**Files:**
- Create: `src/frontend/src/components/pages/SubmissionDiff.tsx`
- Test: `src/frontend/src/components/pages/SubmissionDiff.test.tsx`

**Interfaces:**
- Consumes: `computeWeaponDiff`/`DiffField` (Task 1); `weaponService.getWeaponById(id: string): Promise<Weapon>` (já existente); `Loading` de `../ui` (já existente, aceita `message?: string` e `fullHeight?: boolean`); `WeaponSubmission` (já existente).
- Produces: `SubmissionDiff({ submission: WeaponSubmission })` — componente React. Usado por `AdminContributeView` (Task 3) e `UserContributeView` (Task 4).

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/frontend/src/components/pages/SubmissionDiff.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionDiff } from './SubmissionDiff';
import { weaponService } from '../../services/weaponService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const currentWeapon: Weapon = {
  id: '3',
  name: 'Iron Shortsword',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 9,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre',
  description: 'Arma de ferro',
  imageUrl: 'img.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const updateSubmission: WeaponSubmission = {
  id: '1',
  type: 'UPDATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: '3',
  name: 'Iron Shortsword Reforjada',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 12,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre, agora com fio',
  description: 'Arma de ferro',
  imageUrl: 'img.png',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const createSubmission: WeaponSubmission = {
  ...updateSubmission,
  id: '2',
  type: 'CREATE',
  targetWeaponId: null,
};

describe('SubmissionDiff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CREATE submissions immediately without fetching the current weapon', async () => {
    render(<SubmissionDiff submission={createSubmission} />);
    expect(await screen.findByText('Iron Shortsword Reforjada')).toBeInTheDocument();
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('shows a loading state while fetching the current weapon for UPDATE', () => {
    vi.mocked(weaponService.getWeaponById).mockReturnValue(new Promise(() => {}));
    render(<SubmissionDiff submission={updateSubmission} />);
    expect(screen.getByText('Carregando comparação...')).toBeInTheDocument();
  });

  it('renders the diff after fetching the current weapon successfully', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(currentWeapon);
    render(<SubmissionDiff submission={updateSubmission} />);

    expect(await screen.findByText('Iron Shortsword Reforjada')).toBeInTheDocument();
    expect(screen.getByText('Iron Shortsword')).toBeInTheDocument();
    expect(weaponService.getWeaponById).toHaveBeenCalledWith('3');
  });

  it('falls back to showing proposed values when the current weapon cannot be found', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));
    render(<SubmissionDiff submission={updateSubmission} />);

    expect(await screen.findByText(/Arma original não encontrada/)).toBeInTheDocument();
    expect(screen.getByText('Iron Shortsword Reforjada')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run SubmissionDiff.test.tsx`
Expected: FAIL — módulo `./SubmissionDiff` não existe

- [ ] **Step 3: Implementar `SubmissionDiff.tsx`**

Criar `src/frontend/src/components/pages/SubmissionDiff.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Loading } from '../ui';
import { Weapon } from '../../types/weapon';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { computeWeaponDiff } from '../../lib/weaponDiff';

interface SubmissionDiffProps {
  submission: WeaponSubmission;
}

export const SubmissionDiff = ({ submission }: SubmissionDiffProps) => {
  const [currentWeapon, setCurrentWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(submission.type === 'UPDATE');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (submission.type !== 'UPDATE' || !submission.targetWeaponId) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    weaponService
      .getWeaponById(submission.targetWeaponId)
      .then((weapon) => {
        if (!cancelled) setCurrentWeapon(weapon);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [submission.type, submission.targetWeaponId]);

  if (loading) {
    return <Loading message="Carregando comparação..." fullHeight={false} />;
  }

  const diff = computeWeaponDiff(
    submission.type === 'UPDATE' && !notFound ? currentWeapon : null,
    submission
  );

  return (
    <div className="space-y-1 text-sm">
      {notFound && (
        <p className="text-calamity-text-secondary italic mb-2">
          Arma original não encontrada — exibindo apenas os valores propostos.
        </p>
      )}
      {diff.map((field) => (
        <p key={field.label}>
          <span className="text-calamity-text-secondary">{field.label}: </span>
          {field.changed ? (
            <>
              {field.oldValue !== null && (
                <span className="line-through text-calamity-primary mr-2">{field.oldValue}</span>
              )}
              <span className="text-calamity-accent-green">{field.newValue}</span>
            </>
          ) : (
            <span className="text-calamity-text-secondary">{field.newValue}</span>
          )}
        </p>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run SubmissionDiff.test.tsx`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/SubmissionDiff.tsx src/frontend/src/components/pages/SubmissionDiff.test.tsx
git commit -m "feat(frontend): adiciona componente SubmissionDiff com estado de loading/fallback"
```

---

## Task 3: Integrar `SubmissionDiff` no `AdminContributeView`

**Files:**
- Modify: `src/frontend/src/components/pages/AdminContributeView.tsx:1-4,153-161`
- Modify: `src/frontend/src/components/pages/AdminContributeView.test.tsx` (verificar, sem mudança esperada)

**Interfaces:**
- Consumes: `SubmissionDiff` (Task 2).
- Produces: nenhuma interface nova — só troca o conteúdo renderizado dentro da seção já expandível existente.

- [ ] **Step 1: Adicionar o import**

Em `src/frontend/src/components/pages/AdminContributeView.tsx:1-6`, adicionar a linha de import de `SubmissionDiff` junto aos outros imports:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { submissionService } from '../../services/submissionService';
import { SubmissionDiff } from './SubmissionDiff';
import { Button } from '../ui/Button';
import { Loading, Error as ErrorView, EmptyState } from '../ui';
import { AdminDashboard, SubmissionStatus, WeaponSubmission } from '../../types/weaponSubmission';
```

- [ ] **Step 2: Substituir a seção expandida pelo `SubmissionDiff`**

Em `src/frontend/src/components/pages/AdminContributeView.tsx:153-161`, trocar:

```tsx
              {expandedId === submission.id && (
                <div className="mt-4 pt-4 border-t border-calamity-border space-y-2 text-sm text-calamity-text-secondary">
                  <p>Classe: {submission.weaponClass} · Elemento: {submission.element}</p>
                  <p>Dano: {submission.baseDamage} · Crítico: {submission.criticalChance}%</p>
                  <p>
                    Raridade: {submission.rarity} · Preço: {submission.price} · Qualidade: {submission.quality}
                  </p>
                  <p>Descrição: {submission.description}</p>

                  {submission.status === 'PENDING' && (
```

por:

```tsx
              {expandedId === submission.id && (
                <div className="mt-4 pt-4 border-t border-calamity-border space-y-2 text-sm text-calamity-text-secondary">
                  <SubmissionDiff submission={submission} />

                  {submission.status === 'PENDING' && (
```

(O restante do bloco — botões Aprovar/Rejeitar e o `</div>`/`)` de fechamento — permanece exatamente como está, só a parte antes do `{submission.status === 'PENDING' && (` muda.)

- [ ] **Step 3: Rodar a suíte de `AdminContributeView` e confirmar que passa sem alterações**

Run: `cd src/frontend && npx vitest run AdminContributeView.test.tsx`
Expected: PASS (5 testes, sem nenhuma mudança nas asserções — o teste `lists pending submissions by default and expands to show details` usa uma submissão `type: 'CREATE'`, então `SubmissionDiff` renderiza sem buscar nada e a asserção existente `expect(screen.getByText(/Uma lâmina lendária/)).toBeInTheDocument()` continua encontrando o texto da descrição, agora dentro do `SubmissionDiff`)

Se esse teste específico falhar por algum motivo inesperado, pare e investigue antes de seguir — não ajuste a asserção só para fazer passar sem entender a causa.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/src/components/pages/AdminContributeView.tsx
git commit -m "feat(frontend): usa SubmissionDiff na fila de admin em vez dos campos soltos"
```

---

## Task 4: Integrar `SubmissionDiff` no `UserContributeView` (com expandir/colapsar)

**Files:**
- Modify: `src/frontend/src/components/pages/UserContributeView.tsx:1-18,109-140`
- Modify: `src/frontend/src/components/pages/UserContributeView.test.tsx`

**Interfaces:**
- Consumes: `SubmissionDiff` (Task 2).
- Produces: nenhuma interface nova — adiciona estado local `expandedId` e comportamento de expandir/colapsar, replicando o padrão já usado em `AdminContributeView`.

- [ ] **Step 1: Escrever o teste (falhando) de expandir/colapsar**

Em `src/frontend/src/components/pages/UserContributeView.test.tsx`, adicionar ao final do `describe('UserContributeView', ...)`, antes do `});` de fechamento:

```tsx
  it('expands a submission card to show the diff and keeps Cancelar available', async () => {
    vi.mocked(submissionService.getMine).mockResolvedValue([pendingSubmission]);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.queryByText('desc')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Terra Blade'));

    expect(await screen.findByText('desc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run UserContributeView.test.tsx`
Expected: FAIL — clicar em "Terra Blade" não expande nada ainda (o card de hoje não é clicável), "desc" nunca aparece

- [ ] **Step 3: Adicionar o import e o estado `expandedId`**

Em `src/frontend/src/components/pages/UserContributeView.tsx:1-18`, adicionar o import e o novo estado:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { WeaponForm } from './WeaponForm';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';
import { SubmissionDiff } from './SubmissionDiff';
import { submissionService } from '../../services/submissionService';
import { Button } from '../ui/Button';
import { Loading, Error as ErrorView, EmptyState } from '../ui';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
```

- [ ] **Step 4: Tornar o cabeçalho do card clicável e renderizar `SubmissionDiff` quando expandido**

Em `src/frontend/src/components/pages/UserContributeView.tsx:109-140`, trocar:

```tsx
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
```

por:

```tsx
                <li
                  key={submission.id}
                  className="bg-calamity-bg-secondary border-2 border-calamity-border p-6"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold font-display text-calamity-accent-gold">
                        {submission.name}
                      </h3>
                      <p className="text-sm text-calamity-text-secondary">
                        {submission.type === 'UPDATE' ? 'Edição de arma existente' : 'Nova arma'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <SubmissionStatusBadge status={submission.status} />
                      <span className="text-calamity-text-secondary">
                        {expandedId === submission.id ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {expandedId === submission.id && (
                    <div className="mt-4 pt-4 border-t border-calamity-border">
                      <SubmissionDiff submission={submission} />
                    </div>
                  )}

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
```

- [ ] **Step 5: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run UserContributeView.test.tsx`
Expected: PASS (5 testes: 4 originais + 1 novo)

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/UserContributeView.tsx src/frontend/src/components/pages/UserContributeView.test.tsx
git commit -m "feat(frontend): adiciona expandir/colapsar com SubmissionDiff em Minhas Propostas"
```

---

## Task 5: Verificação final

**Files:** nenhum arquivo novo — só validação.

**Interfaces:** nenhuma.

- [ ] **Step 1: Rodar a suíte completa do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (todos os testes, incluindo os 8 novos desta feature: 3 de `weaponDiff.test.ts` + 4 de `SubmissionDiff.test.tsx` + 1 novo em `UserContributeView.test.tsx`)

- [ ] **Step 2: Validação manual (parar aqui e deixar o usuário conferir no browser)**

Com o backend e o frontend rodando localmente:
- Como USER, em `/perfil` → aba "Contribuições" → "Minhas Propostas": expandir uma proposta `UPDATE` pendente e conferir o diff (campos alterados em verde/vermelho riscado, campos inalterados em cor normal); expandir uma proposta `CREATE` e conferir que tudo aparece em verde.
- Como ADMIN, na mesma aba "Contribuições": expandir uma submissão da fila e conferir o mesmo diff.
- Testar o caso de fallback: se possível, criar uma submissão `UPDATE` para uma arma e depois deletar essa arma (como admin, via `WeaponDetailPage`), depois expandir a submissão e confirmar a mensagem "Arma original não encontrada".
- Conferir em mobile (375px), desktop (1280px), dark mode e light mode — cores de diff legíveis nos dois temas.

Este passo é manual, conforme a prática do projeto (testes automatizados verificam correção de código, não qualidade visual).
