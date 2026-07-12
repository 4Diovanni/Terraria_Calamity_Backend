---
tags: [plan, frontend, submissions]
aliases: [Preview ao Vivo de Submissões]
up: "[[INDEX]]"
related:
  - "[[WeaponsPage]]"
  - "[[Weapons]]"
  - "[[2026-07-11-preview-submissoes-design]]"
status: ativo
---

# Preview ao Vivo de Submissões Implementation Plan

> Ver também: [[WeaponsPage]] · spec: [[2026-07-11-preview-submissoes-design]]

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar, ao vivo, como a página de detalhe de uma arma vai ficar (com os valores propostos aplicados) durante criação/edição de arma e ao revisar submissões pendentes — nos drawers de Editar/Sugerir Edição, na aba "Nova Proposta" e na fila de revisão do admin.

**Architecture:** Extrai o conteúdo visual de `WeaponDetailPage` em subcomponentes reutilizáveis (`WeaponAside`, `WeaponMainContent`, `WeaponFooterContent`, compostos em `WeaponDetailContent`). Uma função pura (`buildPreviewWeapon`) preenche os campos que só existem depois de persistir (id/createdAt/markdownContent/flavorText) a partir de uma arma-base opcional. `WeaponForm` ganha um callback `onDataChange` para expor seus valores ao vivo sem virar componente controlado; `WeaponFormWithPreview` envolve `WeaponForm` com abas Formulário/Pré-visualização. Na fila do admin, um hook compartilhado (`useSubmissionTargetWeapon`, extraído de `SubmissionDiff`) alimenta um novo `SubmissionPreview`, aberto via botão em um `Drawer` mais largo.

**Tech Stack:** React + TypeScript, Vitest + Testing Library, Tailwind (tokens `calamity-*`), Radix UI (`Drawer` via `@radix-ui/react-dialog`).

## Global Constraints

- Tokens `calamity-*` do Tailwind, nunca hex hardcoded nos componentes de tema (exceção: `Badge`, que já usa cores semânticas de gameplay — não mexer nesse padrão).
- Nenhum emoji em nenhum componente.
- Mobile-first: classes base para mobile, `sm:`/`md:`/`lg:` para telas maiores.
- Rodar `cd src/frontend && npx vitest run` após cada task — todos os testes devem passar antes do commit da task. A contagem total de testes cresce a cada task; não travar em um número fixo.
- Commits atômicos, Conventional Commits (`feat(scope):`, `test(scope):`, `refactor(scope):`). Nunca commitar com testes falhando.
- `Drawer` ganha uma prop `size` opcional — chamadas existentes que não passam `size` devem continuar se comportando exatamente como hoje (`max-w-sm` no lado direito).
- 100% frontend — nenhuma mudança de backend/API neste plano.

---

### Task 1: Extrair `WeaponDetailContent` de `WeaponDetailPage`

**Files:**
- Create: `src/frontend/src/components/pages/WeaponDetailContent.tsx`
- Create: `src/frontend/src/components/pages/WeaponDetailContent.test.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`

**Interfaces:**
- Consumes: `Weapon`, `RarityLevel` (`../../types/weapon`); `weaponRarityToTier` (`../../lib/weaponRarity`); `Badge`, `StatBar`, `EntityHero`, `MarkdownContent`, `DetailFooter` (`../ui`).
- Produces: `WeaponAside({ weapon: Weapon; actions?: ReactNode })`, `WeaponMainContent({ weapon: Weapon })`, `WeaponFooterContent({ weapon: Weapon })`, e `WeaponDetailContent({ weapon: Weapon; actions?: ReactNode })` — todos exportados de `WeaponDetailContent.tsx`. Tasks futuras (5, 8) consomem `WeaponDetailContent`.

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

Criar `src/frontend/src/components/pages/WeaponDetailContent.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeaponDetailContent } from './WeaponDetailContent';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

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
  abilities: 'Investida em linha reta ao acertar um crítico.',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponDetailContent', () => {
  it('renders name, badges and stats', () => {
    render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
  });

  it('renders description, abilities and footer metadata', () => {
    render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByText('Habilidades')).toBeInTheDocument();
    expect(
      screen.getByText('Investida em linha reta ao acertar um crítico.')
    ).toBeInTheDocument();
    expect(screen.getByText('100 moedas')).toBeInTheDocument();
    expect(screen.getByText('Adicionado em')).toBeInTheDocument();
  });

  it('omits the abilities section when the weapon has none', () => {
    render(<WeaponDetailContent weapon={{ ...weapon, abilities: '' }} />);
    expect(screen.queryByText('Habilidades')).not.toBeInTheDocument();
  });

  it('renders the actions slot between the hero and the stats block', () => {
    render(<WeaponDetailContent weapon={weapon} actions={<button>Editar</button>} />);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('renders the flavor quote only when present', () => {
    const { rerender } = render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.queryByText(/Corta tudo/)).not.toBeInTheDocument();

    rerender(<WeaponDetailContent weapon={{ ...weapon, flavorText: 'Corta tudo.' }} />);
    expect(screen.getByText(/Corta tudo\./)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponDetailContent.test.tsx`
Expected: FAIL — `Failed to resolve import "./WeaponDetailContent"`.

- [ ] **Step 3: Implementar `WeaponDetailContent.tsx`**

Criar `src/frontend/src/components/pages/WeaponDetailContent.tsx`:

