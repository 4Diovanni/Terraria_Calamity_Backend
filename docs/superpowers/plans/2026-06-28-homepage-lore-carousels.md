---
tags: [plan, frontend, homepage]
aliases: [Homepage Lore e Carrosséis]
up: "[[INDEX]]"
related:
  - "[[Carousel]]"
  - "[[2026-06-28-homepage-ui-polish]]"
  - "[[2026-06-28-homepage-adjustments]]"
status: ativo
---

# Homepage — Lore, Carrosséis e UX Plan

> Ver também: [[Carousel]] · [[2026-06-28-homepage-ui-polish]] · [[2026-06-28-homepage-adjustments]]

> **Para execução:** implementar task a task, deixar o usuário validar o front antes de avançar.

**Goal:** Transformar a homepage em uma experiência de codex RPG com prólogo narrativo, carrosséis redesenhados e UX mobile/desktop polida.

**Architecture:** Todas as mudanças ficam em `HomePage.tsx`, `Carousel.tsx` e `Header.tsx` mais CSS global. Nenhuma rota nova, nenhuma API nova.

**Tech Stack:** React 18, Tailwind CSS (tokens calamity-*), CSS keyframes inline, IntersectionObserver para navbar compacta.

## Global Constraints

- Sem emojis em nenhum componente
- Usar apenas tokens `calamity-*` ou CSS variables — nunca hex hardcoded nos componentes de tema
- Hex hardcoded permitido apenas para cores semânticas de gameplay (raridade, elemento, personagem de lore)
- Mobile-first: base classes para mobile, `md:`/`lg:` para desktop
- Testes Vitest existentes devem continuar 31/31 passando após cada task
- Commits convencionais após cada task validada

---

## Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `src/frontend/src/components/pages/HomePage.tsx` | Seção lore, intro de carrossel, estrutura geral |
| `src/frontend/src/components/ui/Carousel.tsx` | Card fat, layout alternado, animação suave, limite 5 |
| `src/frontend/src/components/common/Header.tsx` | Compactar no scroll mobile |
| `src/frontend/src/index.css` | Keyframe da transição suave |
| `src/frontend/src/components/ui/ScrollToTop.tsx` | Botão novo (criar) |
| `src/frontend/src/components/ui/index.ts` | Exportar ScrollToTop |

---

## Task 1 — Seção de Prólogo (Lore)

**Posição na página:** Entre o Hero e os carrosséis.

**Conteúdo:** texto centralizado, atmosférico, apresentando o universo. Nomes de personagens/inimigos destacados com sua cor temática inline (via `<span style={{ color }}`).

**Cores de personagens (semântica de gameplay, não tema):**
- Calamitas / Supreme Witch → `#c0392b` (brimstone vermelho)
- Yharim → `#d4a017` (dourado)
- Yharon → `#e67e22` (laranja fênix)
- Draedon → `#06b6d4` (ciano máquina)
- Devourer of Gods → `#8e44ad` (roxo cósmico)
- Polterghast → `#7f8c8d` (cinza espectral)

**Arquivo:** `HomePage.tsx` — adicionar componente `<LoreSection />` após o `<Hero>` e antes do primeiro carrossel.

**Texto do prólogo (usar exatamente este conteúdo):**

```
Em uma era em que os deuses governavam com punhos de ferro, um mortal chamado 
[Yharim] decidiu que isso era suficiente. Com a força de um dragão e a 
determinação de quem não tem nada a perder, ele desmontou o panteão divino 
peça por peça — mas o preço da vitória foi a sua própria alma.

Entre os que serviram sob seu estandarte estava [Calamitas] — uma jovem bruxa 
que herdou um poder mágico quase ilimitado ainda na adolescência. Por quase 
uma década ela combateu ao seu lado, revelando-se em cada batalha. Mas quando 
a brutalidade de [Yharim] ultrapassou qualquer propósito nobre, ela partiu — 
não como inimiga, mas como a personificação do seu maior arrependimento.

Agora, enquanto a [Infestação Astral] corrói os biomas, o [Abismo Sulfúrico] 
engole os incautos e as almas perdidas do [Polterghast] uivam nas profundezas 
da Masmorra, você desperta neste mundo sem entender o que está acontecendo.

Mas o mundo de Calamity não espera que você entenda. Ele apenas exige que você 
sobreviva.
```

**Steps:**
- [ ] Criar `<LoreSection />` como subcomponente dentro de `HomePage.tsx`
- [ ] Substituir nomes entre colchetes por `<span style={{ color: COR }}>Nome</span>`
- [ ] Layout: `max-w-3xl mx-auto text-center py-20 px-4`
- [ ] Tipografia: `font-body text-lg md:text-xl leading-relaxed text-calamity-text-secondary`
- [ ] Separadores decorativos: linha fina `border-t border-calamity-border` acima e abaixo
- [ ] Título da seção acima do texto: `"Prólogo"` em `font-display text-xs uppercase tracking-widest text-calamity-text-tertiary`
- [ ] Rodar `npx vitest run` — verificar 31/31
- [ ] Commit: `feat(frontend): add lore prologue section to homepage`

