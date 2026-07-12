---
tags: [spec, frontend, boss]
aliases: [Páginas de Bosses — Design]
up: "[[INDEX]]"
related:
  - "[[BossPages]]"
status: ativo
---

# Páginas de Bosses — Design Spec

> Ver também: [[BossPages]]

**Data:** 2026-07-03
**Escopo:** Sub-projeto #4 da decomposição das páginas de conteúdo (feito por último). Cria a seção
**Bosses** (listagem `/bosses` + detalhe `/bosses/:id`) com um layout de detalhe **temático na cor de
cada boss** ("no tema do BOSS"). Frontend-only, dados mockados.

---

## 1. Objetivo

Entregar a seção de Bosses com um detalhe dramático e único por boss: cada página é tingida pela
**cor do próprio boss** (faixa/glow no topo, título e stats na cor), distinta do layout de inimigo
comum. A listagem ordena os bosses por **progressão** do jogo.

---

## 2. Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| Navegação | Seção própria: aba **"Bosses"** no Header + rotas `/bosses` e `/bosses/:id`. |
| Intensidade do tema | **Hero temático com faixa tingida**: banda com glow na cor do boss + imagem, título com glow, stats na cor. |
| Conteúdo específico | **Fases** (número, estruturado) + **Estratégia** (Markdown). |
| Stats | **Números grandes temáticos, sem barras** (HP varia de ~5 mil a ~1,1 milhão — barras seriam enganosas). |
| Listagem | Grid **ordenado por progressão**, cards com acento na cor do boss + busca. |
| Dados | **Mock estático** via `bossService` (assíncrono, troca por API depois). |

---

## 3. Modelo (`src/frontend/src/types/boss.ts`)

```ts
export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  biome: string;             // onde é invocado / aparece
  themeColor: string;        // hex — cor do boss (exceção semântica de lore do CLAUDE.md)
  progression: number;       // ordem de progressão (ordena a listagem)
  progressionLabel: string;  // ex.: "Pré-Hardmode", "Pós-Providência"
  phases: number;            // número de fases
  hp: number;
  damage: number;
  defense: number;
  markdownContent?: string;  // Estratégia / guia de luta — backend depois
  flavorText?: string;       // frase de flavor no rodapé — backend depois
  createdAt: string;
}
```

**Cor do boss:** `themeColor` é um hex aplicado via `style` inline (o `CLAUDE.md` proíbe hex
hardcoded para chrome de tema, mas **permite cores semânticas de gameplay/lore** — a cor do boss é
justamente isso). Todo o resto do chrome continua em tokens `calamity-*`.

---

## 4. Dados mock (`src/frontend/src/services/bossService.ts`)

5 bosses com cores e progressão distintas:

| # | Boss | themeColor | progressionLabel |
|---|---|---|---|
| 1 | Flagelo do Deserto | tom areia | Pré-Hardmode |
| 2 | Crabulon | azul-cogumelo | Pré-Hardmode |
| 3 | Elemental de Brimstone | carmesim | Hardmode |
| 4 | Providência | dourado radiante | Pós-Providência |
| 5 | Devorador de Deuses | violeta cósmico | Endgame |

Service espelhando os demais:

```ts
bossService.getAllBosses(): Promise<Boss[]>
bossService.getBossById(id: string): Promise<Boss>   // rejeita se não achar
```

Imagens podem ficar vazias (degradam com placeholder).

---

## 5. Detalhe `/bosses/:id` (`BossDetailPage.tsx`)

Layout próprio, tingido por `boss.themeColor` (via `style` inline).

```
[← Voltar para Bosses]

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   faixa de topo: gradiente/glow na cor do boss
▓▓     ┌───────┐     ▓▓
▓▓     │  IMG  │     ▓▓  imagem emoldurada (borda na cor), com glow temático
▓▓     └───────┘     ▓▓
    NOME DO BOSS          título com text-shadow/glow na cor do boss
   [Bioma][N Fases][Progressão]   chips (EnemyChip, neutros)
   ───────────────────────────
   ┌ HP ──────┐ ┌ Dano ─────┐ ┌ Defesa ──┐   números grandes na cor do boss
   │ 1.120.000│ │    120    │ │    80    │   (formatados, sem barra)
   └──────────┘ └───────────┘ └──────────┘
   ───────────────────────────
   Estratégia (Markdown)
   ───────────────────────────
   Rodapé (DetailFooter): Bioma · Fases · Progressão · Adicionado em · "flavor"
```

