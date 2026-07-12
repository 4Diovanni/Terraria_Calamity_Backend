---
tags: [spec, frontend, submissions]
aliases: [Preview ao Vivo de Submissões — Design]
up: "[[INDEX]]"
related:
  - "[[WeaponsPage]]"
  - "[[2026-07-11-preview-submissoes]]"
status: ativo
---

# Preview ao Vivo de Submissões — Design

> Ver também: plano: [[2026-07-11-preview-submissoes]] · [[WeaponsPage]]

**Fase:** Fase 2, parte 3 (última) do redesign de contribuições.
**Depende de:** Fase 1 (PR #62), Fase 2 parte 1 — diff estilo GitHub (PR #63), Fase 2 parte 2 — dashboard admin como aba (PR #64). Todas mergeadas.

## Contexto

O pedido original do usuário: "para o admin ele também deve ver como vai ficar a página dele, criando/editando". Hoje, ao criar ou editar uma arma (ou sugerir uma edição), o formulário (`WeaponForm`) não mostra nenhuma prévia de como a página de detalhe (`WeaponDetailPage`) vai ficar com os valores propostos — só é possível ver o resultado depois de salvar/aprovar.

## Escopo

Preview ao vivo aparece em três superfícies:

1. **Drawer "Editar" do admin** (`WeaponDetailPage`, edição direta de uma arma existente).
2. **Fila de revisão de submissões do admin** (`AdminContributeView`) — botão "Ver preview completo" ao lado do diff já existente.
3. **Formulário de proposta do usuário comum** — aba "Nova Proposta" (`UserContributeView`) e drawer "Sugerir Edição" (`WeaponDetailPage`).

Fora de escopo: preview de outras entidades além de Arma (armadura, inimigo, etc. — ainda não existem no fluxo de submissões); preview via URL/rota própria; qualquer alteração no backend (tudo é 100% frontend, assim como o diff da Fase 2 parte 1).

## Arquitetura

### 1. `WeaponDetailContent` — componente apresentacional extraído

**Novo arquivo:** `src/frontend/src/components/pages/WeaponDetailContent.tsx`

Extrai o miolo visual de `WeaponDetailPage` (hoje inline no JSX): `EntityHero` + badges (elemento/raridade/classe) + bloco de `StatBar`s (Dano, Crítico, Velocidade, Knockback, Qualidade) + `MarkdownContent` + habilidades + `DetailFooter`. Reaproveita o mesmo layout de duas colunas (aside 1/3 + main 2/3 no desktop, empilhado no mobile) que `DetailLayout` usa hoje, mas **sem** o wrapper de página (`min-h-screen`, link de "voltar") — porque vai rodar dentro de um `Drawer`, não como página cheia.

```typescript
interface WeaponDetailContentProps {
  weapon: Weapon;
}

export const WeaponDetailContent = ({ weapon }: WeaponDetailContentProps) => { /* ... */ };
```

`WeaponDetailPage` passa a montar `<DetailLayout aside={...} footer={...}>` chamando `WeaponDetailContent` internamente para o aside/main/footer, mantendo os botões de ação (Editar/Deletar/Sugerir Edição) como estão hoje, fora do componente extraído — eles pertencem à página, não ao preview.

### 2. `buildPreviewWeapon` — função pura

**Novo arquivo:** `src/frontend/src/lib/weaponPreview.ts`

```typescript
export function buildPreviewWeapon(data: WeaponFormData, base?: Weapon | null): Weapon {
  const now = new Date().toISOString();
  return {
    id: base?.id ?? 'preview',
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
    markdownContent: base?.markdownContent,
    flavorText: base?.flavorText,
    ...data,
  };
}
```

Regras:
- Se `base` existe (edição de arma existente, ou sugestão de edição com arma-alvo encontrada): `id`, `createdAt`, `markdownContent`, `flavorText` vêm dele; todos os campos de `WeaponFormData` vêm de `data` (os valores atuais do formulário/submissão, não os da `base`).
- Se `base` é `null`/`undefined` (criação nova, ou submissão `UPDATE` cuja arma-alvo não foi encontrada): `id` vira o placeholder `'preview'`, `createdAt`/`updatedAt` viram o instante atual, `markdownContent`/`flavorText` ficam `undefined` — caem no fallback que `WeaponDetailContent` já herda de `WeaponDetailPage` (`weapon.markdownContent ?? weapon.description`) e no comportamento já existente de `DetailFooter` (`quote` só renderiza se presente).

Testável isoladamente com `WeaponFormData` + `Weapon | null | undefined` fixos — mesmo padrão de `computeWeaponDiff`.

### 3. `WeaponForm` ganha `onDataChange` opcional

**Modifica:** `src/frontend/src/components/pages/WeaponForm.tsx`

```typescript
interface WeaponFormProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  onDataChange?: (data: WeaponFormData) => void;
}
```

`setField` passa a notificar o pai:

```typescript
const setField = <K extends keyof WeaponFormData>(field: K, value: WeaponFormData[K]) =>
  setData((prev) => {
    const next = { ...prev, [field]: value };
    onDataChange?.(next);
    return next;
  });
```

Sem outra mudança de comportamento — `WeaponForm` continua dono do seu próprio estado; `onDataChange` é só um espelho para quem quiser observar.

### 4. `WeaponFormWithPreview` — wrapper com abas

**Novo arquivo:** `src/frontend/src/components/pages/WeaponFormWithPreview.tsx`

```typescript
interface WeaponFormWithPreviewProps {
  initialValues?: WeaponFormData;
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  previewBase?: Weapon | null;
}
```

- Estado interno: `tab: 'form' | 'preview'` (default `'form'`) e `formData: WeaponFormData` (inicializado com `initialValues` ou os defaults vazios que `WeaponForm` já usa — duplicar `EMPTY_FORM` aqui é aceitável, é uma constante pequena já exportável de `WeaponForm.tsx` se preferir reaproveitar).
- Duas abas no topo, mesmo padrão visual das abas já usadas em `ProfilePage`/`UserContributeView` (`border-b-2`, cor `calamity-accent-gold` quando ativa).
- `WeaponForm` fica **sempre montado** (nunca desmonta ao trocar de aba — perderia o estado interno), escondido via `className={tab === 'form' ? '' : 'hidden'}` quando a aba não é "form"; recebe `onDataChange={setFormData}`.
- Aba "Pré-visualização": renderiza `<WeaponDetailContent weapon={buildPreviewWeapon(formData, previewBase)} />` só quando `tab === 'preview'` (não precisa computar quando escondida).
- `previewBase` é passada pelo chamador: a mesma arma que já é `initialValues` nos casos de edição (`WeaponDetailPage`), ou `undefined` na criação (`UserContributeView` "Nova Proposta").

**Substitui `WeaponForm` direto nestes 3 pontos:**
- `src/frontend/src/components/pages/WeaponDetailPage.tsx` — drawer "Editar" (`previewBase={weapon}`) e drawer "Sugerir Edição" (`previewBase={weapon}`).
- `src/frontend/src/components/pages/UserContributeView.tsx` — aba "Nova Proposta" (`previewBase={undefined}`).

### 5. `Drawer` ganha prop `size`

**Modifica:** `src/frontend/src/components/ui/Drawer.tsx`

```typescript
interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: 'right' | 'bottom';
  size?: 'default' | 'wide';
  children: ReactNode;
}
```

`panelPosition` para `side === 'right'` passa a variar por `size`:
- `'default'` (atual, sem mudança de comportamento): `max-w-sm`.
- `'wide'`: `max-w-3xl`.

`side === 'bottom'` ignora `size` (mantém `max-h-[85vh]`, já é full-width). Os 3 drawers que ganham preview (Editar, Sugerir Edição, e o novo de preview completo do admin) usam `size="wide"`; o drawer de confirmação de exclusão em `WeaponDetailPage` continua sem passar `size` (default).

### 6. Preview na fila do admin: hook compartilhado + `SubmissionPreview`

**Novo arquivo:** `src/frontend/src/hooks/useSubmissionTargetWeapon.ts`

Extrai o efeito de busca que hoje vive dentro de `SubmissionDiff`:

```typescript
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

**Modifica:** `src/frontend/src/components/pages/SubmissionDiff.tsx` — passa a chamar `useSubmissionTargetWeapon(submission)` em vez de duplicar o `useEffect`. Comportamento observável idêntico (mesmos estados, mesma condição de loading inicial que já corrige o bug do PR #63); os testes existentes de `SubmissionDiff` continuam válidos sem alteração.

**Novo arquivo:** `src/frontend/src/components/pages/SubmissionPreview.tsx`

```typescript
interface SubmissionPreviewProps {
  submission: WeaponSubmission;
}

export const SubmissionPreview = ({ submission }: SubmissionPreviewProps) => {
  const { weapon, loading, notFound } = useSubmissionTargetWeapon(submission);

  if (loading) return <Loading message="Carregando preview..." fullHeight={false} />;

  const previewWeapon = buildPreviewWeapon(
    submission,
    submission.type === 'UPDATE' && !notFound ? weapon : null
  );

  return <WeaponDetailContent weapon={previewWeapon} />;
};
```

**Modifica:** `src/frontend/src/components/pages/AdminContributeView.tsx` — dentro do bloco expandido de cada submissão (onde `SubmissionDiff` já aparece), adiciona um botão "Ver preview completo" que abre `previewOpenId` (novo estado local, `string | null`, mesmo padrão de `expandedId`/`rejectingId`) e renderiza:

```tsx
<Drawer
  open={previewOpenId === submission.id}
  onOpenChange={(open) => setPreviewOpenId(open ? submission.id : null)}
  title={`Preview: ${submission.name}`}
  side="right"
  size="wide"
>
  <SubmissionPreview submission={submission} />
</Drawer>
```

## Fluxo de dados — resumo

```
WeaponForm (estado interno) --onDataChange--> WeaponFormWithPreview (formData)
                                                       |
                                    tab === 'preview'  v
                              buildPreviewWeapon(formData, previewBase)
                                                       |
                                                       v
                                          WeaponDetailContent (render puro)

WeaponSubmission --useSubmissionTargetWeapon--> { weapon, loading, notFound }
                                                       |
                              buildPreviewWeapon(submission, weapon | null)
                                                       |
                                                       v
                                          WeaponDetailContent (render puro)
```

## Testes

Todos os arquivos novos/modificados seguem o padrão Vitest + Testing Library já usado no projeto:

- `weaponPreview.test.ts`: casos puros — com `base` presente (usa id/createdAt/markdownContent/flavorText da base), sem `base` (usa placeholders), `base` com `markdownContent`/`flavorText` ausentes (undefined propaga).
- `WeaponForm.test.tsx`: novo caso cobrindo `onDataChange` disparado a cada alteração de campo (não deve quebrar os testes existentes, que não passam essa prop).
- `WeaponFormWithPreview.test.tsx` (novo): alternância de aba preserva estado do formulário; aba preview renderiza os valores atuais; `previewBase` presente vs ausente.
- `Drawer.test.tsx` (se existir; senão criar): `size="wide"` aplica a classe larga; ausência de `size` mantém o comportamento atual.
- `useSubmissionTargetWeapon.test.ts` (novo, extraído dos casos que hoje estão em `SubmissionDiff.test.tsx`): loading inicial correto por tipo/`targetWeaponId`, sucesso, falha (`notFound`).
- `SubmissionDiff.test.tsx`: já existente — deve continuar passando sem alteração de asserts após a extração do hook (é um refactor comportamentalmente neutro).
- `SubmissionPreview.test.tsx` (novo): `CREATE` renderiza preview com placeholders; `UPDATE` com arma encontrada mescla `base`; `UPDATE` com arma não encontrada cai no fallback sem `base`.
- `AdminContributeView.test.tsx`: novo caso cobrindo abrir/fechar o Drawer de preview a partir do botão "Ver preview completo".
- `WeaponDetailPage.test.tsx`: ajustar para o novo `WeaponFormWithPreview` nos drawers (ou mocká-lo, seguindo o padrão já usado nos testes existentes desse arquivo).
- `UserContributeView.test.tsx`: idem para a aba "Nova Proposta".

## Débito técnico conhecido (não bloqueante)

- `WeaponDetailContent` reaproveita a mesma classe de layout responsivo de `DetailLayout` (`md:flex-row`), que é baseada no viewport do navegador, não na largura do `Drawer`. Em telas desktop, o preview dentro do drawer `wide` (`max-w-3xl`) vai exibir a divisão aside/main mesmo com menos espaço disponível que a página real — aceitável, mas pode ficar mais apertado que a página cheia. Não é um bloqueador; se ficar ruim visualmente na validação manual, ajusta-se o breakpoint usado dentro de `WeaponDetailContent` numa iteração futura.
- `id: 'preview'` como placeholder em `buildPreviewWeapon` nunca deve vazar para nenhuma chamada de API — `WeaponDetailContent` é puramente apresentacional e não faz fetch nem navegação, então isso é seguro, mas vale registrar como invariante caso o componente ganhe alguma ação futura.
