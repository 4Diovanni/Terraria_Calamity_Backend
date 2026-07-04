# CRUD Direto de Armas (ADMIN) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o contrato `Weapon` do frontend para bater com o backend real, criar um componente de formulário compartilhado (`WeaponForm`), e dar ao ADMIN CRUD direto de arma (criar/editar/deletar) via UI — nada disso existe hoje.

**Architecture:** `types/weapon.ts` ganha `WeaponFormData` (campos editáveis) e `Weapon extends WeaponFormData` (+ id/timestamps/campos só de leitura). Uma função pura `weaponRarityToTier` bucketiza a raridade numérica (-1 a 17) do backend nos 5 tiers visuais já existentes (`RarityLevel`), usada só nas telas de arma. `WeaponForm` é o único formulário de criar/editar, recebendo `onSubmit` de quem o usa — `WeaponsPage` (criar) e `WeaponDetailPage` (editar) chamam `weaponService.createWeapon`/`updateWeapon` diretamente (sem fila, endpoints já são `ROLE_ADMIN`-only no backend).

**Tech Stack:** React 19, TypeScript, Vite, Vitest + Testing Library, Tailwind (tokens `calamity-*`), Radix Dialog (via `Drawer` já existente), axios.

## Global Constraints

- Rodar `cd src/frontend && npx vitest run` — TODOS os testes devem passar antes de qualquer commit. O total cresce a cada task (128 hoje, após a Task 1); não fixar um número absoluto nos steps além do que a própria task adiciona.
- Conventional Commits (`feat(scope):`, `fix(scope):`, `test(scope):`). Um commit por task. Nunca commitar com testes falhando.
- Tokens `calamity-*` do Tailwind — nunca hex hardcoded em componentes de tema (cores de raridade/elemento/classe no `Badge` são exceção documentada, já existente).
- NUNCA usar emojis em componentes novos (o emoji já existente no `<h1>` de `WeaponsPage.tsx` é pré-existente, fora de escopo — não copiar esse padrão em código novo).
- Mobile-first: classes base para mobile, `sm:`/`md:`/`lg:` para telas maiores.
- Após cada task: PARAR e deixar o usuário validar visualmente no navegador (mobile 375px, desktop 1280px, dark/light mode) antes de avançar — regra do projeto (`CLAUDE.md`), testes automatizados verificam correção de código, não qualidade visual.
- Branch: `feat/frontend-weapon-admin-crud` (já criada, spec commitada em `docs/superpowers/specs/2026-07-04-frontend-weapon-approval-design.md`).

---

### Task 1: `weaponRarityToTier` — bucketiza raridade numérica em tier visual

**Files:**
- Create: `src/frontend/src/lib/weaponRarity.ts`
- Test: `src/frontend/src/lib/weaponRarity.test.ts`

**Interfaces:**
- Produces: `weaponRarityToTier(rarity: number): RarityLevel` — usado pelas Tasks 2, 3, 5.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/frontend/src/lib/weaponRarity.test.ts
import { describe, it, expect } from 'vitest';
import { weaponRarityToTier } from './weaponRarity';
import { RarityLevel } from '../types/weapon';