- **Faixa temática:** banda no topo (`relative`, `overflow-hidden`) com um gradiente/glow usando
  `themeColor` em baixa opacidade sobre `bg-calamity-bg-dark`; imagem emoldurada centralizada com
  `boxShadow` na cor. Funciona em dark **e** light (a cor do boss é vívida; opacidade baixa não
  compromete contraste do texto, que segue tokenizado).
- **Título:** `color` = themeColor + `textShadow` (glow) via `style`.
- **Chips:** `EnemyChip` (reuso) para Bioma, "N Fases", Progressão.
- **Stats:** 3 blocos (`BossStat`, componente local) com número formatado
  (`toLocaleString('pt-BR')`) em `color: themeColor`.
- **Estratégia:** `MarkdownContent content={boss.markdownContent}`.
- **Rodapé:** `DetailFooter` items `[Bioma, Fases, Progressão, Adicionado em]`, `quote=flavorText`.
- Estados loading/error como nas demais páginas de detalhe.
- **Mobile:** empilhado; stats em 1 coluna; faixa reduzida.

---

## 6. Listagem `/bosses` (`BossesPage.tsx`)

- Grid de `BossCard`, **ordenado por `progression`** (asc).
- Busca por nome.
- Estados loading/error/vazio.

`BossCard`: imagem (ou placeholder), nome, HP formatado, chips (Bioma, Progressão); **acento na cor
do boss** (ex.: borda superior/esquerda via `style` com `themeColor`); `onSelect(id)` →
`navigate('/bosses/:id')`.

---

## 7. Componentes / arquivos

**Novos**
- `types/boss.ts`
- `services/bossService.ts` (+ `.test.ts`)
- `components/pages/BossesPage.tsx` (+ `.test.tsx`)
- `components/pages/BossDetailPage.tsx` (+ `.test.tsx`)
- `components/pages/BossCard.tsx`
- `components/pages/BossStat.tsx` (bloco de stat numérico temático)

**Modificados**
- `App.tsx` — rotas `/bosses` e `/bosses/:id`
- `components/common/Header.tsx` — aba "Bosses" (`{ label: 'Bosses', path: '/bosses' }`)
- `components/common/Header.test.tsx` — assert da nova aba

**Reuso (sem alteração):** `MarkdownContent`, `DetailFooter`, `EnemyChip`, `Card`, `Loading`, `Error`.

---

## 8. Detalhes de design

- `themeColor` (hex) aplicado **somente** via `style` inline, como cor semântica de lore; todo o
  resto usa tokens `calamity-*`.
- Sem emojis; mobile-first; tap targets ≥ 44px; dark **e** light mode (contraste do texto garantido
  por tokens; a cor do boss entra em glows/números/acentos, não no texto de leitura).
- Números formatados em pt-BR (`toLocaleString`).

---

## 9. Testes (`cd src/frontend && npx vitest run` todos verdes)

| Arquivo | Cenários |
|---|---|
| `bossService.test.ts` | `getAllBosses` retorna a lista; `getBossById` acha e rejeita id inexistente |
| `BossCard.test.tsx` | Renderiza nome e HP; dispara `onSelect` com o id |
| `BossesPage.test.tsx` | Renderiza grid ordenado por progressão; busca reduz a lista |
| `BossDetailPage.test.tsx` | Nome + chips (Bioma/Fases/Progressão); stats numéricos; Estratégia em Markdown; back-link para `/bosses` |
| `Header.test.tsx` (adição) | Exibe aba "Bosses" apontando para `/bosses` |

---

## 10. Fora de escopo

Backend; NPCs/Itens; cross-link boss↔bioma (o boss guarda `biome` como texto, sem navegar para a
página do bioma por ora); animações elaboradas do hero.
