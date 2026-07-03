# Páginas de Inimigos — Design Spec

**Data:** 2026-07-02
**Escopo:** Sub-projeto #3 da decomposição das páginas de conteúdo. Cria a seção **Inimigos**
(listagem `/enemies` + detalhe `/enemies/:id`), substituindo a `EnemiesPage` placeholder. Layout de
detalhe **próprio** (imagem centralizada no topo), distinto do de Arma/Armadura. Frontend-only,
dados mockados. Bosses ficam para o #4; Biomas (#5) reusam os cards de inimigo.

---

## 1. Objetivo

Entregar a seção de Inimigos com o layout desejado: ao entrar no detalhe, a **imagem** aparece
grande e **centralizada no topo**, e o conteúdo (badges, estatísticas, descrição, rodapé) vem
**abaixo**, em coluna única centralizada.

Cada inimigo guarda o **bioma** onde aparece, preparando o #5 (Biomas) para agrupar inimigos por
bioma — ex.: o **Caranguejo Antozoário** (Anthozoan Crab) na **Praia Sulfúrica**.

---

## 2. Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| Layout detalhe | **Coluna única centralizada**, imagem grande no topo, conteúdo abaixo. Sem `DetailLayout`. |
| Estatísticas | **HP, Dano, Defesa** (3 `StatBar`). Drops/resistências/comportamento no Markdown. |
| Vínculo com bioma | Campo `biome` (rótulo string) **já agora**, para o #5 filtrar. |
| Listagem | Grid de cards + **filtro por Bioma** + busca + ordenação (Nome / HP). |
| Dados | **Mock estático** via `enemyService` (assíncrono, troca por API depois). |

---

## 3. Modelo (`src/frontend/src/types/enemy.ts`)

```ts
export enum EnemyType {
  GROUND = 'GROUND',       // Terrestre
  FLYING = 'FLYING',       // Voador
  AQUATIC = 'AQUATIC',     // Aquático
  BURROWER = 'BURROWER',   // Escavador
  CASTER = 'CASTER',       // Conjurador
}

export const ENEMY_TYPE_LABEL: Record<EnemyType, string> = {
  GROUND: 'Terrestre',
  FLYING: 'Voador',
  AQUATIC: 'Aquático',
  BURROWER: 'Escavador',
  CASTER: 'Conjurador',
};

export interface Enemy {
  id: string;
  name: string;
  imageUrl: string;
  biome: string;            // rótulo do bioma, ex.: "Praia Sulfúrica"
  enemyType: EnemyType;
  hp: number;
  damage: number;
  defense: number;
  markdownContent?: string; // lore / drops / comportamento — backend depois
  flavorText?: string;      // frase de flavor no rodapé — backend depois
  createdAt: string;
}
```

**Nota de acoplamento:** `biome` é um rótulo string por ora. O #5 casará inimigos ao bioma por esse
rótulo; se necessário, refatora-se para `biomeId` quando os Biomas existirem.

---

## 4. Dados mock (`src/frontend/src/services/enemyService.ts`)

~5 inimigos em 2 biomas, incluindo o Caranguejo Antozoário (Praia Sulfúrica). Service espelhando
`armorService`:

```ts
enemyService.getAllEnemies(): Promise<Enemy[]>
enemyService.getEnemyById(id: string): Promise<Enemy>   // rejeita se não achar
```

Biomas de exemplo: **Praia Sulfúrica** (Caranguejo Antozoário, Peixinho Tóxico, Trasher) e
**Mar Afundado** (Serpente Marinha, Casco-Prisma). Imagens podem ficar vazias (degradam).

---

## 5. Detalhe `/enemies/:id` (`EnemyDetailPage.tsx`)

Coluna única centralizada (`container mx-auto max-w-3xl`), sem aside/main.

```
[← Voltar para Inimigos]

              ┌───────────┐
              │   imagem  │   grande, centralizada (moldura de codex)
              └───────────┘
             Nome do Inimigo      (h1, centralizado)
            [Bioma] [Tipo]        (chips tokenizados, centralizados)
   ─────────────────────────────
   ┌ HP ──────┐ ┌ Dano ─────┐ ┌ Defesa ──┐   (3 StatBar em grid)
   └──────────┘ └───────────┘ └──────────┘
   ─────────────────────────────
   Descrição (Markdown)
   ─────────────────────────────
   Rodapé (DetailFooter): Bioma · Adicionado em · "flavor"
```

