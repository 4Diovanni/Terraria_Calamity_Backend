# Fundação de Design + Redesign da Página de Arma — Design Spec

**Data:** 2026-07-02
**Escopo:** Sub-projeto #1 de uma decomposição maior. Estabelece a **fundação de componentes de
detalhe** compartilhados e reescreve a página de detalhe de **Arma** (`/weapons/:id`) como
implementação de referência. Armaduras, inimigos, bosses e biomas (ciclos seguintes) reusam esta
fundação.

---

## 1. Objetivo

Dar ao site uma **base visual consistente** para as páginas de conteúdo (como o conteúdo se
apresenta ao usuário) e entregar a página de Arma no layout desejado:

- **Esquerda** (visível ao entrar): imagem da arma → nome → tipo/raridade/classe → estatísticas.
- **Direita**: descrição como **documento Markdown** (lore/história/notas), de fácil edição.
- **Rodapé** (fim da página): classe, data de adição e uma frase de sabor (*flavor text*),
  extensível para o futuro em que players adicionam conteúdo.

Estratégia de dados: **híbrida**. Usa os dados reais que a API já entrega (`weaponService`) e
adiciona campos novos como **opcionais com fallback**, para o backend preencher numa fase seguinte.

---

## 2. Decisões

| Tema | Decisão |
|---|---|
| Mapeamento das badges | `element` = **Tipo**, `rarity` = **Raridade**, `weaponClass` = **Classe**. Reusa `Badge` (variants `element`/`rarity`/`class`). |
| Lado direito | **Documento Markdown completo**, separado dos stats. Fonte: `markdownContent ?? description`. |
| Flavor text | Campo **opcional** novo; rodapé só o exibe quando presente (fallback = omitir). |
| Estética | **Evoluir** a identidade atual (Cinzel + tokens `calamity-*` + glows), sem repensar do zero. |

---

## 3. Layout

### Desktop (`md:`+) — duas colunas + rodapé

```
[← Voltar para Armas]

┌ ASIDE (sticky, ~1/3) ─────────┐  ┌ MAIN (~2/3) ───────────────────────┐
│  [ imagem emoldurada (codex) ]│  │  Documento Markdown                 │
│  Nome da Arma (h1, Cinzel)    │  │  headings Cinzel · corpo Crimson    │
│  [Tipo][Raridade][Classe]     │  │  blockquote / código tokenizados    │
│  ── Estatísticas ──           │  │                                     │
│  Dano       55  ▓▓▓▓░         │  │                                     │
│  Crítico    10% ▓▓░░░         │  │                                     │
│  Velocidade  2  ▓▓░░░         │  │                                     │
│  Knockback   3  ▓▓░░░         │  │                                     │
└───────────────────────────────┘  └─────────────────────────────────────┘

── divider ──────────────────────────────────────────────────────────────
RODAPÉ (border-l-2 accent-gold):  Classe · Adicionado em · "flavor em itálico"
```

### Mobile (base) — empilhado

Ordem: imagem → nome → badges → estatísticas → Markdown → rodapé. Aside estático (sem sticky).
Mobile-first: classes base para 375px; `md:` é o enhancement.

---

## 4. Fundação de componentes (`src/frontend/src/components/ui/`)

Componentes genéricos, adicionados ao conjunto compartilhado `components/ui` (regra de consistência
da skill `visual-identity`: padrões novos não ficam inline por página).

| Componente | Responsabilidade | Props |
|---|---|---|
| `DetailLayout` | Scaffold: back-link + aside/main responsivos (aside sticky no desktop) + slot de footer | `backTo`, `backLabel`, `aside`, `footer?`, `asideSide?: 'left' \| 'right'` (default `left`), `children` |
| `EntityHero` | Imagem emoldurada + nome (h1) + linha de badges | `imageUrl?`, `name`, `badges?: ReactNode`, `accentClass?` (borda por raridade) |
| `StatBar` | Uma estatística: label + valor + barra | `label`, `value`, `displayValue?`, `max`, `colorClass?` |
| `MarkdownContent` | Markdown → HTML **sanitizado** com estilo de codex | `content?: string`, `emptyFallback?: string` |
| `DetailFooter` | Faixa de metadados + citação de flavor, assinatura `border-l-2 accent-gold` | `items: { label: string; value: ReactNode }[]`, `quote?: string` |

`DetailLayout` com `asideSide='right'` é o que a página de **Armadura** usará no ciclo #2 (espelho).

