---
tags: [plan, frontend, homepage]
aliases: [Homepage UI Polish]
up: "[[INDEX]]"
related:
  - "[[UIComponents]]"
  - "[[Carousel]]"
  - "[[2026-06-28-homepage-adjustments]]"
  - "[[2026-06-28-homepage-lore-carousels]]"
status: ativo
---

# Homepage UI Polish Implementation Plan

> Ver também: [[UIComponents]] · [[Carousel]] · seguido por [[2026-06-28-homepage-adjustments]] (fecha itens pendentes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the homepage visual quality with a desktop sidebar, animated hamburger, consistent light mode, bigger section headings, square carousel portraits, and centered descriptions.

**Architecture:** All changes are isolated to `src/frontend/`. The sidebar is a new component rendered inside `HomePage` with fixed positioning (desktop-only). CSS token changes are centralized in `index.css`. No new routes or API calls.

**Tech Stack:** React 19, Tailwind CSS 3, TypeScript, Vitest + Testing Library

## Global Constraints

- NEVER use hex colors in theme-related component classes — use `calamity-*` Tailwind tokens only
- Exception: lore character colors (LORE_COLORS) and gameplay semantics (RARITY_ACCENT) may keep hex
- NEVER use emojis in components
- Mobile-first: base classes for mobile, `sm:`/`md:`/`lg:`/`xl:` for larger screens
- Conventional Commits: `style(frontend):`, `feat(frontend):`, `fix(frontend):`
- All 31 existing tests must pass before each commit; the count becomes 33 after Task 6

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/frontend/src/index.css` | Modify | Light mode CSS variables, remove `text-glow-gold` from utilities section is NOT done here — only variable rewrite |
| `src/frontend/src/components/common/Header.tsx` | Modify | Remove logo glow, white+gold hover, animated hamburger |
| `src/frontend/src/components/ui/Carousel.tsx` | Modify | Square portrait card dimensions, centered description panel |
| `src/frontend/src/components/pages/HomePage.tsx` | Modify | Section IDs, remove hero glow, bigger SectionHeading, add PageSidebar |
| `src/frontend/src/components/ui/PageSidebar.tsx` | Create | Fixed desktop sidebar with scroll-to-section and active state |
| `src/frontend/src/components/ui/index.ts` | Modify | Export PageSidebar |
| `src/frontend/src/components/ui/PageSidebar.test.tsx` | Create | 2 tests covering render and click-to-scroll |

---

## Task 1: Light Mode CSS Variables Overhaul

**Files:**
- Modify: `src/frontend/src/index.css` (lines 43–67, the `:root.light` block)

**Interfaces:**
- Consumes: nothing
- Produces: updated CSS custom properties consumed by all calamity-* Tailwind tokens

The current light mode (`#f0ede7` / `#fafaf8` backgrounds, `#94a3b8` text-tertiary) creates jarring contrast. The new palette uses warm parchment backgrounds and strongly darkened text and accent colors.

- [ ] **Step 1: Replace the `:root.light` block in `index.css`**

Find and replace the entire `:root.light { ... }` block (lines 43–67) with:

```css
:root.light {
  --color-primary:       #9b1c1c;
  --color-primary-light: #b91c1c;
  --color-primary-dark:  #7b1818;

  /* Parchment-warm backgrounds */
  --color-bg-dark:      #eae5dc;
  --color-bg-secondary: #f2ede4;
  --color-bg-tertiary:  #dfd9ce;

  /* Accents darkened for legibility on light bg */
  --color-accent-purple:       #6d28d9;
  --color-accent-purple-light: #7c3aed;
  --color-accent-purple-dark:  #4c1d95;
  --color-accent-gold:         #92600a;
  --color-accent-green:        #166534;
  --color-accent-blue:         #1e40af;
  --color-accent-cyan:         #0e7490;

  /* Text — warm dark, high contrast */
  --color-text-primary:   #1a1510;
  --color-text-secondary: #3d3020;
  --color-text-tertiary:  #6e5c40;

  /* Borders */
  --color-border:       #c5bdb0;
  --color-border-light: #a8a29a;
}
```

- [ ] **Step 2: Run tests to verify nothing broke**

```
cd src/frontend && npx vitest run
```

Expected: 31 passing, 0 failing.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/src/index.css
git commit -m "style(frontend): redesign light mode palette for softer parchment contrast"
```

---

## Task 2: Header — Remove Logo Glow, White+Gold Hover, Animated Hamburger

**Files:**
- Modify: `src/frontend/src/components/common/Header.tsx`

**Interfaces:**
- Consumes: `Drawer`, `ThemeToggle`, `tabs` array (unchanged)
- Produces: updated `Header` export — same public API, visual changes only

Changes: (1) Remove `text-glow-gold` from the logo link. (2) Active link: crimson → gold. (3) Hover link: crimson text → white text, gold underline (was already gold, no change). (4) Replace static `HamburgerIcon` SVG with animated div-based icon that morphs to X when the drawer is open.

- [ ] **Step 1: Rewrite `Header.tsx` with all changes**

Replace the entire file content with:

```tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';

const tabs = [
  { label: 'Inicio', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

interface HamburgerIconProps {
  isOpen: boolean;
}

const HamburgerIcon = ({ isOpen }: HamburgerIconProps) => (
  <span className="block w-5 h-[14px] relative" aria-hidden="true">
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current top-1/2 -translate-y-1/2',
        'transition-all duration-200 ease-in-out',
        isOpen ? 'opacity-0 scale-x-0' : '',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0',
      ].join(' ')}
    />
  </span>
);

export const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = (onNavigate?: () => void) =>
    tabs.map((tab) => (
      <Link
        key={tab.path}
        to={tab.path}
        onClick={onNavigate}
        className={`text-sm font-display uppercase tracking-wider transition-all duration-300 pb-1 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-accent-gold border-calamity-accent-gold'
            : 'text-calamity-text-secondary border-transparent hover:text-white hover:border-calamity-accent-gold'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b border-calamity-border sticky top-0 z-50 transition-all duration-300">
      <div
        className={`container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300 ${
          compact ? 'py-2' : 'py-4'
        } md:py-4`}
      >
        <Link
          to="/"
          className={`font-bold font-display text-calamity-accent-gold hover:opacity-90 transition-all duration-300 ${
            compact ? 'text-lg' : 'text-xl'
          } md:text-2xl`}
        >
          Terraria Calamity
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-calamity-text-primary border border-calamity-border hover:border-calamity-primary transition-colors duration-300"
          >
            <HamburgerIcon isOpen={menuOpen} />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav className="flex flex-col gap-6">{renderLinks(() => setMenuOpen(false))}</nav>
      </Drawer>
    </header>
  );
};
```

- [ ] **Step 2: Run tests — both Header tests must still pass**

```
cd src/frontend && npx vitest run
```

Expected: 31 passing. The `Header.test.tsx` tests check `aria-label="Abrir menu de navegação"` which is unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/src/components/common/Header.tsx
git commit -m "style(frontend): remove logo glow, white+gold hover, animate hamburger to X"
```

---

## Task 3: Carousel — Square Portrait Card + Centered Description

**Files:**
- Modify: `src/frontend/src/components/ui/Carousel.tsx`

**Interfaces:**
- Consumes: `CarouselItem[]`, `layout` prop (unchanged)
- Produces: same `Carousel` export — no interface changes, visual only

Changes: (1) `PortraitCard` dimensions become a larger square. (2) Description panel drops the forced minimum height and uses `justify-start gap-4` instead of `justify-between` so content doesn't spread out with empty space at the bottom.

- [ ] **Step 1: Change PortraitCard dimensions in `Carousel.tsx`**

Find line 30 in `Carousel.tsx`:
```tsx
        'relative flex-shrink-0 w-full sm:w-52 h-48 sm:h-72',
```

Replace with:
```tsx
        'relative flex-shrink-0 w-full h-56 sm:w-64 sm:h-64',
```

- [ ] **Step 2: Change description panel layout**

Find line 140:
```tsx
        <div className="flex-1 flex flex-col justify-between py-1 sm:min-h-[288px]">
```

Replace with:
```tsx
        <div className="flex-1 flex flex-col justify-start gap-4 py-1">
```

Then find line 162 (the "Ver detalhes" Link — `mt-4` can stay since it's now relative to last flex item):
```tsx
          <Link
            to={item.href}
            className="self-start mt-4 text-xs font-display uppercase tracking-widest border-b pb-px transition-colors duration-300"
```

Replace `mt-4` with `mt-2` since `gap-4` already provides spacing:
```tsx
          <Link
            to={item.href}
            className="self-start mt-2 text-xs font-display uppercase tracking-widest border-b pb-px transition-colors duration-300"
```

- [ ] **Step 3: Run tests**

```
cd src/frontend && npx vitest run
```

Expected: 31 passing.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/src/components/ui/Carousel.tsx
git commit -m "style(frontend): square portrait card, remove empty space in carousel description"
```

---

## Task 4: HomePage — Section IDs, Remove Hero Glow, Bigger Headings, Add Sidebar Slot

**Files:**
- Modify: `src/frontend/src/components/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `PageSidebar` (created in Task 5) — import it here
- Produces: same `HomePage` export; adds `id` attributes to sections

**Important:** `PageSidebar` does not exist yet. Add its import with a comment. Task 5 creates the file, and after that the import resolves. Alternatively, do Tasks 4 and 5 in sequence without committing Task 4 until Task 5 is done.

- [ ] **Step 1: Add `id` to `LoreSection`'s `<section>` element**

Find in `HomePage.tsx` (line 22):
```tsx
  <section className="py-12 md:py-20 border-b border-calamity-border">
```

Replace with:
```tsx
  <section id="lore" className="py-12 md:py-20 border-b border-calamity-border">
```

- [ ] **Step 2: Update `SectionHeading` font size**

Find (lines 213–216):
```tsx
        <h2 className="text-2xl md:text-3xl font-bold font-display text-calamity-text-primary">
```

Replace with:
```tsx
        <h2 className="text-3xl md:text-4xl font-bold font-display text-calamity-text-primary">
```

- [ ] **Step 3: Remove `text-glow-gold` from hero h1 and add section IDs**

Find hero h1 (line 264):
```tsx
            <h1 className="text-5xl md:text-7xl font-bold font-display text-calamity-accent-gold text-glow-gold mb-6 animate-fade-in leading-none">
```

Replace with:
```tsx
            <h1 className="text-5xl md:text-7xl font-bold font-display text-calamity-accent-gold mb-6 animate-fade-in leading-none">
```

Find the hero `<section>` opening tag (line 258):
```tsx
      <section className="relative overflow-hidden py-16 md:py-24 bg-calamity-bg-secondary border-b border-calamity-border">
```

Replace with:
```tsx
      <section id="hero" className="relative overflow-hidden py-16 md:py-24 bg-calamity-bg-secondary border-b border-calamity-border">
```

- [ ] **Step 4: Add `id` attributes to the remaining sections**

Find (line 301):
```tsx
      <section className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Armas em Destaque"
```

Replace with:
```tsx
      <section id="armas" className="py-16 border-b border-calamity-border">
```

Find (line 335):
```tsx
      <section className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Inimigos"
```

Replace with:
```tsx
      <section id="inimigos" className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
```

Find (line 349):
```tsx
      <section className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="Biomas"
```

Replace with:
```tsx
      <section id="biomas" className="py-16 border-b border-calamity-border">
```

Find (line 363):
```tsx
      <section className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading
            title="NPCs"
```

Replace with:
```tsx
      <section id="npcs" className="py-16 bg-calamity-bg-secondary border-b border-calamity-border">
```

Find (line 377):
```tsx
      <section className="py-16 border-b border-calamity-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-calamity-accent-gold mb-10 text-center">
              A Historia do Calamity
```

Replace with:
```tsx
      <section id="historia" className="py-16 border-b border-calamity-border">
```

Find (line 411):
```tsx
      <section className="py-16 bg-calamity-bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-calamity-border max-w-3xl mx-auto">
```

Replace with:
```tsx
      <section id="stats" className="py-16 bg-calamity-bg-secondary">
```

- [ ] **Step 5: Add `PageSidebar` import and usage**

Add this import at the top of `HomePage.tsx` (after existing imports):
```tsx
import { PageSidebar } from '../ui/PageSidebar';
```

Add the sidebar sections constant before `HomePage` component:
```tsx
const SIDEBAR_SECTIONS = [
  { id: 'hero',     label: 'Inicio' },
  { id: 'lore',     label: 'Prologo' },
  { id: 'armas',    label: 'Armas' },
  { id: 'inimigos', label: 'Inimigos' },
  { id: 'biomas',   label: 'Biomas' },
  { id: 'npcs',     label: 'NPCs' },
  { id: 'historia', label: 'Historia' },
  { id: 'stats',    label: 'Stats' },
];
```

Inside the `HomePage` return, add `<PageSidebar>` immediately after the opening `<div>` (line 255):

Find:
```tsx
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary">

      {/* ── Hero ─────────────────────────────────────────── */}
```

Replace with:
```tsx
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary">
      <PageSidebar sections={SIDEBAR_SECTIONS} />

      {/* ── Hero ─────────────────────────────────────────── */}
```

- [ ] **Step 6: Run tests (after Task 5 is complete — see note)**

```
cd src/frontend && npx vitest run
```

Expected: 33 passing (31 original + 2 PageSidebar tests added in Task 6).

- [ ] **Step 7: Commit Tasks 4+5+6 together (they are interdependent)**

Wait until Tasks 5 and 6 are done, then:
```bash
git add src/frontend/src/components/pages/HomePage.tsx
git add src/frontend/src/components/ui/PageSidebar.tsx
git add src/frontend/src/components/ui/PageSidebar.test.tsx
git add src/frontend/src/components/ui/index.ts
git commit -m "feat(frontend): desktop sidebar + section IDs, remove hero glow, bigger headings"
```

---

## Task 5: PageSidebar — New Desktop-Only Floating Navigation Component

**Files:**
- Create: `src/frontend/src/components/ui/PageSidebar.tsx`
- Modify: `src/frontend/src/components/ui/index.ts`

**Interfaces:**
- Consumes: `sections: Array<{ id: string; label: string }>` prop from `HomePage`
- Produces: `export const PageSidebar` — used by `HomePage.tsx`

The sidebar is fixed on the right side of the viewport, centered vertically. It uses dots + labels: the label is invisible by default and fades in on hover (or when the section is active). The `IntersectionObserver` tracks which section is currently visible with a rootMargin that fires when a section reaches ~30% from the top of the viewport.

- [ ] **Step 1: Create `PageSidebar.tsx`**

Create file at `src/frontend/src/components/ui/PageSidebar.tsx`:

```tsx
import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface PageSidebarProps {
  sections: Section[];
}

export const PageSidebar = ({ sections }: PageSidebarProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Navegacao por secoes"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-1.5"
    >
      {sections.map(({ id, label }) => {
        const isActive = id === activeId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={[
              'group flex items-center justify-end gap-2 py-1',
              'transition-all duration-200',
              isActive
                ? 'text-calamity-accent-gold'
                : 'text-calamity-text-tertiary hover:text-calamity-text-secondary',
            ].join(' ')}
          >
            <span
              className={[
                'text-xs font-display uppercase tracking-widest whitespace-nowrap',
                'transition-opacity duration-200',
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              ].join(' ')}
            >
              {label}
            </span>
            <span
              className={[
                'block rounded-full flex-shrink-0 transition-all duration-200',
                isActive
                  ? 'w-2 h-2 bg-calamity-accent-gold'
                  : 'w-1.5 h-1.5 bg-current group-hover:w-2 group-hover:h-2',
              ].join(' ')}
            />
          </button>
        );
      })}
    </aside>
  );
};
```

- [ ] **Step 2: Add `PageSidebar` to barrel export in `index.ts`**

In `src/frontend/src/components/ui/index.ts`, add at the end:

```ts
export { PageSidebar } from './PageSidebar';
```

---

## Task 6: PageSidebar Tests

**Files:**
- Create: `src/frontend/src/components/ui/PageSidebar.test.tsx`

**Interfaces:**
- Consumes: `PageSidebar` from `./PageSidebar`
- Produces: 2 new tests; total goes from 31 → 33

jsdom does not ship `IntersectionObserver`, so we must mock it before each test. We also mock `document.getElementById` + `scrollIntoView` to verify scroll behavior without actual DOM layout.

- [ ] **Step 1: Create `PageSidebar.test.tsx`**

Create file at `src/frontend/src/components/ui/PageSidebar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageSidebar } from './PageSidebar';

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  })) as unknown as typeof IntersectionObserver;
});