- **Chips de Bioma/Tipo:** o `Badge` só tem cores para class/element/rarity; Bioma/Tipo usam
  **chips tokenizados** (`bg-calamity-bg-tertiary`, borda, `font-display uppercase`) — componente
  local `EnemyChip` (ou markup inline reutilizado por card e detalhe).
- **Stats:** `StatBar` para HP (`max` 1000, `calamity-primary`), Dano (`max` 100,
  `calamity-accent-purple`), Defesa (`max` 50, `calamity-accent-green`). Em grid
  `grid-cols-1 sm:grid-cols-3`.
- **Descrição:** `MarkdownContent content={enemy.markdownContent}`.
- **Rodapé:** `DetailFooter` items `[Bioma, Adicionado em]`, `quote={enemy.flavorText}`.
- Estados loading/error como nas outras páginas de detalhe.
- **Mobile:** naturalmente empilhado (já é coluna única); stats viram 1 coluna.

---

## 6. Listagem `/enemies` (`EnemiesPage.tsx`, substitui o placeholder)

- Grid responsivo de `EnemyCard`.
- Filtros: **Bioma** (select com os biomas distintos presentes nos dados), **busca por nome**;
  ordenação **Nome (A-Z)** / **HP (maior)**.
- Painel de filtros no desktop e `Drawer` (bottom) no mobile, como em Armas/Armaduras.
- Estados loading/error/vazio equivalentes.

`EnemyCard`: imagem, nome, HP (ex.: "1200 HP"), chips Bioma + Tipo; `onSelect(id)` →
`navigate('/enemies/:id')`. **Reutilizável pelo #5** (cards de inimigo dentro da página do bioma).

---

## 7. Componentes / arquivos

**Novos**
- `types/enemy.ts`
- `services/enemyService.ts` (+ `.test.ts`)
- `components/pages/EnemyCard.tsx`
- `components/pages/EnemyDetailPage.tsx` (+ `.test.tsx`)
- `components/pages/EnemyChip.tsx` (chip tokenizado de Bioma/Tipo)

**Modificados**
- `components/pages/EnemiesPage.tsx` — substitui placeholder pela listagem real (+ `.test.tsx` novo)
- `App.tsx` — adiciona rota `/enemies/:id` (a `/enemies` já existe)
- `components/pages/PlaceholderPages.test.tsx` — remove o caso `EnemiesPage` (deixa Items/NPCs/Biomas)

**Reuso (sem alteração):** `StatBar`, `MarkdownContent`, `DetailFooter`, `Card`, `Drawer`,
`Loading`, `Error`.

---

## 8. Detalhes de design

- Tokens `calamity-*` exclusivamente; chips de Bioma/Tipo são neutros (não são cor de gameplay).
- Sem emojis; mobile-first; tap targets ≥ 44px; dark **e** light mode.
- Imagem do inimigo em moldura de codex centralizada (inset `bg-tertiary` + borda), coerente com o
  `EntityHero` das outras páginas, mas centralizada.

---

## 9. Testes (`cd src/frontend && npx vitest run` todos verdes)

| Arquivo | Cenários |
|---|---|
| `enemyService.test.ts` | `getAllEnemies` retorna a lista; `getEnemyById` acha e rejeita id inexistente |
| `EnemyCard.test.tsx` | Renderiza nome, HP e chips; dispara `onSelect` com o id |
| `EnemiesPage.test.tsx` | Renderiza grid; filtro por bioma/busca reduz a lista; estado vazio |
| `EnemyDetailPage.test.tsx` | Nome + chips Bioma/Tipo; 3 stats; descrição em Markdown; back-link para `/enemies` |
| `PlaceholderPages.test.tsx` (ajuste) | Remove o caso EnemiesPage |

---

## 10. Fora de escopo

Bosses (#4 — layout temático próprio); Biomas (#5); backend; drops estruturados (ficam no Markdown).