### 4.1 MarkdownContent — segurança

Dependências novas em `src/frontend/package.json`: `react-markdown`, `remark-gfm`,
`rehype-sanitize`.

**Sanitização é obrigatória**: o conteúdo será editável por players no futuro; sem sanitizar,
Markdown com HTML embutido (`<script>`, `onerror`, etc.) vira vetor de XSS. `rehype-sanitize` roda
no pipeline de rehype. Estilo aplicado via classes tokenizadas (`calamity-*`) para
headings/parágrafos/links/listas/blockquote/código — sem hex hardcoded.

Fonte do conteúdo na página de Arma: `weapon.markdownContent ?? weapon.description`. Quando ambos
ausentes/vazios, renderiza `emptyFallback` ("Sem descrição detalhada ainda.").

### 4.2 Tipo `Weapon` (`types/weapon.ts`)

Campos **opcionais** (não quebram o payload atual):

```ts
markdownContent?: string;  // documento .md completo — backend preenche depois
flavorText?: string;       // frase de sabor no rodapé — backend preenche depois
```

---

## 5. Estatísticas exibidas

Mantém os 4 campos atuais do modelo, com barras tokenizadas via `StatBar`:

| Label | Campo | max (normalização) | Cor |
|---|---|---|---|
| Dano | `baseDamage` | 200 | `calamity-primary` |
| Chance de Crítico | `criticalChance` (%) | 100 | `calamity-accent-purple` |
| Velocidade | `attacksPerTurn` | 5 | `calamity-accent-green` |
| Knockback | `range` | 10 | `calamity-primary` |

---

## 6. Refinamentos estéticos (evoluir identidade)

- Imagem em **moldura de codex** (inset `bg-calamity-bg-tertiary` + borda), não flutuante; acento
  de borda na cor da raridade — decoração que carrega informação (RPG-minimalism).
- Aside **sticky** no desktop (`md:sticky md:top-...`): imagem + stats permanecem visíveis ao rolar
  a lore — atende ao "visível assim que entrar".
- Rodapé com assinatura `border-l-2 calamity-accent-gold`, consistente com `ProfilePage`.
- Sem emojis (regra do `CLAUDE.md`).
- Dark **e** light mode via tokens; contraste AA.

---

## 7. Arquivos

**Novos**
- `components/ui/DetailLayout.tsx` (+ `.test.tsx`)
- `components/ui/EntityHero.tsx`
- `components/ui/StatBar.tsx` (+ `.test.tsx`)
- `components/ui/MarkdownContent.tsx` (+ `.test.tsx` — render + sanitização de `<script>`)
- `components/ui/DetailFooter.tsx`

**Modificados**
- `components/pages/WeaponDetailPage.tsx` — reescrita como composição fina (mantém fetch/loading/error via `weaponService.getWeaponById`)
- `components/pages/WeaponDetailPage.test.tsx` — asserts ajustados ao novo DOM
- `components/ui/index.ts` — exporta os novos componentes
- `types/weapon.ts` — campos opcionais
- `package.json` / lockfile — deps de Markdown

---

## 8. Testes

Todos os testes existentes devem continuar passando (`cd src/frontend && npx vitest run`). Novos:

| Arquivo | Cenários |
|---|---|
| `MarkdownContent.test.tsx` | Renderiza headings/parágrafos de MD; `emptyFallback` quando vazio; **`<script>` não é executado/renderizado** (sanitização) |
| `StatBar.test.tsx` | Renderiza label + `displayValue`; largura da barra clampada a `max` |
| `DetailLayout.test.tsx` | Renderiza back-link, aside, main e footer; `asideSide='right'` inverte a ordem no desktop |
| `WeaponDetailPage.test.tsx` (ajuste) | Nome + badges (Tipo/Raridade/Classe); descrição renderizada; rodapé com classe/data |

---

## 9. Regras de design aplicadas

- Tokens `calamity-*` exclusivamente (exceção: cores semânticas de gameplay em `Badge`).
- Sem emojis; mobile-first; tap targets ≥ 44px no back-link/controles.
- Componentes compartilhados em `components/ui`, reusáveis por armadura/inimigo/boss/bioma.
- Um só sistema de tipo/cor/spacing — sem paleta one-off por página.

## 10. Fora de escopo

Armaduras (#2), inimigos (#3), bosses (#4), biomas (#5); backend; migração da listagem `/weapons`
(o emoji ⚔️ no h1 dela fica para uma limpeza à parte).