describe('weaponRarityToTier', () => {
  it.each([
    [-1, RarityLevel.COMMON],
    [0, RarityLevel.COMMON],
    [2, RarityLevel.COMMON],
    [3, RarityLevel.UNCOMMON],
    [6, RarityLevel.UNCOMMON],
    [7, RarityLevel.RARE],
    [10, RarityLevel.RARE],
    [11, RarityLevel.EPIC],
    [14, RarityLevel.EPIC],
    [15, RarityLevel.LEGENDARY],
    [17, RarityLevel.LEGENDARY],
  ])('maps rarity %i to tier %s', (rarity, expectedTier) => {
    expect(weaponRarityToTier(rarity)).toBe(expectedTier);
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run weaponRarity`
Expected: FALHA — `weaponRarity.ts` não existe ainda (erro de import/resolução de módulo).

- [ ] **Step 3: Implementar**

```ts
// src/frontend/src/lib/weaponRarity.ts
import { RarityLevel } from '../types/weapon';

/**
 * Converte a raridade numérica do backend (-1 a 17) no tier visual usado
 * pela UI (Badge, borda de acento). Só usado nas telas de Arma — Armadura
 * tem seu próprio esquema, fora de escopo aqui.
 */
export const weaponRarityToTier = (rarity: number): RarityLevel => {
  if (rarity <= 2) return RarityLevel.COMMON;
  if (rarity <= 6) return RarityLevel.UNCOMMON;
  if (rarity <= 10) return RarityLevel.RARE;
  if (rarity <= 14) return RarityLevel.EPIC;
  return RarityLevel.LEGENDARY;
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run weaponRarity`
Expected: PASS (11/11 casos de `it.each`)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (128/128 — 127 existentes + 11 novos, menos 0 removidos = na prática o runner soma por arquivo; conferir que nenhum teste existente quebrou)

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/lib/weaponRarity.ts src/frontend/src/lib/weaponRarity.test.ts
git commit -m "feat(frontend): adiciona weaponRarityToTier para bucketizar raridade numerica"
```

**PARAR — validação manual não se aplica aqui (função pura, sem UI). Prosseguir para a Task 2.**

---

### Task 2: Corrigir contrato `Weapon` e propagar raridade numérica pelas telas existentes

**Files:**
- Modify: `src/frontend/src/types/weapon.ts`
- Modify: `src/frontend/src/services/weaponService.ts`
- Modify: `src/frontend/src/components/pages/WeaponCard.tsx`
- Modify: `src/frontend/src/components/pages/WeaponCard.test.tsx`
- Modify: `src/frontend/src/components/pages/WeaponsPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponsPage.test.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`
- Modify: `src/frontend/src/components/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `weaponRarityToTier` (Task 1)
- Produces: `WeaponFormData` (interface, campos editáveis de arma — usada pelas Tasks 5-8), `Weapon extends WeaponFormData` com `rarity: number`, `price: number`, `quality: number`, `abilities: string`.

Este é um refactor coordenado: o tipo `Weapon.rarity` muda de `RarityLevel` (enum) para `number`, o que exige atualizar todo consumidor no mesmo commit (senão o projeto não compila/os testes existentes quebram). Não há um "RED" único — cada sub-parte segue seu próprio ciclo fixture-primeiro-depois-implementação.

- [ ] **Step 1: Atualizar `types/weapon.ts`**

Substituir todo o conteúdo do arquivo por:

```ts
// src/frontend/src/types/weapon.ts
/**
 * Tipos para Armas
 */

export enum WeaponTypeClass {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGE = 'MAGE',
  SUMMON = 'SUMMON',
  ROGUE = 'ROGUE',
}

export enum Element {
  NEUTRAL = 'NEUTRAL',
  FIRE = 'FIRE',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  EARTH = 'EARTH',
  WATER = 'WATER',
  WIND = 'WIND',
  NATURE = 'NATURE',
  HOLY = 'HOLY',
  BRIMSTONE = 'BRIMSTONE',
  HOLY_FLAMES = 'HOLY_FLAMES',
  SHADOWFLAME = 'SHADOWFLAME',
  ASTRAL = 'ASTRAL',
  PLAGUE = 'PLAGUE',
  GOD_SLAYER = 'GOD_SLAYER',
  SULPHURIC = 'SULPHURIC',
  SHADOW = 'SHADOW',
  BLOOD = 'BLOOD',
  CRYSTAL = 'CRYSTAL',
  ARCANE = 'ARCANE',
  ELEMENTAL = 'ELEMENTAL',
  COSMIC = 'COSMIC',
  TEMPORAL = 'TEMPORAL',
  ABYSSAL = 'ABYSSAL',
  TOXIC = 'TOXIC',
  OMNI = 'OMNI',
  MAGIC = 'MAGIC',
}

export enum RarityLevel {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Campos editáveis de uma arma — mesmo shape usado pelo CRUD direto do
 * ADMIN (Tasks 5-8 deste plano) e, na próxima entrega, pela proposta do
 * USER via fila de aprovação.
 */
export interface WeaponFormData {
  name: string;
  weaponClass: WeaponTypeClass;
  element: Element;
  baseDamage: number;
  criticalChance: number;
  attacksPerTurn: number;
  range: number;
  /** Escala numérica do backend, -1 a 17. Para exibição, ver weaponRarityToTier. */
  rarity: number;
  price: number;
  quality: number;
  abilities: string;
  description: string;
  imageUrl: string;
}

export interface Weapon extends WeaponFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Documento .md completo (lore/história/notas). Backend preenche depois. */
  markdownContent?: string;
  /** Frase de sabor exibida no rodapé. Backend preenche depois. */
  flavorText?: string;
}

export interface WeaponFilters {
  weaponClass?: WeaponTypeClass;
  /** Tier de exibição (ver weaponRarityToTier) — não a raridade numérica crua. */
  rarity?: RarityLevel;
  minBaseDamage?: number;
  maxBaseDamage?: number;
  search?: string;
}
```

- [ ] **Step 2: Atualizar `weaponService.ts` para usar `WeaponFormData`**

Em `src/frontend/src/services/weaponService.ts`, trocar a linha de import e as assinaturas de `createWeapon`/`updateWeapon`:

```ts
// linha 2 — trocar:
import { Weapon, WeaponFormData } from '../types/weapon';
```

```ts
// método createWeapon — trocar a assinatura:
  async createWeapon(weapon: WeaponFormData): Promise<Weapon> {
```

```ts
// método updateWeapon — trocar a assinatura:
  async updateWeapon(id: string, weapon: WeaponFormData): Promise<Weapon> {
```

(o corpo dos dois métodos não muda, só o tipo do parâmetro)

- [ ] **Step 3: Atualizar fixture e asserções de `WeaponCard.test.tsx`**

```tsx
// src/frontend/src/components/pages/WeaponCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponCard } from './WeaponCard';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'Uma lâmina lendária forjada na Floresta da Corrupção.',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: 16,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  price: 100,
  quality: 8,
  abilities: '',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponCard', () => {
  it('renders the weapon name, damage and badges', () => {
    render(<WeaponCard weapon={weapon} onSelect={() => {}} />);
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
    expect(screen.getByText('55 DANO')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('calls onSelect with the weapon id when clicked', () => {
    const onSelect = vi.fn();
    render(<WeaponCard weapon={weapon} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Step 4: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponCard.test.tsx`
Expected: FALHA — `getByText('LEGENDARY')` não encontra nada, porque `WeaponCard.tsx` ainda passa `weapon.rarity` (agora `16`, um número) direto para o `Badge`, que renderiza `"16"` em vez de `"LEGENDARY"`.

- [ ] **Step 5: Corrigir `WeaponCard.tsx`**

```tsx
// src/frontend/src/components/pages/WeaponCard.tsx
import { Card, CardBody, Badge } from '../ui';
import { Weapon } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';

interface WeaponCardProps {
  weapon: Weapon;
  onSelect: (id: string) => void;
}

export const WeaponCard = ({ weapon, onSelect }: WeaponCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(weapon.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {weapon.imageUrl && (
          <img src={weapon.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{weapon.name}</h3>
          <span className="text-lg font-bold text-calamity-accent-gold whitespace-nowrap">
            {weapon.baseDamage} DANO
          </span>
        </div>
        <p className="text-calamity-text-secondary text-sm line-clamp-2">{weapon.description}</p>
        <div className="flex gap-2 flex-wrap mt-auto">
          <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
          <Badge variant="element" value={weapon.element} />
          <Badge variant="class" value={weapon.weaponClass} />
        </div>
      </CardBody>
    </Card>
  </button>
);
```

- [ ] **Step 6: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponCard.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 7: Atualizar fixture de `WeaponsPage.test.tsx`**

```tsx
// src/frontend/src/components/pages/WeaponsPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeaponsPage } from './WeaponsPage';
import { useWeapons } from '../../hooks/useWeapons';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../hooks/useWeapons');

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: 16,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  price: 100,
  quality: 8,
  abilities: '',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponsPage', () => {
  beforeEach(() => {
    vi.mocked(useWeapons).mockReturnValue({
      weapons: [weapon],
      loading: false,
      error: null,
      wakingUp: false,
      retryAttempt: null,
      refetch: vi.fn(),
    });
    mockUseAuth.mockReturnValue({ user: null });
  });

  it('renders the weapon list as a card grid', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
  });

  it('opens the filter drawer from the mobile filter button', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Buscar por Nome')).toBeInTheDocument();
  });

  it('filters by rarity tier using the numeric rarity underneath', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Raridade'), { target: { value: 'LEGENDARY' } });
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Raridade'), { target: { value: 'COMMON' } });
    expect(screen.queryByText('Terra Blade')).not.toBeInTheDocument();
  });
});
```

Nota: este arquivo passa a mockar `useAuth` porque a Task 6 vai adicionar um botão condicional a `user?.role`; adicionar o mock aqui evita quebrar quando a Task 6 chegar (o `WeaponsPage.tsx` desta task ainda não chama `useAuth`, então o mock fica "parado" até lá — inofensivo).

- [ ] **Step 8: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponsPage.test.tsx`
Expected: FALHA no teste novo de filtro — hoje `weapon.rarity !== selectedRarity` compara `16 !== 'LEGENDARY'` (sempre `true`, então a arma nunca aparece mesmo com o filtro certo).

- [ ] **Step 9: Corrigir o filtro em `WeaponsPage.tsx`**

Trocar a linha do filtro de raridade dentro de `filteredWeapons`:

```tsx
// trocar:
      if (selectedRarity && weapon.rarity !== selectedRarity) return false;
// por:
      if (selectedRarity && weaponRarityToTier(weapon.rarity) !== selectedRarity) return false;
```

E adicionar o import no topo do arquivo:

```tsx
import { weaponRarityToTier } from "../../lib/weaponRarity";
```

- [ ] **Step 10: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponsPage.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 11: Atualizar fixture de `WeaponDetailPage.test.tsx`**

```tsx
// src/frontend/src/components/pages/WeaponDetailPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WeaponDetailPage } from './WeaponDetailPage';
import { weaponService } from '../../services/weaponService';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn(), updateWeapon: vi.fn(), deleteWeapon: vi.fn() },
}));

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const weapon: Weapon = {
  id: '42',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: 16,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  price: 100,
  quality: 8,
  abilities: '',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponDetailPage', () => {
  beforeEach(() => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(weapon);
    mockUseAuth.mockReturnValue({ user: null });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/weapons/42']}>
        <Routes>
          <Route path="/weapons/:id" element={<WeaponDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the weapon name and tipo/raridade/classe badges', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    // Badges: Tipo (element) e Raridade uma vez; Classe aparece na badge e no rodapé.
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
  });

  it('renders the description as markdown and the codex footer', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('desc')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Descrição' })).toBeInTheDocument();
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('Classe')).toBeInTheDocument();
    expect(screen.getByText('Adicionado em')).toBeInTheDocument();
  });

  it('links back to the weapons list', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Voltar para Armas/i })).toHaveAttribute(
      'href',
      '/weapons'
    );
  });
});
```

- [ ] **Step 12: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: FALHA no primeiro teste — `RARITY_BORDER[weapon.rarity]` e o `Badge` de raridade ainda usam `weapon.rarity` cru (`16`), então `getByText('LEGENDARY')` não encontra nada.

- [ ] **Step 13: Corrigir `WeaponDetailPage.tsx` (raridade)**

Adicionar o import (junto aos outros de `../../types/weapon` e `../../lib`):

```tsx
import { weaponRarityToTier } from '../../lib/weaponRarity';
```

Trocar as duas linhas que usam `weapon.rarity` cru:

```tsx
// trocar:
        accentClass={RARITY_BORDER[weapon.rarity] ?? 'border-calamity-border'}
// por:
        accentClass={RARITY_BORDER[weaponRarityToTier(weapon.rarity)] ?? 'border-calamity-border'}
```

```tsx
// trocar:
            <Badge variant="rarity" value={weapon.rarity} />
// por:
            <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
```

- [ ] **Step 14: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 15: Corrigir `HomePage.tsx` (carrossel da home também usa rarity cru)**

Em `src/frontend/src/components/pages/HomePage.tsx`, adicionar o import:

```tsx
import { weaponRarityToTier } from '../../lib/weaponRarity';
```

E trocar, dentro do `map` que monta `weaponItems`:

```tsx
// trocar:
    accentColor: RARITY_ACCENT[w.rarity] ?? '#d4a017',
    meta: (
      <>
        <Badge variant="rarity" value={w.rarity} />
// por:
    accentColor: RARITY_ACCENT[weaponRarityToTier(w.rarity)] ?? '#d4a017',
    meta: (
      <>
        <Badge variant="rarity" value={weaponRarityToTier(w.rarity)} />
```

- [ ] **Step 16: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS — nenhuma regressão em `HomePage.test.tsx` (não tem fixture de rarity, só verifica estrutura da página) nem no restante da suíte.

- [ ] **Step 17: Commit**

```bash
git add src/frontend/src/types/weapon.ts src/frontend/src/services/weaponService.ts src/frontend/src/components/pages/WeaponCard.tsx src/frontend/src/components/pages/WeaponCard.test.tsx src/frontend/src/components/pages/WeaponsPage.tsx src/frontend/src/components/pages/WeaponsPage.test.tsx src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx src/frontend/src/components/pages/HomePage.tsx
git commit -m "fix(frontend): corrige contrato Weapon (rarity numerica, price/quality/abilities)"
```

**PARAR — validação manual do usuário: abrir `/weapons`, `/weapons/:id` e `/` (home) em mobile (375px) e desktop (1280px), dark e light mode. Confirmar que os badges/bordas de raridade continuam corretos e o filtro de raridade da listagem funciona. Só prosseguir para a Task 3 após aprovação.**

---

### Task 3: `WeaponDetailPage` exibe `price`, `quality` e `abilities`

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`

**Interfaces:**
- Consumes: `Weapon.price`, `Weapon.quality`, `Weapon.abilities` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe('WeaponDetailPage', ...)` em `WeaponDetailPage.test.tsx`, e atualizar a fixture `weapon` para ter `abilities: 'Investida em linha reta ao acertar um crítico.'` (troca do valor vazio usado na Task 2):

```tsx
// na fixture `weapon`, trocar:
  abilities: '',
// por:
  abilities: 'Investida em linha reta ao acertar um crítico.',
```

```tsx
  it('renders price, quality and abilities', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.getByText('Qualidade')).toBeInTheDocument();
    expect(screen.getByText('Preço')).toBeInTheDocument();
    expect(screen.getByText('100 moedas')).toBeInTheDocument();
    expect(screen.getByText('Habilidades')).toBeInTheDocument();
    expect(
      screen.getByText('Investida em linha reta ao acertar um crítico.')
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: FALHA — nenhum desses textos existe ainda na página.

- [ ] **Step 3: Implementar**

Em `WeaponDetailPage.tsx`, adicionar um `StatBar` de Qualidade logo após o de "Knockback" (dentro do bloco `Estatísticas` do `aside`):

```tsx
        <StatBar label="Knockback" value={weapon.range} max={10} colorClass="text-calamity-primary" />
        <StatBar
          label="Qualidade"
          value={weapon.quality}
          max={10}
          colorClass="text-calamity-accent-blue"
        />
```

Adicionar "Preço" aos itens do `footer` (`DetailFooter`):

```tsx
  const footer = (
    <DetailFooter
      items={[
        { label: 'Classe', value: weapon.weaponClass },
        { label: 'Preço', value: `${weapon.price} moedas` },
        { label: 'Adicionado em', value: new Date(weapon.createdAt).toLocaleDateString('pt-BR') },
      ]}
      quote={weapon.flavorText}
    />
  );
```

Adicionar uma seção "Habilidades" no conteúdo principal, só quando `weapon.abilities` não for vazio — logo abaixo do bloco de "Descrição" existente, antes do fechamento de `</DetailLayout>`:

```tsx
    <DetailLayout backTo="/weapons" backLabel="Voltar para Armas" aside={aside} footer={footer}>
      <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
        Descrição
      </h2>
      <MarkdownContent content={weapon.markdownContent ?? weapon.description} />

      {weapon.abilities && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
            Habilidades
          </h2>
          <p className="text-calamity-text-secondary font-body">{weapon.abilities}</p>
        </div>
      )}
    </DetailLayout>
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: PASS (4/4)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx
git commit -m "feat(frontend): exibe preco, qualidade e habilidades na WeaponDetailPage"
```

**PARAR — validação manual do usuário: abrir uma arma em `/weapons/:id`, conferir os novos campos (mobile e desktop, dark/light). Só prosseguir para a Task 4 após aprovação.**

---

### Task 4: `apiClient.ts` — tratamento de 409

**Files:**
- Modify: `src/frontend/src/services/apiClient.ts`
- Modify: `src/frontend/src/services/apiClient.test.ts`

**Interfaces:**
- Produces: erro 409 rejeitado com `message` vindo do corpo da resposta do backend (usado pela Task 8, ao deletar arma referenciada por submissão).

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `src/frontend/src/services/apiClient.test.ts` (novo `describe`, após o `describe('apiClient cold-start retry', ...)` existente):

```ts
describe('apiClient error handling', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('surfaces the backend message on 409 responses', async () => {
    mock
      .onPost('/api/v1/weapons')
      .reply(409, { status: 409, message: 'Ja existe uma submissao pendente para esta arma' });

    const error = await apiClient.post('/api/v1/weapons', {}).catch((e) => e);

    expect(error.status).toBe(409);
    expect(error.message).toBe('Ja existe uma submissao pendente para esta arma');
  });

  it('falls back to a generic message when the 409 response has no body message', async () => {
    mock.onDelete('/api/v1/weapons/1').reply(409, {});

    const error = await apiClient.delete('/api/v1/weapons/1').catch((e) => e);

    expect(error.status).toBe(409);
    expect(error.message).toBe('Conflito ao processar a solicitação.');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run apiClient.test.ts`
Expected: FALHA nos 2 casos novos — hoje um 409 cai no `error.message` genérico do axios ("Request failed with status code 409"), não na mensagem do corpo.

- [ ] **Step 3: Implementar**

Em `src/frontend/src/services/apiClient.ts`, adicionar o bloco de 409 logo após o bloco de 404 existente (antes do bloco de 500):

```ts
    if (error.response?.status === 409) {
      // Conflito — o backend já manda uma mensagem específica no corpo
      // (ex.: submissão pendente duplicada, ou recurso referenciado que
      // não pode ser removido).
      const backendMessage = (error.response.data as { message?: string } | undefined)?.message;
      apiError.message = backendMessage || 'Conflito ao processar a solicitação.';
    }
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run apiClient.test.ts`
Expected: PASS (6/6 — 4 existentes + 2 novos)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/services/apiClient.ts src/frontend/src/services/apiClient.test.ts
git commit -m "feat(frontend): apiClient repassa mensagem do backend em respostas 409"
```

**PARAR — validação manual não se aplica aqui (sem UI). Prosseguir para a Task 5.**

---

### Task 5: `WeaponForm` — componente compartilhado de criar/editar

**Files:**
- Create: `src/frontend/src/components/pages/WeaponForm.tsx`
- Test: `src/frontend/src/components/pages/WeaponForm.test.tsx`

**Interfaces:**
- Consumes: `WeaponFormData`, `WeaponTypeClass`, `Element` (Task 2), `weaponRarityToTier` (Task 1), `Button`, `Badge` (`ui/`)
- Produces: `WeaponForm({ initialValues?, onSubmit, onCancel, submitLabel })` — usado pelas Tasks 6 e 7.

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// src/frontend/src/components/pages/WeaponForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeaponForm } from './WeaponForm';
import { WeaponFormData, WeaponTypeClass, Element } from '../../types/weapon';

const validData: WeaponFormData = {
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
  abilities: 'Corta em linha reta',
  description: 'Uma lâmina lendária.',
  imageUrl: '',
};

describe('WeaponForm', () => {
  it('renders pre-filled fields when initialValues is provided', () => {
    render(
      <WeaponForm initialValues={validData} onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Salvar" />
    );
    expect(screen.getByLabelText('Nome')).toHaveValue('Terra Blade');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Uma lâmina lendária.');
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<WeaponForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome da arma')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the form data when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <WeaponForm initialValues={validData} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(validData));
  });

  it('displays the error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue({ message: 'Ja existe uma submissao pendente' });
    render(
      <WeaponForm initialValues={validData} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Ja existe uma submissao pendente')).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <WeaponForm initialValues={validData} onSubmit={vi.fn()} onCancel={onCancel} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponForm.test.tsx`
Expected: FALHA de compilação/resolução — `WeaponForm.tsx` não existe ainda.

- [ ] **Step 3: Implementar**

```tsx
// src/frontend/src/components/pages/WeaponForm.tsx
import { useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WeaponTypeClass, Element, WeaponFormData } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';

interface WeaponFormProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const EMPTY_FORM: WeaponFormData = {
  name: '',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 1,
  criticalChance: 1,
  attacksPerTurn: 1,
  range: 0,
  rarity: 0,
  price: 0,
  quality: 0,
  abilities: '',
  description: '',
  imageUrl: '',
};

type FieldErrors = Partial<Record<keyof WeaponFormData, string>>;

function validate(data: WeaponFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = 'Informe o nome da arma';
  if (!data.description.trim()) errors.description = 'Informe uma descrição';
  if (data.baseDamage < 1) errors.baseDamage = 'Dano base deve ser pelo menos 1';
  if (data.criticalChance < 1 || data.criticalChance > 20) {
    errors.criticalChance = 'Chance de crítico deve estar entre 1 e 20';
  }
  if (data.attacksPerTurn < 1) errors.attacksPerTurn = 'Ataques por turno deve ser pelo menos 1';
  if (data.range < 0) errors.range = 'Alcance não pode ser negativo';
  if (data.rarity < -1 || data.rarity > 17) errors.rarity = 'Raridade deve estar entre -1 e 17';
  if (data.price < 0) errors.price = 'Preço não pode ser negativo';
  if (data.quality < 0 || data.quality > 10) errors.quality = 'Qualidade deve estar entre 0 e 10';
  return errors;
}

const fieldClass =
  'w-full bg-calamity-bg-tertiary border border-calamity-border px-3 py-2 text-calamity-text-primary focus:ring-2 focus:ring-calamity-primary focus:outline-none';
const labelClass = 'block text-sm mb-1 text-calamity-text-secondary font-display';

export const WeaponForm = ({ initialValues, onSubmit, onCancel, submitLabel }: WeaponFormProps) => {
  const [data, setData] = useState<WeaponFormData>(initialValues ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = <K extends keyof WeaponFormData>(field: K, value: WeaponFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setSubmitError(message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="wf-name" className={labelClass}>Nome</label>
        <input
          id="wf-name"
          type="text"
          value={data.name}
          onChange={(e) => setField('name', e.target.value)}
          className={fieldClass}
        />
        {errors.name && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-class" className={labelClass}>Classe</label>
          <select
            id="wf-class"
            value={data.weaponClass}
            onChange={(e) => setField('weaponClass', e.target.value as WeaponTypeClass)}
            className={fieldClass}
          >
            {Object.values(WeaponTypeClass).map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wf-element" className={labelClass}>Elemento</label>
          <select
            id="wf-element"
            value={data.element}
            onChange={(e) => setField('element', e.target.value as Element)}
            className={fieldClass}
          >
            {Object.values(Element).map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-baseDamage" className={labelClass}>Dano Base</label>
          <input
            id="wf-baseDamage"
            type="number"
            value={data.baseDamage}
            onChange={(e) => setField('baseDamage', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.baseDamage && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.baseDamage}</p>}
        </div>
        <div>
          <label htmlFor="wf-criticalChance" className={labelClass}>Chance de Crítico (1-20)</label>
          <input
            id="wf-criticalChance"
            type="number"
            value={data.criticalChance}
            onChange={(e) => setField('criticalChance', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.criticalChance && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.criticalChance}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-attacksPerTurn" className={labelClass}>Ataques por Turno</label>
          <input
            id="wf-attacksPerTurn"
            type="number"
            step="0.1"
            value={data.attacksPerTurn}
            onChange={(e) => setField('attacksPerTurn', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.attacksPerTurn && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.attacksPerTurn}</p>}
        </div>
        <div>
          <label htmlFor="wf-range" className={labelClass}>Alcance</label>
          <input
            id="wf-range"
            type="number"
            value={data.range}
            onChange={(e) => setField('range', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.range && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.range}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wf-rarity" className={labelClass}>Raridade (-1 a 17)</label>
        <div className="flex items-center gap-3">
          <input
            id="wf-rarity"
            type="number"
            value={data.rarity}
            onChange={(e) => setField('rarity', Number(e.target.value))}
            className={fieldClass}
          />
          <Badge variant="rarity" value={weaponRarityToTier(data.rarity)} />
        </div>
        {errors.rarity && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.rarity}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wf-price" className={labelClass}>Preço</label>
          <input
            id="wf-price"
            type="number"
            value={data.price}
            onChange={(e) => setField('price', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.price && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="wf-quality" className={labelClass}>Qualidade (0-10)</label>
          <input
            id="wf-quality"
            type="number"
            value={data.quality}
            onChange={(e) => setField('quality', Number(e.target.value))}
            className={fieldClass}
          />
          {errors.quality && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.quality}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wf-abilities" className={labelClass}>Habilidades</label>
        <textarea
          id="wf-abilities"
          value={data.abilities}
          onChange={(e) => setField('abilities', e.target.value)}
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="wf-description" className={labelClass}>Descrição</label>
        <textarea
          id="wf-description"
          value={data.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={4}
          className={fieldClass}
        />
        {errors.description && <p role="alert" className="mt-1 text-sm text-calamity-primary">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="wf-imageUrl" className={labelClass}>URL da Imagem</label>
        <input
          id="wf-imageUrl"
          type="text"
          value={data.imageUrl}
          onChange={(e) => setField('imageUrl', e.target.value)}
          className={fieldClass}
        />
      </div>

      {submitError && <p role="alert" className="text-sm text-calamity-primary">{submitError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponForm.test.tsx`
Expected: PASS (5/5)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponForm.tsx src/frontend/src/components/pages/WeaponForm.test.tsx
git commit -m "feat(frontend): adiciona WeaponForm compartilhado para criar/editar arma"
```

**PARAR — validação manual não se aplica isoladamente aqui (componente ainda não está conectado a nenhuma página). Prosseguir para a Task 6.**

---

### Task 6: `WeaponsPage` — botão "+ Nova Arma" (ADMIN)

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponsPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponsPage.test.tsx`

**Interfaces:**
- Consumes: `useAuth` (`user.role`), `WeaponForm` (Task 5), `weaponService.createWeapon` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe('WeaponsPage', ...)`:

```tsx
// no topo do arquivo, adicionar import:
import { weaponService } from '../../services/weaponService';

vi.mock('../../services/weaponService', () => ({
  weaponService: { createWeapon: vi.fn() },
}));
```

```tsx
  it('does not show the "Nova Arma" button for non-admin users', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: '+ Nova Arma' })).not.toBeInTheDocument();
  });

  it('shows the "Nova Arma" button and opens the create drawer for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Nova Arma' }));
    const dialog = screen.getByRole('dialog', { name: 'Nova Arma' });
    expect(within(dialog).getByLabelText('Nome')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponsPage.test.tsx`
Expected: FALHA — botão "+ Nova Arma" não existe ainda.

- [ ] **Step 3: Implementar**

Em `WeaponsPage.tsx`, adicionar os imports:

```tsx
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { WeaponForm } from "./WeaponForm";
import { weaponService } from "../../services/weaponService";
import { WeaponFormData } from "../../types/weapon";
```

Dentro do componente, logo após a linha `const { weapons, loading, error, wakingUp, retryAttempt, refetch } = useWeapons();`:

```tsx
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: WeaponFormData) => {
    await weaponService.createWeapon(data);
    setIsCreateOpen(false);
    await refetch();
  };
```

No JSX, logo após o parágrafo "Total: X armas encontradas" (dentro da `div className="mb-12"`):

```tsx
          <p className="text-xl text-calamity-text-secondary">
            Total: <span className="text-calamity-primary font-bold">{filteredWeapons.length}</span> armas encontradas
          </p>
          {user?.role === 'ADMIN' && (
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              + Nova Arma
            </Button>
          )}
```

E, junto ao `Drawer` de filtros já existente (logo depois dele):

```tsx
        <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Nova Arma" side="right">
          <WeaponForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            submitLabel="Criar Arma"
          />
        </Drawer>
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponsPage.test.tsx`
Expected: PASS (5/5)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponsPage.tsx src/frontend/src/components/pages/WeaponsPage.test.tsx
git commit -m "feat(frontend): adiciona criacao direta de arma para ADMIN na WeaponsPage"
```

**PARAR — validação manual do usuário: logar como ADMIN e como USER comum, conferir que o botão só aparece pro ADMIN, testar o fluxo de criar uma arma (mobile e desktop, dark/light). Só prosseguir para a Task 7 após aprovação.**

---

### Task 7: `WeaponDetailPage` — botão "Editar" (ADMIN)

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`

**Interfaces:**
- Consumes: `useAuth` (`user.role`), `WeaponForm` (Task 5), `weaponService.updateWeapon` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

```tsx
  it('does not show admin action buttons for non-admin users', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('opens the edit drawer pre-filled and saves via updateWeapon for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.updateWeapon).mockResolvedValue({ ...weapon, name: 'Terra Blade+' });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Arma' });
    expect(within(dialog).getByLabelText('Nome')).toHaveValue('Terra Blade');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(weaponService.updateWeapon).toHaveBeenCalledWith('42', expect.objectContaining({ name: 'Terra Blade' }))
    );
    await waitFor(() => expect(screen.getByText('Terra Blade+')).toBeInTheDocument());
  });
```

(adicionar `import { within } from '@testing-library/react';` ao import já existente de `render, screen, waitFor` no topo do arquivo)

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: FALHA — botão "Editar" não existe ainda.

- [ ] **Step 3: Implementar**

Adicionar imports no topo de `WeaponDetailPage.tsx`:

```tsx
import { useAuth } from '../../hooks/useAuth';
import { WeaponForm } from './WeaponForm';
import type { WeaponFormData } from '../../types/weapon';
```

E trocar o import de componentes `ui` para incluir `Drawer` e `Button`:

```tsx
import {
  Badge,
  DetailLayout,
  EntityHero,
  StatBar,
  MarkdownContent,
  DetailFooter,
  Drawer,
  Button,
} from '../ui';
```

Dentro do componente, logo após `const [error, setError] = useState<string | null>(null);`:

```tsx
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleUpdate = async (data: WeaponFormData) => {
    if (!weapon) return;
    const updated = await weaponService.updateWeapon(weapon.id, data);
    setWeapon(updated);
    setIsEditOpen(false);
  };
```

No `aside`, logo após o `<EntityHero ... />` (antes do bloco de Estatísticas):

```tsx
      {user?.role === 'ADMIN' && (
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            Editar
          </Button>
        </div>
      )}
```

No `return`, envolver o `DetailLayout` numa fragment e adicionar o `Drawer` de edição logo depois:

```tsx
  return (
    <>
      <DetailLayout backTo="/weapons" backLabel="Voltar para Armas" aside={aside} footer={footer}>
        <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
          Descrição
        </h2>
        <MarkdownContent content={weapon.markdownContent ?? weapon.description} />

        {weapon.abilities && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
              Habilidades
            </h2>
            <p className="text-calamity-text-secondary font-body">{weapon.abilities}</p>
          </div>
        )}
      </DetailLayout>

      {user?.role === 'ADMIN' && (
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} title="Editar Arma" side="right">
          <WeaponForm
            initialValues={weapon}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            submitLabel="Salvar Alterações"
          />
        </Drawer>
      )}
    </>
  );
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: PASS (6/6)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx
git commit -m "feat(frontend): adiciona edicao direta de arma para ADMIN na WeaponDetailPage"
```

**PARAR — validação manual do usuário: logar como ADMIN, abrir uma arma, editar e salvar; conferir que USER comum não vê o botão (mobile e desktop, dark/light). Só prosseguir para a Task 8 após aprovação.**

---

### Task 8: `WeaponDetailPage` — botão "Deletar" (ADMIN), com tratamento de 409

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`

**Interfaces:**
- Consumes: `weaponService.deleteWeapon` (existente), tratamento de 409 do `apiClient` (Task 4)

- [ ] **Step 1: Escrever o teste que falha**

```tsx
  it('deletes the weapon and navigates back to the list on confirm', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.deleteWeapon).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    const dialog = screen.getByRole('dialog', { name: 'Deletar Arma' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar Exclusão' }));

    await waitFor(() => expect(weaponService.deleteWeapon).toHaveBeenCalledWith('42'));
  });

  it('shows the backend conflict message when delete fails with 409', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.deleteWeapon).mockRejectedValue({
      status: 409,
      message: 'Não é possível deletar: esta arma possui submissões associadas',
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    const dialog = screen.getByRole('dialog', { name: 'Deletar Arma' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar Exclusão' }));

    expect(
      await within(dialog).findByText('Não é possível deletar: esta arma possui submissões associadas')
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: FALHA — botão "Deletar" não existe ainda.

- [ ] **Step 3: Implementar**

Adicionar `useNavigate` ao import de `react-router-dom` já existente:

```tsx
import { useParams, useNavigate } from 'react-router-dom';
```

Dentro do componente, junto às outras declarações de estado:

```tsx
  const navigate = useNavigate();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!weapon) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await weaponService.deleteWeapon(weapon.id);
      navigate('/weapons');
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setDeleteError(message || 'Erro ao deletar arma.');
      setIsDeleting(false);
    }
  };
```

No bloco de botões de admin do `aside` (criado na Task 7), adicionar o botão "Deletar" ao lado de "Editar":

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
```

E, logo após o `Drawer` de edição (dentro da fragment do `return`):

```tsx
      {user?.role === 'ADMIN' && (
        <Drawer open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} title="Deletar Arma" side="right">
          <div className="space-y-4">
            <p className="text-calamity-text-primary">
              Tem certeza que deseja deletar <strong>{weapon.name}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            {deleteError && <p role="alert" className="text-sm text-calamity-primary">{deleteError}</p>}
            <div className="flex gap-3">
              <Button variant="primary" isLoading={isDeleting} onClick={handleDelete}>
                Confirmar Exclusão
              </Button>
              <Button variant="outline" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Drawer>
      )}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run WeaponDetailPage.test.tsx`
Expected: PASS (8/8)

- [ ] **Step 5: Rodar a suíte completa**

Run: `cd src/frontend && npx vitest run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx
git commit -m "feat(frontend): adiciona exclusao direta de arma para ADMIN, com tratamento de 409"
```

**PARAR — validação manual do usuário: logar como ADMIN, deletar uma arma sem submissões associadas (deve funcionar e voltar pra listagem); se possível, testar contra uma arma referenciada por uma submissão do backend (deve mostrar a mensagem de conflito em vez de quebrar). Mobile e desktop, dark/light. Esta é a última task do plano.**

---

## Self-Review

**1. Cobertura da spec (seção 3 do design doc):**
- Correção do contrato `Weapon` (§3.1) → Tasks 1, 2, 3.
- `WeaponForm` compartilhado (§3.2) → Task 5.
- Criar/Editar/Deletar direto do ADMIN (§3.3) → Tasks 6, 7, 8.
- Tratamento de 409 (§5, parte relevante a esta entrega) → Task 4.
- Fora de escopo desta entrega (fila de submissões, dashboard, "Sugerir Edição" do USER, aba "Contribuir") — fica para `feat/frontend-weapon-approval-queue`, spec §4.

**2. Placeholders:** nenhum "TBD"/"TODO" — todos os steps têm código completo e comandos exatos.

**3. Consistência de tipos:** `WeaponFormData` (Task 2) é o único shape usado por `WeaponForm` (Task 5), `weaponService.createWeapon`/`updateWeapon` (Task 2) e os handlers `handleCreate`/`handleUpdate` (Tasks 6, 7) — mesmos nomes de campo em todo lugar. `weaponRarityToTier` (Task 1) é a única função de conversão, reusada em `WeaponCard`, `WeaponsPage`, `WeaponDetailPage`, `HomePage` (Task 2) e dentro do próprio `WeaponForm` (Task 5, preview do badge).

---

## Ordem de execução

Tasks 1 → 8, nesta ordem (cada uma depende de arquivos criados pela anterior, exceto a Task 4 que é independente e poderia rodar em paralelo com 1-3, mas fica sequencial aqui por simplicidade). Rodar `cd src/frontend && npx vitest run` completo ao final de cada task, não só o teste novo. Parar para validação manual do usuário após cada task, conforme regra do projeto.
