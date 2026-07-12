---
tags: [spec, frontend, armor]
aliases: [Páginas de Armadura — Design]
up: "[[INDEX]]"
related:
  - "[[ArmorPages]]"
  - "[[Armor]]"
  - "[[WeaponsPage]]"
status: ativo
---

# Páginas de Armadura — Design Spec

> Ver também: [[ArmorPages]] · [[Armor]] · [[WeaponsPage]] (fundação reaproveitada)

**Data:** 2026-07-02
**Escopo:** Sub-projeto #2 da decomposição das páginas de conteúdo. Cria a seção **Armaduras**
(listagem `/armor` + detalhe `/armor/:id`) reusando a fundação de componentes entregue no #1
(PR #46). Frontend-only, dados mockados (estratégia híbrida — backend depois).

---

## 1. Objetivo

Entregar a seção de Armaduras espelhando a de Armas, com o detalhe no layout desejado (imagem à
**direita**, o inverso da arma). Cada armadura é um **conjunto (set)** e sua página mostra também
**cada peça** — Elmo, Peitoral e Calça.

---

## 2. Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| Navegação | Seção própria: nova aba **"Armaduras"** no Header + rotas `/armor` e `/armor/:id`. |
| Granularidade | Uma entrada = um **conjunto**. Peças (elmo/peitoral/calça) são dados do conjunto, exibidas no detalhe (não são entradas/rotas próprias). |
| Estatística | **Defesa** como barra principal; bônus de set/resistências/efeitos no Markdown. |
| Listagem | **Espelha `WeaponsPage`**: grid + filtros (Classe, Raridade, busca) + ordenação. |
| Dados | **Mock estático** via `armorService` (assinatura Promise, para trocar por API depois). Sem cold-start/retry. |
| Layout detalhe | Espelho da arma via `DetailLayout asideSide="right"`. |

---

## 3. Modelo (`src/frontend/src/types/armor.ts`)

```ts
import { RarityLevel } from './weapon'; // reusa o enum existente, sem movê-lo

export enum ArmorClass {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGE = 'MAGE',
  SUMMON = 'SUMMON',
  ROGUE = 'ROGUE',
  UNIVERSAL = 'UNIVERSAL',
}

export type ArmorSlot = 'HELMET' | 'CHEST' | 'LEGS'; // Elmo, Peitoral, Calça

export interface ArmorPiece {
  slot: ArmorSlot;
  name: string;
  imageUrl: string;
  defense: number;
}

export interface Armor {
  id: string;
  name: string;
  armorClass: ArmorClass;
  rarity: RarityLevel;
  totalDefense: number;
  pieces: ArmorPiece[];       // elmo, peitoral, calça
  imageUrl: string;           // imagem do conjunto
  markdownContent?: string;   // bônus de set / lore — backend depois
  flavorText?: string;        // frase de flavor no rodapé — backend depois
  createdAt: string;
}
```

Rótulos PT-BR dos slots (na UI): `HELMET → Elmo`, `CHEST → Peitoral`, `LEGS → Calça`.

---

## 4. Dados mock (`src/frontend/src/services/armorService.ts`)

Array estático de ~4 conjuntos do Calamity (ex.: Victide, Aerospec, Daedalus, Brimstone Witch),
cada um com 3 peças. Service com a mesma forma do `weaponService`:

```ts
armorService.getAllArmors(): Promise<Armor[]>
armorService.getArmorById(id: string): Promise<Armor>   // rejeita se não achar
```

Imagens podem apontar para a wiki ou ficar vazias (o `EntityHero`/cards degradam sem imagem).
Quando o backend existir, só o service muda; as páginas não.

---

## 5. Detalhe `/armor/:id` (`ArmorDetailPage.tsx`)

Composição fina sobre a fundação, com `DetailLayout asideSide="right"`.

```
[← Voltar para Armaduras]

┌ MAIN (esquerda, ~2/3) ───────────────┐  ┌ ASIDE (direita, sticky, ~1/3) ─┐
│  Peças do Conjunto                    │  │  [ imagem do conjunto ]        │
│  ┌ Elmo ┐ ┌ Peitoral ┐ ┌ Calça ┐     │  │  Nome (h1)                    │
│  │ img  │ │ img       │ │ img   │     │  │  [Classe][Raridade]           │
│  │ nome │ │ nome      │ │ nome  │     │  │  ── Defesa ──                 │
│  │ def  │ │ def       │ │ def   │     │  │  Defesa   45  ▓▓▓▓░            │
│  └──────┘ └───────────┘ └───────┘     │  │                               │
│  Descrição (Markdown: bônus de set)   │  │                               │
└───────────────────────────────────────┘  └───────────────────────────────┘

── divider ──
RODAPÉ (border-l-2 accent-gold): Classe · Adicionado em · "flavor em itálico"
```

- **aside:** `EntityHero` (imagem do conjunto, `accentClass` = borda por raridade, badges =
  `Badge class` + `Badge rarity`) + `StatBar` **Defesa** (`max` ~100, cor `calamity-primary`).
- **main:** seção "Peças do Conjunto" com 3 `ArmorPieceCard` (grid `sm:grid-cols-3`) →
  heading "Descrição" + `MarkdownContent content={armor.markdownContent}`.
- **footer:** `DetailFooter` items `[Classe, Adicionado em]`, `quote={armor.flavorText}`.
- **Mobile:** empilha (imagem do conjunto no topo pela ordem do DOM → peças → descrição → rodapé).

Estados loading/error iguais aos da `WeaponDetailPage` (`Loading`/`Error`).

---

## 6. Listagem `/armor` (`ArmorPage.tsx`)

Espelha `WeaponsPage`:
- Grid responsivo de `ArmorCard`.
- Filtros: **Classe** (`ArmorClass`), **Raridade** (`RarityLevel`), **busca por nome**;
  ordenação **Nome (A-Z)** / **Defesa (maior)**.
- Filtros em painel no desktop e em `Drawer` (bottom) no mobile, como em Armas.
- Estados loading/error/vazio equivalentes.

`ArmorCard`: espelha `WeaponCard` — imagem, nome, `totalDefense` ("DEFESA"), badges Classe +
Raridade; `onSelect(id)` → `navigate('/armor/:id')`.

`ArmorPieceCard`: card compacto de peça — imagem, rótulo do slot (Elmo/Peitoral/Calça), nome e
defesa. Local em `components/pages`.

---

## 7. Componentes / arquivos

**Novos**
- `types/armor.ts`
- `services/armorService.ts` (+ `.test.ts`)
- `components/pages/ArmorPage.tsx` (+ `.test.tsx`)
- `components/pages/ArmorDetailPage.tsx` (+ `.test.tsx`)
- `components/pages/ArmorCard.tsx`
- `components/pages/ArmorPieceCard.tsx`

**Modificados**
- `App.tsx` — rotas `/armor` e `/armor/:id`
- `components/common/Header.tsx` — aba "Armaduras" (`{ label: 'Armaduras', path: '/armor' }`)
- `components/common/Header.test.tsx` — assert da nova aba

**Reuso (sem alteração):** `DetailLayout`, `EntityHero`, `StatBar`, `MarkdownContent`,
`DetailFooter`, `Badge`, `Card`, `Drawer`, `Loading`, `Error`.

---

## 8. Detalhes de design

- Badges de armadura = **Classe + Raridade** (armadura não tem elemento). `ArmorClass.UNIVERSAL`
  cai no fallback cinza do `Badge` — na implementação, avaliar adicionar cor própria ao variant
  `class` (mudança pequena e semântica de gameplay).
- Borda da imagem do conjunto na **cor da raridade** (mesmo mapa `RARITY_BORDER` da arma —
  extrair para util compartilhado se conveniente, ou duplicar o mapa pequeno).
- Tokens `calamity-*` exclusivamente (exceção: cores de gameplay em `Badge`/borda de raridade).
- Sem emojis; mobile-first; tap targets ≥ 44px; dark **e** light mode.

---

## 9. Testes (espelham Armas; `cd src/frontend && npx vitest run` todos verdes)

| Arquivo | Cenários |
|---|---|
| `armorService.test.ts` | `getAllArmors` retorna a lista; `getArmorById` acha por id e rejeita id inexistente |
| `ArmorCard.test.tsx` | Renderiza nome, defesa e badges; dispara `onSelect` com o id |
| `ArmorPage.test.tsx` | Renderiza grid; filtro por classe/raridade/busca reduz a lista; estado vazio |
| `ArmorDetailPage.test.tsx` | Nome + badges Classe/Raridade; 3 peças (Elmo/Peitoral/Calça); descrição em Markdown; back-link para `/armor` |
| `Header.test.tsx` (adição) | Exibe aba "Armaduras" apontando para `/armor` |

---

## 10. Fora de escopo

Backend de armadura; inimigos (#3), bosses (#4), biomas (#5); limpeza da `ItemsPage` placeholder.