```tsx
import { type ReactNode } from 'react';
import { Weapon, RarityLevel } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';
import { Badge, StatBar, EntityHero, MarkdownContent, DetailFooter } from '../ui';

// Borda de acento por raridade — sinal de gameplay (cor semântica), não chrome de tema.
const RARITY_BORDER: Record<RarityLevel, string> = {
  [RarityLevel.COMMON]: 'border-gray-500',
  [RarityLevel.UNCOMMON]: 'border-green-500',
  [RarityLevel.RARE]: 'border-blue-500',
  [RarityLevel.EPIC]: 'border-purple-500',
  [RarityLevel.LEGENDARY]: 'border-yellow-500',
};

interface WeaponAsideProps {
  weapon: Weapon;
  /** Slot para os botões de ação da página real (Editar/Deletar/Sugerir Edição). Ausente no preview. */
  actions?: ReactNode;
}

export const WeaponAside = ({ weapon, actions }: WeaponAsideProps) => (
  <div className="space-y-8">
    <EntityHero
      imageUrl={weapon.imageUrl}
      name={weapon.name}
      accentClass={RARITY_BORDER[weaponRarityToTier(weapon.rarity)] ?? 'border-calamity-border'}
      badges={
        <>
          <Badge variant="element" value={weapon.element} />
          <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
          <Badge variant="class" value={weapon.weaponClass} />
        </>
      }
    />

    {actions}

    <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-6 space-y-6">
      <h2 className="text-xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-3">
        Estatísticas
      </h2>
      <StatBar label="Dano" value={weapon.baseDamage} max={200} colorClass="text-calamity-primary" />
      <StatBar
        label="Chance de Crítico"
        value={weapon.criticalChance}
        displayValue={`${weapon.criticalChance}%`}
        max={100}
        colorClass="text-calamity-accent-purple"
      />
      <StatBar
        label="Velocidade"
        value={weapon.attacksPerTurn}
        max={5}
        colorClass="text-calamity-accent-green"
      />
      <StatBar label="Knockback" value={weapon.range} max={10} colorClass="text-calamity-primary" />
      <StatBar
        label="Qualidade"
        value={weapon.quality}
        max={10}
        colorClass="text-calamity-accent-blue"
      />
    </div>
  </div>
);

export const WeaponMainContent = ({ weapon }: { weapon: Weapon }) => (
  <>
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
  </>
);

export const WeaponFooterContent = ({ weapon }: { weapon: Weapon }) => (
  <DetailFooter
    items={[
      { label: 'Classe', value: weapon.weaponClass },
      { label: 'Preço', value: `${weapon.price} moedas` },
      { label: 'Adicionado em', value: new Date(weapon.createdAt).toLocaleDateString('pt-BR') },
    ]}
    quote={weapon.flavorText}
  />
);

interface WeaponDetailContentProps {
  weapon: Weapon;
  /** Slot de ações opcional, repassado ao WeaponAside (só usado pela página real). */
  actions?: ReactNode;
}

/**
 * Conteúdo visual completo de uma arma (aside + main + footer), sem o chrome
 * de página (link de voltar, min-h-screen) — usado nos previews dentro de Drawer.
 */
export const WeaponDetailContent = ({ weapon, actions }: WeaponDetailContentProps) => (
  <div>
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <aside className="md:w-1/3 md:flex-shrink-0 md:sticky md:top-8 md:self-start">
        <WeaponAside weapon={weapon} actions={actions} />
      </aside>
      <main className="md:flex-1 min-w-0">
        <WeaponMainContent weapon={weapon} />
      </main>
    </div>
    <div className="mt-12 pt-8 border-t border-calamity-border">
      <WeaponFooterContent weapon={weapon} />
    </div>
  </div>
);
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponDetailContent.test.tsx`
Expected: PASS (5/5)

- [ ] **Step 5: Refatorar `WeaponDetailPage.tsx` para consumir os componentes extraídos**

Substituir o conteúdo inteiro de `src/frontend/src/components/pages/WeaponDetailPage.tsx` por:

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { submissionService } from '../../services/submissionService';
import { Weapon, WeaponFormData } from '../../types/weapon';
import { useAuth } from '../../hooks/useAuth';
import { WeaponForm } from './WeaponForm';
import { WeaponAside, WeaponMainContent, WeaponFooterContent } from './WeaponDetailContent';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { DetailLayout, Drawer, Button } from '../ui';

export const WeaponDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  const handleSuggestEdit = async (data: WeaponFormData) => {
    if (!weapon) return;
    await submissionService.create('WEAPON', { ...data, targetWeaponId: weapon.id });
    setIsSuggestOpen(false);
    setSuggestSuccess(true);
  };

  const handleUpdate = async (data: WeaponFormData) => {
    if (!weapon) return;
    const updated = await weaponService.updateWeapon(weapon.id, data);
    setWeapon(updated);
    setIsEditOpen(false);
  };

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

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID da arma não fornecido');
        const data = await weaponService.getWeaponById(id);
        setWeapon(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar arma';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes da arma..." />;
  }

  if (error || !weapon) {
    return <ErrorView message={error || 'Arma não encontrada'} onRetry={() => window.location.reload()} />;
  }

  const actions = (
    <>
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
    </>
  );

  return (
    <>
      <DetailLayout
        backTo="/weapons"
        backLabel="Voltar para Armas"
        aside={<WeaponAside weapon={weapon} actions={actions} />}
        footer={<WeaponFooterContent weapon={weapon} />}
      >
        <WeaponMainContent weapon={weapon} />
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
    </>
  );
};
```

Nota: esta task não mexe nos drawers de Editar/Sugerir Edição além de re-formatar o JSX — eles continuam usando `WeaponForm` puro. A troca para `WeaponFormWithPreview` acontece na Task 6.

- [ ] **Step 6: Rodar os testes existentes de `WeaponDetailPage` para confirmar que não há regressão**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponDetailPage.test.tsx`
Expected: PASS (todos os testes que já existiam antes desta task, sem alteração de asserts)

