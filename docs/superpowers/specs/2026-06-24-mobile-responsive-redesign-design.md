# Mobile/Desktop Responsive Redesign — Design Spec

Date: 2026-06-24
Status: Approved for planning

## Problem

The Calamity frontend (`src/frontend`) is desktop-only in practice:
- `Header.tsx` renders all 6 nav links as a horizontal bar with no mobile collapse — wraps awkwardly on narrow screens.
- Filter-heavy pages (Weapons, Items, Enemies, NPCs, Biomes) render filter controls in a `grid md:grid-cols-2 lg:grid-cols-4` block that's always visible, pushing content down on small screens.
- List items render as wide horizontal rows (`flex items-center gap-6`) that don't reflow on narrow viewports.
- There is no light mode — `tailwind.config.js` has no `darkMode` strategy, and `index.css` defines a single dark "mystical" palette in `:root`.
- Per-page color-mapping functions (`getWeaponClassColor`, `getRarityColor`, `getElementColor` in `WeaponsPage.tsx`, etc.) are duplicated ad hoc rather than shared.

This work fixes both the visual identity (per `.claude/skills/visual-identity/SKILL.md`) and mobile/desktop usability across all 7 screens: Home, Weapons, Items, Enemies, Biomes, NPCs, WeaponDetail.

**Correction found during planning:** Only `WeaponsPage` and `WeaponDetailPage` have real data/filters today. `ItemsPage`, `EnemiesPage`, `NPCsPage`, `BiomesPage` are placeholder "em desenvolvimento" screens with no listing or filter UI at all — there is nothing to put behind a filter drawer there yet. `src/components/pages/Home.tsx` is dead code (not referenced by any route in `App.tsx`, which uses `HomePage.tsx` for `/`) and will be deleted as part of this work.

## Goals

- One shared design-token system (color, type, spacing) with working dark **and** light themes, toggle persisted in `localStorage`.
- RPG-minimalist visual language: same Calamity identity (blood-red/gold/purple accents, Cinzel/Crimson Text fonts), restrained decoration, generous spacing — reformulated token values rather than reusing the current "mystical" maximalist styling (heavy glows, golden-ratio type scale).
- Mobile-first responsive layout: collapsible nav drawer, filter bottom-sheet/drawer, card-grid listings — usable with one thumb on a phone, unchanged convenience on desktop.
- No new one-off styling per page; shared components in `components/ui`.

## Non-goals

- Backend changes (covered separately — cold-start resilience already fixed in this branch).
- Pixel-perfect visual regression testing — out of scope; tests cover behavior/accessibility, not screenshots.
- New pages or features beyond the existing 7 screens.

## Design

### 1. Design tokens & theme system

Replace the single dark `:root` palette in `index.css` with paired dark/light CSS variables, switched via a `dark`/`light` class on `<html>` (Tailwind `darkMode: 'class'`):

| Token group | Tokens | Role |
|---|---|---|
| Surface | `bg`, `bg-elevated`, `bg-overlay` | page background, cards, modals/drawers |
| Text | `ink`, `ink-muted`, `ink-faint` | primary/secondary/tertiary text |
| Accent | `accent-blood`, `accent-gold`, `accent-arcane`, `accent-ember`, `accent-toxic` | primary action/MELEE, legendary/highlight, MAGE/special, fire-aligned elements, nature/toxic-aligned elements |
| Border | `border`, `border-strong` | dividers, card outlines |

Each token gets a dark and light value verified for WCAG AA contrast (4.5:1 body text). Decorative glow/gradient effects (`shadow-mystical`, `animate-glow`, mystical-gradient background) are removed except where they encode real state (e.g., legendary-rarity highlight).

Typography keeps Cinzel (display) + Crimson Text (body) — confirmed identity, not replaced. The decorative golden-ratio `fontSize` scale is replaced with a predictable 4px/8px-based modular scale for reliable behavior at small viewport widths.

Theme persistence: read `localStorage.theme`, fall back to `prefers-color-scheme`, default dark. `ThemeToggle` writes the choice and toggles the `<html>` class.

### 2. Shared components (`components/ui`)

New components, used by every page (no page-local variants):

- **`ThemeToggle`** — Radix `Switch` styled with tokens; persists choice.
- **`Drawer`** — Radix `Dialog` styled as a slide-in panel; used for both the mobile nav menu and the mobile filter bottom-sheet (same primitive, different trigger/content).
- **`Badge`** — replaces the duplicated `getWeaponClassColor`/`getRarityColor`/`getElementColor`-style functions; takes a `variant` (rarity/element/class) and value, returns consistently styled badge.
- **`Card`** — single listing-item presentation (icon/image, title, description, badges, stat), used by every page's listing grid.

Radix UI primitives are added as a dependency specifically for `Dialog`/`Switch` — headless, unstyled, so the existing Tailwind+token visual language is unaffected; we get correct focus-trap/ESC/ARIA behavior for free instead of hand-rolling it.

### 3. Navigation

`Header.tsx`: logo + `ThemeToggle` always visible. At `md` (768px) and above, the 6 nav links stay in the current horizontal bar. Below `md`, the links move into the `Drawer` opened by a hamburger icon button (≥44×44px tap target).

### 4. Filters (Weapons only — the only page with real filters today)

At `md` and above, filter controls stay inline at the top (current behavior). Below `md`, filters are hidden behind a "Filtrar (N ativos)" button; tapping opens the same filter controls inside a `Drawer` (bottom-sheet style — anchored bottom, full-width). Filter state and logic are unchanged; only the container/visibility is responsive.

### 5. Listings (Weapons only)

Replace the wide horizontal-row listing (`flex items-center gap-6`) with the new `Card` component in a responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.

### 6. Placeholder pages (Items, Enemies, NPCs, Biomes)

These four pages have no real data or filters yet — restyle only: swap hardcoded `calamity-*` classes for the new token system and type scale, keep the existing "em desenvolvimento" structure (icon, heading, message, back button) as-is. No filter/listing work invented for pages that don't have content yet; the filter/`Card`/`Drawer` pattern from Weapons is the template to reuse once these pages get real data in a future round.

### 7. Home / WeaponDetail

`Home.tsx` is deleted (dead code, unreferenced by any route). `HomePage.tsx` (the actual `/` route) and `WeaponDetailPage.tsx` get no structural change — updated to consume the new tokens, type scale, and `Badge` component (replacing `WeaponDetailPage`'s duplicated `getWeaponClassColor`/`getRarityColor`/`getElementColor` functions).

## Testing

Using the vitest + `@testing-library/react` setup already added to `src/frontend`:

- `ThemeToggle`: toggling persists to `localStorage` and flips the `dark`/`light` class on `<html>`.
- `Drawer`: opens/closes via trigger, closes on `Escape`, traps focus while open.
- `Badge` / `Card`: render correct variant styling/content for given props.
- Integration test for Weapons (the one real filter-bearing page) — filter button opens the drawer on a mobile viewport, listing renders as a grid.

Out of scope: visual/screenshot regression testing.

## Rollout order

One commit/PR per step (detailed in the implementation plan):

1. Tokens + Tailwind config (dark/light) + fonts
2. Shared components: `ThemeToggle`, `Badge`, `Card`, `Drawer`
3. `Header`/`Layout` (mobile nav + theme toggle)
4. Weapons + WeaponDetail (full pattern: filter drawer, card grid, shared `Badge`)
5. Placeholder pages restyle: Items, Enemies, NPCs, Biomes (tokens only, no new functionality)
6. `HomePage` (token/type adjustments) + delete dead `Home.tsx`