---

## Task 2 — Limite de 5 items + intro text antes de cada carrossel

**Arquivo:** `HomePage.tsx` + `Carousel.tsx`

**Parte A — Limite 5:** em `HomePage.tsx`, ao mapear `weaponItems`, aplicar `.slice(0, 5)`. Nos arrays mock (enemies, biomes, npcs), cortar para no máximo 5 entradas (já temos 4-5, ok).

**Parte B — Intro text:** adicionar ao `SectionHeading` um campo `intro?: string` que renderiza um parágrafo descritivo abaixo do título antes do carrossel.

Intros:
- **Armas:** "As armas do Calamity abrangem cinco classes de combate — Corpo a Corpo, Distância, Magia, Invocação e Assassino. Cada arma carrega um elemento único: Brimstone, Astral, Sombra, Toxico e outros vinte tipos que determinam afinidades e fraquezas dos inimigos."
- **Inimigos:** "O Calamity Mod adiciona dezenas de novos inimigos e mais de cinquenta chefes, cada um com padrões de ataque únicos e drops exclusivos. A progressão vai de criaturas comuns do bioma corrompido até entidades que transcendem o tempo e o espaço."
- **Biomas:** "Biomas novos radicalmente distintos alteram a exploração: o Abismo Sulfúrico afoga em ácido, a Infestação Astral contamina com cristais alienígenas, a Cratera Brimstone queima em chamas infernais. Cada bioma exige equipamento específico para sobrevivência."
- **NPCs:** "Novos NPCs comerciantes desbloqueiam à medida que você progride. Alquimistas, engenheiros e sobreviventes do Abismo oferecem itens exclusivos e serviços impossíveis de encontrar nos vendedores vanilla."

**Steps:**
- [ ] Adicionar prop `intro?: string` em `SectionHeading` — renderizar `<p className="text-calamity-text-secondary font-body mt-2 mb-8 max-w-2xl">` se existir
- [ ] Passar `intro` para cada `<SectionHeading>` no `HomePage.tsx`
- [ ] Aplicar `.slice(0, 5)` em `weaponItems`
- [ ] Rodar `npx vitest run` — 31/31
- [ ] Commit: `feat(frontend): add carousel intro text and limit items to 5`

---

## Task 3 — Card redesenhado: retângulo gordo, imagem preenchida, layout alternado

**Arquivo:** `Carousel.tsx`

**Especificação do card:**
- Portrait gordo: `w-52 h-72` (208×288 px, proporção 13:18, mais "gordo" que o atual 160×240)
- Imagem preenche 100% do portrait (`object-cover w-full h-full absolute inset-0`)
- Quando não há imagem: manter gradiente atual
- Overlay de texto na base do portrait: gradiente escuro de baixo para cima

**Layout alternado:** o índice atual do carrossel determina a posição do portrait:
- Índice par → portrait à esquerda, descrição à direita (atual)
- Índice ímpar → descrição à esquerda, portrait à direita

```tsx
// dentro do Carousel, no render do slide:
const isReversed = current % 2 === 1;

<div className={`flex flex-col sm:flex-row gap-6 items-start ${isReversed ? 'sm:flex-row-reverse' : ''}`}>
  <PortraitCard ... />
  <DescriptionPanel ... />
</div>
```

**Mobile:** sempre empilha `flex-col` (portrait acima, descrição abaixo) — sem alternância no mobile.

**Steps:**
- [ ] Atualizar `PortraitCard`: width `w-52`, height `h-72`, imagem `object-cover` com `opacity-70`
- [ ] Adicionar overlay de texto na base: `absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent`
- [ ] Mover nome/subtitle para dentro do portrait (sobre o overlay) em vez de fora
- [ ] Implementar `isReversed` — `sm:flex-row-reverse` quando ímpar
- [ ] Mobile: `flex-col` base sempre (portrait sempre cima, texto sempre baixo) — sem reverse em mobile
- [ ] Rodar `npx vitest run` — 31/31
- [ ] Commit: `feat(frontend): redesign carousel card — fat portrait, filled image, alternating layout`

---

## Task 4 — Animação de transição suave entre cards

**Arquivo:** `index.css` + `Carousel.tsx`

**Técnica:** ao trocar de slide, aplicar uma classe de saída no card atual (fade + translateX) e entrada no próximo. Usar um `key` no slide para forçar remount com CSS transition.

```css
/* index.css — adicionar em @layer utilities */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-slide-in-right { animation: slideInRight 0.45s ease-out forwards; }
.animate-slide-in-left  { animation: slideInLeft  0.45s ease-out forwards; }
```

No `Carousel.tsx`:
```tsx
const [direction, setDirection] = useState<'right' | 'left'>('right');

const next = useCallback(() => {
  setDirection('right');
  setCurrent(i => (i + 1) % items.length);
}, [items.length]);

const prev = useCallback(() => {
  setDirection('left');
  setCurrent(i => (i - 1 + items.length) % items.length);
}, [items.length]);

// No JSX do slide, adicionar key={current} e classe de animação:
<div key={current} className={direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}>
  {/* portrait + descrição */}
</div>
```