- [ ] **Step 7: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailContent.tsx src/frontend/src/components/pages/WeaponDetailContent.test.tsx src/frontend/src/components/pages/WeaponDetailPage.tsx
git commit -m "refactor(frontend): extrai WeaponDetailContent de WeaponDetailPage"
```

---

### Task 2: `buildPreviewWeapon` — função pura

**Files:**
- Create: `src/frontend/src/lib/weaponPreview.ts`
- Create: `src/frontend/src/lib/weaponPreview.test.ts`

**Interfaces:**
- Consumes: `Weapon`, `WeaponFormData` (`../types/weapon`).
- Produces: `buildPreviewWeapon(data: WeaponFormData, base?: Weapon | null): Weapon`. Consumida pelas Tasks 5 e 8.

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

Criar `src/frontend/src/lib/weaponPreview.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildPreviewWeapon } from './weaponPreview';
import { Weapon, WeaponFormData, WeaponTypeClass, Element } from '../types/weapon';

const formData: WeaponFormData = {
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

const base: Weapon = {
  ...formData,
  name: 'Terra Blade Antiga',
  id: '42',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  markdownContent: '# Lore',
  flavorText: 'Uma lâmina lendária forjada nos confins do tempo.',
};

describe('buildPreviewWeapon', () => {
  it('uses the base weapon id, createdAt, markdownContent and flavorText when provided', () => {
    const result = buildPreviewWeapon(formData, base);
    expect(result.id).toBe('42');
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.markdownContent).toBe('# Lore');
    expect(result.flavorText).toBe('Uma lâmina lendária forjada nos confins do tempo.');
  });

  it('always uses the form data values for editable fields, never the base', () => {
    const result = buildPreviewWeapon(formData, base);
    expect(result.name).toBe('Terra Blade');
    expect(result.baseDamage).toBe(55);
    expect(result.description).toBe('Uma lâmina lendária.');
  });

  it('falls back to a preview placeholder id and current timestamp when there is no base', () => {
    const result = buildPreviewWeapon(formData, null);
    expect(result.id).toBe('preview');
    expect(result.markdownContent).toBeUndefined();
    expect(result.flavorText).toBeUndefined();
    expect(Number.isNaN(new Date(result.createdAt).getTime())).toBe(false);
  });

  it('falls back to a preview placeholder id when base is omitted entirely', () => {
    const result = buildPreviewWeapon(formData);
    expect(result.id).toBe('preview');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/lib/weaponPreview.test.ts`
Expected: FAIL — `Failed to resolve import "./weaponPreview"`.

- [ ] **Step 3: Implementar `weaponPreview.ts`**

Criar `src/frontend/src/lib/weaponPreview.ts`:

```typescript
import { Weapon, WeaponFormData } from '../types/weapon';

/**
 * Monta um objeto Weapon "de mentira" para preview a partir dos valores de
 * formulário. Campos que só existem depois de persistir (id, createdAt,
 * markdownContent, flavorText) vêm de `base` quando disponível (edição de
 * arma existente); caso contrário usam placeholders neutros (criação nova).
 */
export function buildPreviewWeapon(data: WeaponFormData, base?: Weapon | null): Weapon {
  const now = new Date().toISOString();
  return {
    ...data,
    id: base?.id ?? 'preview',
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
    markdownContent: base?.markdownContent,
    flavorText: base?.flavorText,
  };
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/lib/weaponPreview.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/lib/weaponPreview.ts src/frontend/src/lib/weaponPreview.test.ts
git commit -m "feat(frontend): adiciona buildPreviewWeapon para montar preview a partir do formulario"
```

---

### Task 3: `WeaponForm` ganha `onDataChange` opcional

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponForm.tsx`
- Modify: `src/frontend/src/components/pages/WeaponForm.test.tsx`

**Interfaces:**
- Consumes: nada novo.
- Produces: `WeaponForm` ganha prop opcional `onDataChange?: (data: WeaponFormData) => void`, chamada a cada alteração de campo com o novo `WeaponFormData` completo. `EMPTY_FORM` passa a ser exportado (`export const EMPTY_FORM: WeaponFormData`). Consumidos pela Task 5.

- [ ] **Step 1: Escrever o teste (vai falhar — a prop ainda não existe)**

Em `src/frontend/src/components/pages/WeaponForm.test.tsx`, adicionar ao final do `describe('WeaponForm', ...)`, depois do teste `'calls onCancel when the cancel button is clicked'`:

```tsx
  it('calls onDataChange with the updated data whenever a field changes', () => {
    const onDataChange = vi.fn();
    render(
      <WeaponForm
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
        onDataChange={onDataChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade+' } });

    expect(onDataChange).toHaveBeenCalledWith({ ...validData, name: 'Terra Blade+' });
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponForm.test.tsx`
Expected: FAIL — `onDataChange` nunca é chamado (TypeError ou assertion failure, já que a prop não existe).

- [ ] **Step 3: Implementar a prop em `WeaponForm.tsx`**

Em `src/frontend/src/components/pages/WeaponForm.tsx`, alterar a interface de props (linhas 7-12):

```typescript
interface WeaponFormProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  onDataChange?: (data: WeaponFormData) => void;
}
```

Exportar `EMPTY_FORM` (linha 14, adicionar `export`):

```typescript
export const EMPTY_FORM: WeaponFormData = {
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
```

Atualizar a assinatura do componente e o `setField` (linhas 52-59):

```typescript
export const WeaponForm = ({ initialValues, onSubmit, onCancel, submitLabel, onDataChange }: WeaponFormProps) => {
  const [data, setData] = useState<WeaponFormData>(initialValues ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = <K extends keyof WeaponFormData>(field: K, value: WeaponFormData[K]) =>
    setData((prev) => {
      const next = { ...prev, [field]: value };
      onDataChange?.(next);
      return next;
    });
```

Nenhuma outra parte do arquivo muda.

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponForm.test.tsx`
Expected: PASS (6/6)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/WeaponForm.tsx src/frontend/src/components/pages/WeaponForm.test.tsx
git commit -m "feat(frontend): adiciona onDataChange ao WeaponForm e exporta EMPTY_FORM"
```

---

### Task 4: `Drawer` ganha prop `size`

**Files:**
- Modify: `src/frontend/src/components/ui/Drawer.tsx`
- Modify: `src/frontend/src/components/ui/Drawer.test.tsx`

**Interfaces:**
- Consumes: nada novo.
- Produces: `Drawer` ganha prop opcional `size?: 'default' | 'wide'` (default `'default'`). Quando `side="right"` e `size="wide"`, o painel usa `max-w-3xl` em vez de `max-w-sm`. `side="bottom"` ignora `size`. Consumida pelas Tasks 6 e 9.

- [ ] **Step 1: Escrever os testes (vão falhar — a prop ainda não existe)**

Em `src/frontend/src/components/ui/Drawer.test.tsx`, adicionar ao final do `describe('Drawer', ...)`:

```tsx
  it('uses a wider panel on the right side when size="wide"', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Menu" side="right" size="wide">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-3xl');
  });

  it('keeps the default narrow panel on the right side when size is omitted', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Menu" side="right">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `cd src/frontend && npx vitest run src/components/ui/Drawer.test.tsx`
Expected: FAIL no teste `size="wide"` (classe `max-w-3xl` ausente); o segundo teste já passa hoje mas roda junto.

- [ ] **Step 3: Implementar a prop em `Drawer.tsx`**

Substituir o conteúdo inteiro de `src/frontend/src/components/ui/Drawer.tsx` por:

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: 'right' | 'bottom';
  size?: 'default' | 'wide';
  children: ReactNode;
}

export const Drawer = ({ open, onOpenChange, title, side = 'right', size = 'default', children }: DrawerProps) => {
  const rightWidthClass = size === 'wide' ? 'max-w-3xl' : 'max-w-sm';

  const panelPosition =
    side === 'right'
      ? `inset-y-0 right-0 h-full w-full ${rightWidthClass} overflow-y-auto border-l-2`
      : 'inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg border-t-2';

  const panelAnimation = side === 'right' ? 'drawer-panel-right' : 'drawer-panel-bottom';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 drawer-overlay" />
        <Dialog.Content
          className={`fixed z-50 bg-calamity-bg-secondary border-calamity-border p-6 shadow-mystical-lg focus:outline-none ${panelPosition} ${panelAnimation}`}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold font-display text-calamity-accent-gold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="w-11 h-11 flex items-center justify-center text-calamity-text-secondary hover:text-calamity-primary"
            >
              ✕
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `cd src/frontend && npx vitest run src/components/ui/Drawer.test.tsx`
Expected: PASS (7/7)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/ui/Drawer.tsx src/frontend/src/components/ui/Drawer.test.tsx
git commit -m "feat(frontend): adiciona prop size ao Drawer para paineis mais largos"
```

---

### Task 5: `WeaponFormWithPreview` — wrapper com abas Formulário/Pré-visualização

**Files:**
- Create: `src/frontend/src/components/pages/WeaponFormWithPreview.tsx`
- Create: `src/frontend/src/components/pages/WeaponFormWithPreview.test.tsx`

**Interfaces:**
- Consumes: `WeaponForm`, `EMPTY_FORM` (`./WeaponForm`, Task 3); `WeaponDetailContent` (`./WeaponDetailContent`, Task 1); `buildPreviewWeapon` (`../../lib/weaponPreview`, Task 2); `Weapon`, `WeaponFormData` (`../../types/weapon`).
- Produces: `WeaponFormWithPreview({ initialValues?: WeaponFormData; onSubmit: (data: WeaponFormData) => Promise<void>; onCancel: () => void; submitLabel: string; previewBase?: Weapon | null })`. Consumida pela Task 6.

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

Criar `src/frontend/src/components/pages/WeaponFormWithPreview.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponFormWithPreview } from './WeaponFormWithPreview';
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

describe('WeaponFormWithPreview', () => {
  it('shows the form tab by default', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );
    expect(screen.getByLabelText('Nome')).toBeVisible();
  });

  it('switches to the preview tab and shows the current form values', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).not.toBeVisible();
  });

  it('reflects live edits in the preview without losing form state when switching tabs', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade+' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade+', level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Formulário' }));
    expect(screen.getByLabelText('Nome')).toHaveValue('Terra Blade+');
  });

  it('uses placeholder values in the preview when there is no previewBase (creation flow)', () => {
    render(<WeaponFormWithPreview onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Enviar Proposta" />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Nova Arma' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Nova Arma', level: 1 })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponFormWithPreview.test.tsx`
Expected: FAIL — `Failed to resolve import "./WeaponFormWithPreview"`.

- [ ] **Step 3: Implementar `WeaponFormWithPreview.tsx`**

Criar `src/frontend/src/components/pages/WeaponFormWithPreview.tsx`:

```tsx
import { useState } from 'react';
import { WeaponForm, EMPTY_FORM } from './WeaponForm';
import { WeaponDetailContent } from './WeaponDetailContent';
import { buildPreviewWeapon } from '../../lib/weaponPreview';
import { Weapon, WeaponFormData } from '../../types/weapon';

interface WeaponFormWithPreviewProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  /** Arma-base para preencher id/createdAt/markdownContent/flavorText no preview. undefined = criação nova. */
  previewBase?: Weapon | null;
}

type Tab = 'form' | 'preview';

const tabButtonClass = (active: boolean) =>
  `pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
    active
      ? 'text-calamity-accent-gold border-calamity-accent-gold'
      : 'text-calamity-text-secondary border-transparent'
  }`;

export const WeaponFormWithPreview = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  previewBase,
}: WeaponFormWithPreviewProps) => {
  const [tab, setTab] = useState<Tab>('form');
  const [formData, setFormData] = useState<WeaponFormData>(initialValues ?? EMPTY_FORM);

  return (
    <div>
      <div className="flex gap-4 border-b-2 border-calamity-border mb-6">
        <button type="button" onClick={() => setTab('form')} className={tabButtonClass(tab === 'form')}>
          Formulário
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={tabButtonClass(tab === 'preview')}
        >
          Pré-visualização
        </button>
      </div>

      <div style={{ display: tab === 'form' ? 'block' : 'none' }}>
        <WeaponForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel={submitLabel}
          onDataChange={setFormData}
        />
      </div>

      {tab === 'preview' && <WeaponDetailContent weapon={buildPreviewWeapon(formData, previewBase)} />}
    </div>
  );
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponFormWithPreview.test.tsx`
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/WeaponFormWithPreview.tsx src/frontend/src/components/pages/WeaponFormWithPreview.test.tsx
git commit -m "feat(frontend): adiciona WeaponFormWithPreview com abas Formulario/Pre-visualizacao"
```

---

### Task 6: Usar `WeaponFormWithPreview` nos 3 pontos de criação/edição

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`
- Modify: `src/frontend/src/components/pages/UserContributeView.tsx`
- Modify: `src/frontend/src/components/pages/UserContributeView.test.tsx`

**Interfaces:**
- Consumes: `WeaponFormWithPreview` (`./WeaponFormWithPreview`, Task 5); `Drawer` com prop `size` (Task 4).
- Produces: nada novo para outras tasks — esta é a task de integração final dos formulários.

- [ ] **Step 1: Escrever os testes novos (vão falhar — comportamento ainda não existe)**

Em `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`, adicionar ao final do `describe('WeaponDetailPage', ...)`:

```tsx
  it('shows a wide preview-capable drawer when editing, with the current weapon prefilled in the preview tab', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Arma' });
    expect(dialog).toHaveClass('max-w-3xl');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Pré-visualização' }));
    expect(within(dialog).getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
  });
```

Em `src/frontend/src/components/pages/UserContributeView.test.tsx`, adicionar ao final do `describe('UserContributeView', ...)`:

```tsx
  it('shows a live preview of the new weapon while filling the "Nova Proposta" form', () => {
    render(<UserContributeView />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponDetailPage.test.tsx src/components/pages/UserContributeView.test.tsx`
Expected: FAIL nos dois testes novos (drawer não é `wide`, botão "Pré-visualização" não existe ainda).

- [ ] **Step 3: Trocar `WeaponForm` por `WeaponFormWithPreview` em `WeaponDetailPage.tsx`**

Em `src/frontend/src/components/pages/WeaponDetailPage.tsx`, trocar o import (linha com `import { WeaponForm } from './WeaponForm';`) por:

```typescript
import { WeaponFormWithPreview } from './WeaponFormWithPreview';
```

Trocar o drawer "Editar Arma" por:

```tsx
      {user?.role === 'ADMIN' && (
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} title="Editar Arma" side="right" size="wide">
          <WeaponFormWithPreview
            initialValues={weapon}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            submitLabel="Salvar Alterações"
            previewBase={weapon}
          />
        </Drawer>
      )}
```

Trocar o drawer "Sugerir Edição" por:

```tsx
      {user && user.role !== 'ADMIN' && (
        <Drawer open={isSuggestOpen} onOpenChange={setIsSuggestOpen} title="Sugerir Edição" side="right" size="wide">
          <WeaponFormWithPreview
            initialValues={weapon}
            onSubmit={handleSuggestEdit}
            onCancel={() => setIsSuggestOpen(false)}
            submitLabel="Enviar Proposta"
            previewBase={weapon}
          />
        </Drawer>
      )}
```

O drawer "Deletar Arma" não muda.

- [ ] **Step 4: Trocar `WeaponForm` por `WeaponFormWithPreview` em `UserContributeView.tsx`**

Em `src/frontend/src/components/pages/UserContributeView.tsx`, trocar o import (linha 2, `import { WeaponForm } from './WeaponForm';`) por:

```typescript
import { WeaponFormWithPreview } from './WeaponFormWithPreview';
```

Trocar o uso dentro da aba "Nova Proposta" (linhas 89-93):

```tsx
          <WeaponFormWithPreview
            onSubmit={handleCreate}
            onCancel={() => setCreateSuccess(false)}
            submitLabel="Enviar Proposta"
          />
```

(Sem `previewBase` — é criação nova, `buildPreviewWeapon` usa os placeholders.)

- [ ] **Step 5: Adicionar `within` ao import de testing-library em `WeaponDetailPage.test.tsx`**

`WeaponDetailPage.test.tsx` já importa `within` (linha 2: `import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';`) — não precisa de alteração de import.

- [ ] **Step 6: Rodar todos os testes das duas páginas para confirmar que passam**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponDetailPage.test.tsx src/components/pages/UserContributeView.test.tsx`
Expected: PASS em ambos os arquivos (testes antigos continuam passando sem alteração de asserts + os 2 novos).

- [ ] **Step 7: Rodar a suíte inteira do frontend para garantir que nada mais quebrou**

Run: `cd src/frontend && npx vitest run`
Expected: PASS em todos os arquivos.

- [ ] **Step 8: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx src/frontend/src/components/pages/UserContributeView.tsx src/frontend/src/components/pages/UserContributeView.test.tsx
git commit -m "feat(frontend): liga WeaponFormWithPreview nos drawers de edicao e na Nova Proposta"
```

---

### Task 7: Extrair `useSubmissionTargetWeapon` de `SubmissionDiff`

**Files:**
- Create: `src/frontend/src/hooks/useSubmissionTargetWeapon.ts`
- Create: `src/frontend/src/hooks/useSubmissionTargetWeapon.test.ts`
- Modify: `src/frontend/src/hooks/index.ts`
- Modify: `src/frontend/src/components/pages/SubmissionDiff.tsx`

**Interfaces:**
- Consumes: `weaponService.getWeaponById` (`../services/weaponService`); `Weapon` (`../types/weapon`); `WeaponSubmission` (`../types/weaponSubmission`).
- Produces: `useSubmissionTargetWeapon(submission: WeaponSubmission): { weapon: Weapon | null; loading: boolean; notFound: boolean }`. Consumido por `SubmissionDiff` (refatorado nesta task) e pela Task 8.

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

Criar `src/frontend/src/hooks/useSubmissionTargetWeapon.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubmissionTargetWeapon } from './useSubmissionTargetWeapon';
import { weaponService } from '../services/weaponService';
import { WeaponSubmission } from '../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../types/weapon';

vi.mock('../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const baseSubmission: WeaponSubmission = {
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
  abilities: '',
  description: 'Arma de ferro',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('useSubmissionTargetWeapon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch and starts with loading=false for CREATE submissions', () => {
    const { result } = renderHook(() =>
      useSubmissionTargetWeapon({ ...baseSubmission, type: 'CREATE', targetWeaponId: null })
    );
    expect(result.current.loading).toBe(false);
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('does not fetch and starts with loading=false for UPDATE without a targetWeaponId', () => {
    const { result } = renderHook(() =>
      useSubmissionTargetWeapon({ ...baseSubmission, targetWeaponId: null })
    );
    expect(result.current.loading).toBe(false);
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('fetches the target weapon for UPDATE and exposes it once loaded', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue({
      ...baseSubmission,
      id: '3',
    } as never);

    const { result } = renderHook(() => useSubmissionTargetWeapon(baseSubmission));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weapon).not.toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(weaponService.getWeaponById).toHaveBeenCalledWith('3');
  });

  it('sets notFound when the fetch fails', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));

    const { result } = renderHook(() => useSubmissionTargetWeapon(baseSubmission));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.weapon).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/hooks/useSubmissionTargetWeapon.test.ts`
Expected: FAIL — `Failed to resolve import "./useSubmissionTargetWeapon"`.

- [ ] **Step 3: Implementar o hook**

Criar `src/frontend/src/hooks/useSubmissionTargetWeapon.ts`:

```typescript
import { useState, useEffect } from 'react';
import { weaponService } from '../services/weaponService';
import { Weapon } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

/**
 * Busca a arma-alvo de uma submissão UPDATE (sob demanda, uma vez por
 * mudança de submission). CREATE ou UPDATE sem targetWeaponId não busca nada.
 */
export function useSubmissionTargetWeapon(submission: WeaponSubmission) {
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(submission.type === 'UPDATE' && !!submission.targetWeaponId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (submission.type !== 'UPDATE' || !submission.targetWeaponId) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    weaponService
      .getWeaponById(submission.targetWeaponId)
      .then((data) => {
        if (!cancelled) setWeapon(data);
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

  return { weapon, loading, notFound };
}
```

Adicionar o export ao barrel `src/frontend/src/hooks/index.ts`:

```typescript
export * from './useSubmissionTargetWeapon';
```

- [ ] **Step 4: Rodar o teste do hook para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/hooks/useSubmissionTargetWeapon.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: Refatorar `SubmissionDiff.tsx` para usar o hook**

Substituir o conteúdo inteiro de `src/frontend/src/components/pages/SubmissionDiff.tsx` por:

```tsx
import { useSubmissionTargetWeapon } from '../../hooks/useSubmissionTargetWeapon';
import { Loading } from '../ui';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { computeWeaponDiff } from '../../lib/weaponDiff';

interface SubmissionDiffProps {
  submission: WeaponSubmission;
}

export const SubmissionDiff = ({ submission }: SubmissionDiffProps) => {
  const { weapon: currentWeapon, loading, notFound } = useSubmissionTargetWeapon(submission);

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

- [ ] **Step 6: Rodar os testes existentes de `SubmissionDiff` para confirmar que não há regressão**

Run: `cd src/frontend && npx vitest run src/components/pages/SubmissionDiff.test.tsx`
Expected: PASS (5/5, sem alteração de asserts — comportamento observável idêntico ao de antes da extração).

- [ ] **Step 7: Commit**

```bash
git add src/frontend/src/hooks/useSubmissionTargetWeapon.ts src/frontend/src/hooks/useSubmissionTargetWeapon.test.ts src/frontend/src/hooks/index.ts src/frontend/src/components/pages/SubmissionDiff.tsx
git commit -m "refactor(frontend): extrai useSubmissionTargetWeapon de SubmissionDiff"
```

---

### Task 8: `SubmissionPreview` — preview completo de uma submissão

**Files:**
- Create: `src/frontend/src/components/pages/SubmissionPreview.tsx`
- Create: `src/frontend/src/components/pages/SubmissionPreview.test.tsx`

**Interfaces:**
- Consumes: `useSubmissionTargetWeapon` (`../../hooks/useSubmissionTargetWeapon`, Task 7); `WeaponDetailContent` (`./WeaponDetailContent`, Task 1); `buildPreviewWeapon` (`../../lib/weaponPreview`, Task 2); `Loading` (`../ui`); `WeaponSubmission` (`../../types/weaponSubmission`).
- Produces: `SubmissionPreview({ submission: WeaponSubmission })`. Consumido pela Task 9.

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

Criar `src/frontend/src/components/pages/SubmissionPreview.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionPreview } from './SubmissionPreview';
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
  flavorText: 'Forjada nas profundezas.',
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

describe('SubmissionPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the proposed weapon immediately for CREATE submissions', async () => {
    render(<SubmissionPreview submission={createSubmission} />);
    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(weaponService.getWeaponById).not.toHaveBeenCalled();
  });

  it('merges the target weapon metadata (flavor text) for UPDATE submissions', async () => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(currentWeapon);
    render(<SubmissionPreview submission={updateSubmission} />);

    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Forjada nas profundezas\./)).toBeInTheDocument();
  });

  it('falls back to proposed-only values when the target weapon is not found', async () => {
    vi.mocked(weaponService.getWeaponById).mockRejectedValue(new Error('404'));
    render(<SubmissionPreview submission={updateSubmission} />);

    expect(
      await screen.findByRole('heading', { name: 'Iron Shortsword Reforjada', level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Forjada nas profundezas\./)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/SubmissionPreview.test.tsx`
Expected: FAIL — `Failed to resolve import "./SubmissionPreview"`.

- [ ] **Step 3: Implementar `SubmissionPreview.tsx`**

Criar `src/frontend/src/components/pages/SubmissionPreview.tsx`:

```tsx
import { useSubmissionTargetWeapon } from '../../hooks/useSubmissionTargetWeapon';
import { WeaponDetailContent } from './WeaponDetailContent';
import { buildPreviewWeapon } from '../../lib/weaponPreview';
import { Loading } from '../ui';
import { WeaponSubmission } from '../../types/weaponSubmission';

interface SubmissionPreviewProps {
  submission: WeaponSubmission;
}

export const SubmissionPreview = ({ submission }: SubmissionPreviewProps) => {
  const { weapon, loading, notFound } = useSubmissionTargetWeapon(submission);

  if (loading) {
    return <Loading message="Carregando preview..." fullHeight={false} />;
  }

  const previewWeapon = buildPreviewWeapon(
    submission,
    submission.type === 'UPDATE' && !notFound ? weapon : null
  );

  return <WeaponDetailContent weapon={previewWeapon} />;
};
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/SubmissionPreview.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/SubmissionPreview.tsx src/frontend/src/components/pages/SubmissionPreview.test.tsx
git commit -m "feat(frontend): adiciona SubmissionPreview com a pagina completa da proposta"
```

---

### Task 9: Botão "Ver preview completo" na fila do admin

**Files:**
- Modify: `src/frontend/src/components/pages/AdminContributeView.tsx`
- Modify: `src/frontend/src/components/pages/AdminContributeView.test.tsx`

**Interfaces:**
- Consumes: `SubmissionPreview` (`./SubmissionPreview`, Task 8); `Drawer` com prop `size` (Task 4).
- Produces: nada novo — última task do plano.

- [ ] **Step 1: Escrever o teste (vai falhar — o botão ainda não existe)**

Em `src/frontend/src/components/pages/AdminContributeView.test.tsx`, trocar a linha de import de testing-library (linha 2) de:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
```

para:

```tsx
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
```

E adicionar ao final do `describe('AdminContributeView', ...)`:

```tsx
  it('opens and closes the full preview drawer for a submission', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Ver preview completo' }));

    const dialog = await screen.findByRole('dialog', { name: 'Preview: Terra Blade' });
    expect(within(dialog).getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Preview: Terra Blade' })).not.toBeInTheDocument()
    );
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/AdminContributeView.test.tsx`
Expected: FAIL — botão "Ver preview completo" não existe.

- [ ] **Step 3: Adicionar o botão e o Drawer de preview em `AdminContributeView.tsx`**

Adicionar o import de `SubmissionPreview` junto aos demais imports (após `import { SubmissionDiff } from './SubmissionDiff';`):

```typescript
import { SubmissionPreview } from './SubmissionPreview';
```

Adicionar o novo estado junto aos outros `useState` do componente (após `const [expandedId, setExpandedId] = useState<string | null>(null);`):

```typescript
  const [previewOpenId, setPreviewOpenId] = useState<string | null>(null);
```

Adicionar, logo antes do `return (`, a resolução da submissão em preview:

```typescript
  const previewSubmission = submissions.find((s) => s.id === previewOpenId) ?? null;
```

Dentro do bloco expandido (`{expandedId === submission.id && (...)}`), adicionar o botão logo depois de `<SubmissionDiff submission={submission} />` e antes do bloco `{submission.status === 'PENDING' && (...)}`:

```tsx
                  <SubmissionDiff submission={submission} />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpenId(submission.id)}
                  >
                    Ver preview completo
                  </Button>

```

Por fim, adicionar o `Drawer` de preview logo antes do `</div>` de fechamento do componente (depois do bloco `{!loading && !error && submissions.length > 0 && (<ul>...</ul>)}`):

```tsx
      {previewSubmission && (
        <Drawer
          open
          onOpenChange={(open) => !open && setPreviewOpenId(null)}
          title={`Preview: ${previewSubmission.name}`}
          side="right"
          size="wide"
        >
          <SubmissionPreview submission={previewSubmission} />
        </Drawer>
      )}
    </div>
  );
};
```

Adicionar `Drawer` ao import de `'../ui'` (linha `import { Loading, Error as ErrorView, EmptyState } from '../ui';` vira):

```typescript
import { Loading, Error as ErrorView, EmptyState, Drawer } from '../ui';
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/AdminContributeView.test.tsx`
Expected: PASS (5/5)

- [ ] **Step 5: Rodar a suíte inteira do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS em todos os arquivos.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/AdminContributeView.test.tsx
git commit -m "feat(frontend): adiciona botao Ver preview completo na fila de revisao do admin"
```

---

### Task 10: Usar `WeaponFormWithPreview` no drawer "Nova Arma" de `WeaponsPage`

**Contexto:** adicionada após a revisão final de branch inteira das Tasks 1-9. O pedido original do usuário incluía o admin ver preview "criando" — mas o drawer "Nova Arma" (criação direta de arma pelo admin, fora do fluxo de submissões) vive em `WeaponsPage.tsx`, uma página que não foi mapeada durante o brainstorming original (só `WeaponDetailPage`, `UserContributeView` e `AdminContributeView` foram cobertas). Esta task fecha esse gap de escopo, reaproveitando 100% do que já foi construído nas Tasks 1-6 — nenhum componente novo.

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponsPage.tsx`
- Modify: `src/frontend/src/components/pages/WeaponsPage.test.tsx`

**Interfaces:**
- Consumes: `WeaponFormWithPreview` (`./WeaponFormWithPreview`, Task 5); `Drawer` com prop `size` (Task 4).
- Produces: nada novo — última task do plano.

- [ ] **Step 1: Escrever o teste novo (vai falhar — comportamento ainda não existe)**

Em `src/frontend/src/components/pages/WeaponsPage.test.tsx`, adicionar ao final do `describe('WeaponsPage', ...)`, depois do teste `'shows the "Nova Arma" button and opens the create drawer for admins'`:

```tsx
  it('shows a wide preview-capable drawer when creating a new weapon', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Nova Arma' }));
    const dialog = screen.getByRole('dialog', { name: 'Nova Arma' });
    expect(dialog).toHaveClass('max-w-3xl');

    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Nova Espada' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pré-visualização' }));

    expect(within(dialog).getByRole('heading', { name: 'Nova Espada', level: 1 })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponsPage.test.tsx`
Expected: FAIL — drawer não é `wide`, botão "Pré-visualização" não existe ainda.

- [ ] **Step 3: Trocar `WeaponForm` por `WeaponFormWithPreview` em `WeaponsPage.tsx`**

Trocar o import (linha 10, `import { WeaponForm } from "./WeaponForm";`) por:

```typescript
import { WeaponFormWithPreview } from "./WeaponFormWithPreview";
```

Trocar o drawer "Nova Arma" (linhas 190-196) por:

```tsx
        <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Nova Arma" side="right" size="wide">
          <WeaponFormWithPreview
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            submitLabel="Criar Arma"
          />
        </Drawer>
```

(Sem `previewBase` — é criação nova, `buildPreviewWeapon` usa os placeholders, igual à Task 6 em `UserContributeView`.)

O drawer "Filtros" (linhas 177-188) não muda.

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `cd src/frontend && npx vitest run src/components/pages/WeaponsPage.test.tsx`
Expected: PASS (todos os testes existentes + o novo, sem alteração de asserts nos antigos).

- [ ] **Step 5: Rodar a suíte inteira do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS em todos os arquivos.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/WeaponsPage.tsx src/frontend/src/components/pages/WeaponsPage.test.tsx
git commit -m "feat(frontend): liga WeaponFormWithPreview no drawer Nova Arma de WeaponsPage"
```