const SECTIONS = [
  { id: 'hero',     label: 'Inicio' },
  { id: 'armas',    label: 'Armas' },
  { id: 'inimigos', label: 'Inimigos' },
];

describe('PageSidebar', () => {
  it('renders a button for each section', () => {
    render(<PageSidebar sections={SECTIONS} />);

    expect(screen.getByRole('button', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /armas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inimigos/i })).toBeInTheDocument();
  });

  it('calls scrollIntoView on the target element when a button is clicked', () => {
    const mockScrollIntoView = vi.fn();
    const mockEl = { scrollIntoView: mockScrollIntoView } as unknown as HTMLElement;

    vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'armas' ? mockEl : null
    );

    render(<PageSidebar sections={SECTIONS} />);
    fireEvent.click(screen.getByRole('button', { name: /armas/i }));

    expect(mockScrollIntoView).toHaveBeenCalledOnce();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
```

- [ ] **Step 2: Run all tests — expect 33 passing**

```
cd src/frontend && npx vitest run
```

Expected output: `33 passed` — the 31 original tests plus the 2 new PageSidebar tests.

- [ ] **Step 3: Commit all interdependent files together (Tasks 4 + 5 + 6)**

```bash
git add src/frontend/src/components/pages/HomePage.tsx
git add src/frontend/src/components/ui/PageSidebar.tsx
git add src/frontend/src/components/ui/PageSidebar.test.tsx
git add src/frontend/src/components/ui/index.ts
git commit -m "feat(frontend): desktop sidebar + section IDs, remove hero glow, bigger headings"
```

---

## Self-Review Checklist

- [x] **Sidebar** — `PageSidebar` component with section scroll and IntersectionObserver ✓
- [x] **Navbar hover** — `hover:text-white hover:border-calamity-accent-gold` ✓
- [x] **Navbar active** — gold text + gold underline (not crimson) ✓
- [x] **Title glow removed** — Logo link and hero h1 both have `text-glow-gold` removed ✓
- [x] **Light mode** — new parchment palette, darker text tokens ✓
- [x] **Section titles bigger** — `text-3xl md:text-4xl` ✓
- [x] **Portrait card square** — `h-56 sm:w-64 sm:h-64` ✓
- [x] **Description centered** — `justify-start gap-4`, no forced min-height ✓
- [x] **Hamburger animation** — span-based X morph with CSS transitions ✓
- [x] **No hex in theme components** — `text-white` is non-theme (always white, fine for hover); all backgrounds/borders use tokens ✓
- [x] **Tests** — 31 existing unchanged + 2 new = 33 total ✓
- [x] **Type consistency** — `Section` interface defined in `PageSidebar.tsx`, prop passed from `SIDEBAR_SECTIONS` constant in `HomePage.tsx` ✓
