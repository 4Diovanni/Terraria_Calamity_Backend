# Páginas de Biomas — Design Spec

**Data:** 2026-07-03
**Escopo:** Sub-projeto #5 da decomposição das páginas de conteúdo. Cria a seção **Biomas**
(listagem `/biomes` + detalhe `/biomes/:id`), substituindo a `BiomesPage` placeholder. Cada bioma
mostra suas informações (estilo wiki) e os **inimigos que vivem nele**, escopados pelo campo
`biome` que os inimigos já declaram (#3). Frontend-only, dados mockados.

---

## 1. Objetivo

Entregar a seção de Biomas: cards de bioma que abrem uma página própria com informações do bioma
(baseadas na wiki do Calamity) e os cards dos inimigos daquele bioma — ex.: o **Caranguejo
Antozoário** aparece **apenas** dentro da página da **Praia Sulfúrica**.

---

## 2. Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| Layout detalhe | **Banner + nome → faixa de fatos → Markdown → grid de inimigos do bioma.** |
| Vínculo inimigo↔bioma | **Casar por nome**: `enemy.biome === biome.name`. Zero mudança no modelo de inimigos. |
| Metadados | Descrição em Markdown **+ faixa de fatos** (label/valor). |
| Escopo mock | **4 biomas**: 2 com inimigos (Praia Sulfúrica, Mar Afundado) + 2 extras vazios (Abismo, Penhasco de Brimstone). |
| Dados | **Mock estático** via `biomeService` (assíncrono, troca por API depois). |

---

## 3. Modelo (`src/frontend/src/types/biome.ts`)

```ts
export interface BiomeFact {
  label: string;   // ex.: "Localização", "Momento do jogo"
  value: string;
}

export interface Biome {
  id: string;
  name: string;             // DEVE casar exatamente com enemy.biome
  summary: string;          // blurb curto exibido no card
  imageUrl: string;         // banner (paisagem)
  facts: BiomeFact[];       // faixa de fatos
  markdownContent?: string; // descrição estilo wiki — backend depois
  createdAt: string;
}
```

**Nota de acoplamento:** o vínculo com inimigos é por **rótulo string** (`name`). Os nomes dos
biomas no mock são a mesma string usada em `enemyService` (`"Praia Sulfúrica"`, `"Mar Afundado"`).
Se o backend introduzir ids, refatora-se para `biomeId` nos dois lados.

---

## 4. Dados / serviços

### `biomeService` (`src/frontend/src/services/biomeService.ts`)

```ts
biomeService.getAllBiomes(): Promise<Biome[]>
biomeService.getBiomeById(id: string): Promise<Biome>   // rejeita se não achar
```

4 biomas mockados. `imageUrl` pode ficar vazio (banner degrada com placeholder).

### `enemyService` (extensão)

Adiciona um método (mudança pequena e segura no service já mergeado):

```ts
enemyService.getEnemiesByBiome(biome: string): Promise<Enemy[]>  // filtra enemy.biome === biome
```

Com teste próprio. O detalhe do bioma usa este método para listar seus inimigos.

---

## 5. Detalhe `/biomes/:id` (`BiomeDetailPage.tsx`)

Coluna única (`container mx-auto`, largura de leitura confortável). Carrega o bioma
(`getBiomeById`) e, em paralelo, seus inimigos (`getEnemiesByBiome(biome.name)`).

```
[← Voltar para Biomas]

┌───────────────────────────────┐
│         banner do bioma        │   imagem paisagem (aspect-video / h-56)
└───────────────────────────────┘
Nome do Bioma                        (h1)
── Faixa de fatos ─────────────      (dl: Localização · Momento do jogo · ...)
Descrição (Markdown)
── divider ──
Inimigos deste Bioma                 (h2)
[EnemyCard] [EnemyCard] [EnemyCard]  (grid; clica → /enemies/:id)
   — ou estado vazio: "Nenhum inimigo catalogado neste bioma ainda."
```

- **Banner:** moldura de codex paisagem (`bg-tertiary` + borda); degrada sem imagem.
- **Faixa de fatos:** `dl` com `biome.facts` (reaproveita o padrão visual do `DetailFooter`,
  assinatura `border-l-2 accent-gold`, mas no topo — componente local `BiomeFacts` ou markup inline).
- **Descrição:** `MarkdownContent content={biome.markdownContent}`.
- **Inimigos:** grid de `EnemyCard` (reuso do #3), `onSelect` → `navigate('/enemies/:id')`.
  Estado vazio quando `getEnemiesByBiome` retorna `[]`.
- Estados loading/error como nas demais páginas de detalhe.
- **Mobile:** naturalmente empilhado; grid de inimigos vira 1 coluna.

---

## 6. Listagem `/biomes` (`BiomesPage.tsx`, substitui o placeholder)

- Grid responsivo de `BiomeCard`.
- Busca por nome (leve; sem outros filtros — os biomas são poucos e são os próprios itens).
- Estados loading/error/vazio.

`BiomeCard`: banner (ou placeholder), nome, `summary` (line-clamp); `onSelect(id)` →
`navigate('/biomes/:id')`.

---

## 7. Componentes / arquivos

**Novos**
- `types/biome.ts`
- `services/biomeService.ts` (+ `.test.ts`)
- `components/pages/BiomeCard.tsx`
- `components/pages/BiomeDetailPage.tsx` (+ `.test.tsx`)
- `components/pages/BiomeFacts.tsx` (faixa de fatos) — ou inline no detalhe

**Modificados**
- `components/pages/BiomesPage.tsx` — substitui placeholder pela listagem real (+ `.test.tsx` novo)
- `services/enemyService.ts` — adiciona `getEnemiesByBiome` (+ teste)
- `App.tsx` — adiciona rota `/biomes/:id` (a `/biomes` já existe)
- `components/pages/PlaceholderPages.test.tsx` — remove o caso `BiomesPage` (deixa Items/NPCs)

**Reuso (sem alteração):** `MarkdownContent`, `EnemyCard`, `EnemyChip`, `Card`, `Loading`, `Error`.

---

## 8. Detalhes de design

- Tokens `calamity-*` exclusivamente; banner em moldura de codex paisagem.
- Sem emojis; mobile-first; tap targets ≥ 44px; dark **e** light mode.
- Faixa de fatos com assinatura dourada (`border-l-2 accent-gold`), coerente com `ProfilePage`/`DetailFooter`.
- `EnemyCard` idêntico ao usado em `/enemies` — consistência total entre listar inimigos e vê-los por bioma.

---

## 9. Testes (`cd src/frontend && npx vitest run` todos verdes)

| Arquivo | Cenários |
|---|---|
| `biomeService.test.ts` | `getAllBiomes` retorna a lista; `getBiomeById` acha e rejeita id inexistente |
| `enemyService.test.ts` (adição) | `getEnemiesByBiome` retorna só os inimigos do bioma; `[]` para bioma sem inimigos |
| `BiomeCard.test.tsx` | Renderiza nome e summary; dispara `onSelect` com o id |
| `BiomesPage.test.tsx` | Renderiza grid; busca por nome reduz a lista |
| `BiomeDetailPage.test.tsx` | Nome + fatos; descrição Markdown; cards dos inimigos do bioma; estado vazio quando não há inimigos; back-link para `/biomes` |
| `PlaceholderPages.test.tsx` (ajuste) | Remove o caso BiomesPage |

---

## 10. Fora de escopo

Bosses (#4 — layout temático próprio, adiado); backend; NPCs/Itens; contagem de inimigos nos cards
da listagem (fica no detalhe); refatoração de `enemy.biome` para `biomeId`.