**Steps:**
- [ ] Adicionar os dois `@keyframes` e as classes utilitárias em `index.css`
- [ ] Adicionar estado `direction` no `Carousel.tsx`
- [ ] Atualizar `next` e `prev` para setar `direction` antes de mudar `current`
- [ ] Envolver o slide em `<div key={current} className={...}>` para triggerar a animação
- [ ] Auto-advance usa `next` (direção right) — já está correto
- [ ] Rodar `npx vitest run` — 31/31
- [ ] Commit: `feat(frontend): smooth slide transition with direction-aware animation`

---

## Task 5 — Navbar compacta no scroll (mobile)

**Arquivo:** `Header.tsx`

**Comportamento:**
- No mobile (`< md`): quando `scrollY > 60`, aplicar classe `compact` ao header
- Compact: `py-2` em vez de `py-4`, logo com `text-lg` em vez de `text-xl`, links levemente menores
- No desktop (`md+`): navbar não muda (já é pequena o suficiente)
- Transição suave: `transition-all duration-300`

```tsx
// Header.tsx
const [compact, setCompact] = useState(false);

useEffect(() => {
  const onScroll = () => setCompact(window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

```tsx
<header className={`... transition-all duration-300 ${compact ? 'py-2' : 'py-4'} md:py-4`}>
  <Link className={`... ${compact ? 'text-lg' : 'text-xl'} md:text-2xl`}>
    Terraria Calamity
  </Link>
```

**Steps:**
- [ ] Adicionar `useState(false)` e `useEffect` de scroll no `Header.tsx`
- [ ] Aplicar classes condicionais de padding e tamanho de texto
- [ ] Garantir que `md:py-4` e `md:text-2xl` sobrescrevem as classes compact no desktop
- [ ] Rodar `npx vitest run` — 31/31 (Header test usa `compact` mas não testa scroll, deve passar)
- [ ] Commit: `feat(frontend): compact navbar on scroll for mobile`

---

## Task 6 — Botão Scroll-to-Top

**Arquivo:** `ScrollToTop.tsx` (criar) + `ui/index.ts` + `Layout.tsx` ou `App.tsx`

**Comportamento:**
- Aparece quando `scrollY > 400`
- Posição: `fixed bottom-6 right-6 z-40`
- Visualmente: quadrado `w-10 h-10`, borda `border border-calamity-border`, `bg-calamity-bg-secondary`, seta para cima (SVG)
- Hover: `border-calamity-primary text-calamity-primary`
- Clique: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- Aparece/some com `transition-opacity duration-300` + `opacity-0 pointer-events-none` quando oculto

```tsx
// ScrollToTop.tsx
import { useState, useEffect } from 'react';

const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="13" x2="8" y2="3" />
    <polyline points="3,8 8,3 13,8" />
  </svg>
);

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className={`fixed bottom-6 right-6 z-40 w-10 h-10 flex items-center justify-center
        bg-calamity-bg-secondary border border-calamity-border
        text-calamity-text-secondary hover:text-calamity-primary hover:border-calamity-primary
        transition-all duration-300
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <ArrowUp />
    </button>
  );
};
```

**Onde montar:** `Layout.tsx` (já engloba todas as páginas).

**Steps:**
- [ ] Criar `src/frontend/src/components/ui/ScrollToTop.tsx`
- [ ] Exportar em `ui/index.ts`
- [ ] Importar e montar `<ScrollToTop />` em `Layout.tsx` (fora do `<main>`, dentro do fragment)
- [ ] Rodar `npx vitest run` — 31/31
- [ ] Commit: `feat(frontend): add scroll-to-top button`

---

## Task 7 — Revisão mobile/desktop final

**Arquivo:** `HomePage.tsx`, `Carousel.tsx`

**Checklist mobile (375px):**
- [ ] Lore section: `text-base` no mobile, `text-xl` no desktop
- [ ] Portrait card: no mobile usar `w-full h-48` (retângulo deitado) em vez de `w-52 h-72` vertical
- [ ] Grid de stats: 2 colunas no mobile, 4 no desktop (já configurado)
- [ ] Seção de números: padding menor em mobile
- [ ] Botão scroll-to-top: `bottom-4 right-4` em mobile

**Checklist desktop (1280px):**
- [ ] Lore section: `max-w-3xl` centralizado com `text-xl`
- [ ] Portrait card mostra texto overlay corretamente
- [ ] Alternância de layout visível

**Steps:**
- [ ] Percorrer o checklist acima e ajustar classes
- [ ] Rodar `npx vitest run` — 31/31
- [ ] Commit: `style(frontend): mobile/desktop responsive final pass`

---

## Ordem de execução sugerida

```
Task 1 → Validar front → Task 2 → Validar → Task 3 → Validar → Task 4 → Validar → Task 5+6 → Validar → Task 7
```

Tasks 5 e 6 podem ser feitas juntas pois são independentes e pequenas.
