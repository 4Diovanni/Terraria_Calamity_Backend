---
tags: [spec, frontend, submissions]
aliases: [Diff Estilo GitHub nas Submissões — Design]
up: "[[INDEX]]"
related:
  - "[[Contributions]]"
  - "[[2026-07-09-diff-submissoes]]"
status: ativo
---

# Diff Estilo GitHub nas Submissões (Fase 2, parte 1) — Design Spec

> Ver também: plano: [[2026-07-09-diff-submissoes]] · [[Contributions]]

**Data:** 2026-07-09
**Escopo:** Frontend apenas. Primeira parte da Fase 2 do redesign de contribuições (a fundação —
generalização do backend + abas no Perfil — foi mergeada no PR #62). Adiciona visualização de diff
estilo GitHub (verde para adicionado/novo, vermelho riscado para o valor antigo) nas submissões de
arma, tanto na fila do admin quanto na lista "Minhas Propostas" do próprio usuário.

As outras duas partes da Fase 2 — preview ao vivo da página e redesign do dashboard admin como aba
própria — ficam para specs separadas, fora do escopo deste documento.

---

## 1. Objetivo

- Quando uma submissão é do tipo `UPDATE`, mostrar campo a campo o que mudou entre a arma atual e os
  valores propostos: valor antigo riscado em vermelho, valor novo em verde, campos inalterados em cor
  normal (sem destaque). Todos os campos da arma aparecem, não só os que mudaram — dá contexto
  completo da proposta de uma vez.
- Quando a submissão é do tipo `CREATE` (arma nova, sem "antes" para comparar), todos os campos
  aparecem destacados em verde, como "adicionado" — mesma metáfora do GitHub para um arquivo novo.
- O diff aparece nos dois lugares onde uma submissão já é exibida hoje: na fila do admin
  (`AdminContributeView`) e na lista "Minhas Propostas" do usuário que criou (`UserContributeView`).
- Nenhuma mudança de backend. O diff é calculado inteiramente no frontend, a partir de dados que já
  existem: a submissão (que já tem os valores propostos) e a arma atual (buscada sob demanda via
  `weaponService.getWeaponById`).

---

## 2. Fora de escopo (decisões explícitas)

| Tema | Decisão |
|---|---|
| Preview ao vivo da página com as mudanças aplicadas | Fase 2, spec separada. Fora deste documento. |
| Redesign do dashboard admin / aba "Dashboard" separada | Fase 2, spec separada. Fora deste documento. |
| Cálculo do diff no backend | Não. Calculado no frontend — evita mexer no backend de novo tão cedo após o PR #62, e os dados necessários (arma atual + payload proposto) já estão disponíveis via endpoints existentes. |
| Diff textual linha-a-linha (tipo `git diff` de texto corrido) | Não. Diff **estruturado por campo** (nome, classe, elemento, dano, etc.) — cada campo é uma linha própria, não uma comparação de string bruta. |
| Esconder campos inalterados | Não. Todos os campos aparecem; só os alterados ganham destaque de cor. |
| Layout duas colunas (antes/depois lado a lado) | Não. Layout de linha única por campo (label + valor antigo riscado + seta + valor novo), mais compacto e reaproveita melhor o espaço já usado nas listas existentes. |
| Tradução de raridade numérica para tier (Common/Rare/etc.) no diff | Não. Mostra o número bruto de raridade, igual ao que `AdminContributeView` já exibe hoje — tradução de tier é preocupação de outra parte da UI, não desta feature. |
| Suporte a outras entidades além de Weapon | Não. Só existe `WEAPON` como `entityType` hoje (fundação da Fase 1); o diff é escrito especificamente para o shape de `WeaponSubmission`. |

---

## 3. Arquitetura e componentes

### 3.1 `computeWeaponDiff` — função pura

Novo arquivo `src/frontend/src/lib/weaponDiff.ts`:

```ts
export interface DiffField {
  label: string;
  oldValue: string | null;
  newValue: string;
  changed: boolean;
}

export function computeWeaponDiff(current: Weapon | null, proposed: WeaponSubmission): DiffField[]
```

Compara os 13 campos de `WeaponFormData` (nome, classe, elemento, dano base, chance de crítico,
velocidade, alcance, raridade, preço, qualidade, habilidades, descrição, imagem) entre `current` e
`proposed`. Cada campo vira um `DiffField`:

- Se `current` for `null` (submissão `CREATE`, sem "antes"): todo campo tem `changed: true` e
  `oldValue: null` — o componente de apresentação (3.2) sabe renderizar isso como "tudo em verde", sem
  precisar de um segundo modo de renderização separado.
- Se `current` existir (submissão `UPDATE`): `changed` é `true` quando o valor formatado difere entre
  `current` e `proposed`, `false` caso contrário.

Labels e formatação por campo (reaproveitando os rótulos e unidades já usados em `WeaponDetailPage`/
`AdminContributeView` hoje, para manter a terminologia consistente no app):

| Campo | Label | Formatação |
|---|---|---|
| `name` | Nome | texto puro |
| `weaponClass` | Classe | texto puro (valor bruto do enum, ex. `MELEE`) |
| `element` | Elemento | texto puro (valor bruto do enum, ex. `NEUTRAL`) |
| `baseDamage` | Dano | número puro |
| `criticalChance` | Crítico | `${valor}%` |
| `attacksPerTurn` | Velocidade | número puro |
| `range` | Knockback | número puro (mesmo rótulo usado em `WeaponDetailPage`) |
| `rarity` | Raridade | número puro (bruto, sem tradução de tier) |
| `price` | Preço | `${valor} moedas` |
| `quality` | Qualidade | número puro |
| `abilities` | Habilidades | texto puro |
| `description` | Descrição | texto puro |
| `imageUrl` | Imagem | texto puro (URL crua) |

### 3.2 `SubmissionDiff` — componente de apresentação

Novo arquivo `src/frontend/src/components/pages/SubmissionDiff.tsx`:

```tsx
interface SubmissionDiffProps {
  submission: WeaponSubmission;
}

export const SubmissionDiff = ({ submission }: SubmissionDiffProps) => { ... }
```

Autocontido: se `submission.type === 'UPDATE'`, dispara `weaponService.getWeaponById(submission.targetWeaponId)`
num `useEffect` ao montar (só quando o componente é efetivamente renderizado — ver seção 4 sobre
quando isso acontece); se `type === 'CREATE'`, não busca nada e chama `computeWeaponDiff(null, submission)`
direto. Mantém seu próprio estado de `loading`/`error`/`weapon`.

Renderiza a lista de `DiffField` retornada por `computeWeaponDiff`: cada linha mostra o label, e:
- se `changed`: valor antigo riscado em vermelho (ou omitido, se `oldValue` for `null`) → seta → valor
  novo em verde.
- se não `changed`: só o valor, em cor normal (texto secundário do tema, sem destaque).

Um único componente, reaproveitado em `AdminContributeView` e `UserContributeView` — sem duplicar
lógica de comparação ou estilo entre os dois lugares (seção 4).

---

## 4. Integração em `AdminContributeView` e `UserContributeView`

**`AdminContributeView.tsx`**: já tem estado `expandedId` e alterna expandir/colapsar ao clicar no
cabeçalho do card (comportamento existente, sem mudança). A seção expandida hoje mostra os campos
propostos "soltos" (`Classe: X · Elemento: Y`, `Dano: X · Crítico: Y%`, etc. — ver
`AdminContributeView.tsx` linhas 153-198 atuais). Esse bloco é substituído por
`<SubmissionDiff submission={submission} />`, renderizado só quando `expandedId === submission.id`
(igual a hoje — o `SubmissionDiff` só monta, e portanto só dispara sua busca da arma atual, quando o
card está de fato expandido).

**`UserContributeView.tsx`**: ganha o mesmo padrão. Novo estado `expandedId` (não existe hoje) na aba
"Minhas Propostas" — cada card vira clicável no cabeçalho (nome + tipo + badge de status, igual ao
padrão do admin), e ao expandir renderiza `<SubmissionDiff submission={submission} />` do mesmo jeito.
O botão "Cancelar" (só visível quando `status === 'PENDING'`) continua fora da área de diff, sempre
visível independente do estado de expandido/colapsado — mesma posição que ocupa hoje.

Nenhuma mudança em `WeaponForm`, `SubmissionStatusBadge`, ou nos botões de aprovar/rejeitar/cancelar —
só a seção de detalhe expandido muda.

---

## 5. Fluxo de dados

```
Card expandido (Admin ou User)
        │
        ▼
  <SubmissionDiff submission={s} />  monta
        │
        ├── s.type === 'CREATE' ──► computeWeaponDiff(null, s) ──► renderiza tudo em verde
        │
        └── s.type === 'UPDATE' ──► weaponService.getWeaponById(s.targetWeaponId)
                    │
                    ├── sucesso ──► computeWeaponDiff(weapon, s) ──► renderiza diff campo a campo
                    │
                    └── falha (404, arma deletada) ──► fallback (seção 6)
```

1. Usuário (admin ou autor) clica no cabeçalho do card de uma submissão → `expandedId` muda.
2. `SubmissionDiff` monta. Se `UPDATE`, busca a arma atual; se `CREATE`, pula direto para o cálculo.
3. `computeWeaponDiff` roda em memória, sem chamada de rede adicional.
4. Lista de `DiffField` é renderizada linha a linha.
5. Colapsar o card desmonta `SubmissionDiff` (comportamento padrão de renderização condicional em
   React) — reabrir dispara a busca de novo. Sem cache entre aberturas nesta fase (YAGNI: submissões
   não mudam de conteúdo depois de criadas, mas a arma-alvo pode ter sido aprovada/alterada por outra
   submissão nesse meio tempo, então buscar de novo a cada abertura é o comportamento correto, não
   uma limitação a ser otimizada).

---

## 6. Tratamento de erros

| Situação | Comportamento |
|---|---|
| `weaponService.getWeaponById` falha (arma deletada, erro de rede) | `SubmissionDiff` mostra um aviso curto — "Arma original não encontrada — exibindo apenas os valores propostos" — e renderiza os campos como se fosse `CREATE` (tudo em verde), chamando `computeWeaponDiff(null, submission)`. Não bloqueia a visualização da proposta. |
| Busca em andamento | `SubmissionDiff` mostra `Loading` compacto (reaproveita o componente `Loading` já existente, `fullHeight={false}`). |
| Submissão `CREATE` | Sem busca, sem estado de erro possível — vai direto para o cálculo. |

---

## 7. Testes

| Área | Cenários |
|---|---|
| `weaponDiff.test.ts` (função pura) | Nenhum campo mudou (todos `changed: false`); alguns campos mudaram (só esses `changed: true`); `current: null` (CREATE) → todos `changed: true` e `oldValue: null`; formatação correta de cada campo (`%` em crítico, `moedas` em preço). |
| `SubmissionDiff.test.tsx` | Estado de loading enquanto busca a arma (UPDATE); renderiza diff corretamente após busca bem-sucedida; renderiza fallback "tudo verde" quando a busca falha; submissão CREATE não dispara busca nenhuma e renderiza direto. |
| `AdminContributeView.test.tsx` | Expandir um card renderiza `SubmissionDiff` (pode mockar `SubmissionDiff` ou usar o real com `weaponService` mockado — usar o componente real, já que é barato e testa a integração de verdade). |
| `UserContributeView.test.tsx` | Novo teste: cards de "Minhas Propostas" agora expandem ao clicar e mostram o diff; botão "Cancelar" continua visível e funcional independente do estado de expandido/colapsado. |

Rodar `npx vitest run` em `src/frontend` — todos os testes devem passar antes de qualquer commit
(contagem não é fixa, conforme prática já estabelecida no projeto).

---

## 8. Arquivos

**Novos**
- `src/frontend/src/lib/weaponDiff.ts` — `computeWeaponDiff` + tipo `DiffField`
- `src/frontend/src/lib/weaponDiff.test.ts`
- `src/frontend/src/components/pages/SubmissionDiff.tsx`
- `src/frontend/src/components/pages/SubmissionDiff.test.tsx`

**Modificados**
- `src/frontend/src/components/pages/AdminContributeView.tsx` — seção expandida passa a renderizar `<SubmissionDiff />` em vez dos campos soltos atuais
- `src/frontend/src/components/pages/AdminContributeView.test.tsx` — atualiza asserções da seção expandida
- `src/frontend/src/components/pages/UserContributeView.tsx` — ganha `expandedId` + cards clicáveis + `<SubmissionDiff />`
- `src/frontend/src/components/pages/UserContributeView.test.tsx` — novos testes de expandir/colapsar

---

## 9. Fora de escopo (repetido para clareza)

Preview ao vivo da página e redesign do dashboard admin como aba própria continuam pendentes como
partes separadas da Fase 2, cada uma com sua própria spec. Nenhuma mudança de backend nesta spec —
puramente frontend, sobre dados que os endpoints da Fase 1 já expõem.
