---
tags: [plan, frontend, homepage]
aliases: [Homepage UI Adjustments]
up: "[[INDEX]]"
related:
  - "[[UIComponents]]"
  - "[[2026-06-28-homepage-ui-polish]]"
  - "[[2026-06-28-homepage-lore-carousels]]"
status: ativo
---

# Homepage UI Adjustments Implementation Plan

> Ver também: [[UIComponents]] · segue [[2026-06-28-homepage-ui-polish]] (fecha itens pendentes da branch `style/frontend-homepage-polish`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four remaining issues on the `style/frontend-homepage-polish` branch before creating the PR: animated drawer, light-mode gold color, remove hero subtitle, clean footer copy.

**Architecture:** All changes are in `src/frontend/`. The drawer animation uses CSS `data-state` selectors (Radix UI exposes these natively). The gold color fix changes the single `:root.light` token so every consumer automatically inherits the new value. The copy fixes are single-line deletions/edits.

**Tech Stack:** React 19, Tailwind CSS 3, Radix UI Dialog, Vitest

## Global Constraints

- NEVER use hex colors in component className strings — calamity-* Tailwind tokens only
- NEVER add emojis to components
- Mobile-first layout preserved (hamburger/drawer is mobile-only)
- All 33 tests must pass before each commit
- Branch: `style/frontend-homepage-polish` — commits go here, no branch switch
- Conventional Commits: `style(frontend):`

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `src/frontend/src/index.css` | Modify | Add drawer animation keyframes + data-state CSS; change `--color-accent-gold` in `:root.light` |
| `src/frontend/src/components/ui/Drawer.tsx` | Modify | Add animation class names to Overlay and Content |
| `src/frontend/src/components/pages/HomePage.tsx` | Modify | Remove "Codex — Versao 1.0" `<p>` element |
| `src/frontend/src/components/common/Footer.tsx` | Modify | Remove ❤️ emoji and "com" from text |

---

## Task 1: Drawer Smooth Slide-In Animation

**Files:**
- Modify: `src/frontend/src/index.css` — add keyframes and `.drawer-*` CSS classes after the existing `@layer utilities` block
- Modify: `src/frontend/src/components/ui/Drawer.tsx` — add animation class names to `Dialog.Overlay` and `Dialog.Content`

**Interfaces:**
- Consumes: Radix UI's `data-state="open"` / `data-state="closed"` attributes (set automatically by `@radix-ui/react-dialog`)
- Produces: `Drawer` component with smooth slide-in/out; no public API change

Radix UI sets `data-state="open"` on `Dialog.Content` and `Dialog.Overlay` when the dialog opens, and `data-state="closed"` just before unmounting (giving time for exit animations to complete). The existing `@media (prefers-reduced-motion: reduce)` rule in `index.css` already disables all animations for accessibility — no extra work needed.

- [ ] **Step 1: Add drawer CSS after the `@layer utilities` block in `index.css`**

Find the closing brace of `@layer utilities { ... }` (currently ends around line 162) and insert this block immediately after it:

```css
/* ─── Drawer Animations ─────────────────────────────────── */
@keyframes drawerSlideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes drawerSlideOutRight {
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
}
@keyframes drawerSlideInBottom {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes drawerSlideOutBottom {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}
@keyframes drawerOverlayShow {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes drawerOverlayHide {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.drawer-panel-right[data-state="open"]    { animation: drawerSlideInRight   0.3s  cubic-bezier(0.32, 0.72, 0, 1) forwards; }
.drawer-panel-right[data-state="closed"]  { animation: drawerSlideOutRight  0.22s ease-in                         forwards; }
.drawer-panel-bottom[data-state="open"]   { animation: drawerSlideInBottom  0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
.drawer-panel-bottom[data-state="closed"] { animation: drawerSlideOutBottom 0.22s ease-in                         forwards; }
.drawer-overlay[data-state="open"]        { animation: drawerOverlayShow    0.2s  ease-out                        forwards; }
.drawer-overlay[data-state="closed"]      { animation: drawerOverlayHide    0.15s ease-in                         forwards; }
```

- [ ] **Step 2: Add animation classes to `Drawer.tsx`**

Replace the entire content of `src/frontend/src/components/ui/Drawer.tsx` with:

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: 'right' | 'bottom';
  children: ReactNode;
}

export const Drawer = ({ open, onOpenChange, title, side = 'right', children }: DrawerProps) => {
  const panelPosition =
    side === 'right'
      ? 'inset-y-0 right-0 h-full w-full max-w-sm border-l-2'
      : 'inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg border-t-2';

  const panelAnimation = side === 'right' ? 'drawer-panel-right' : 'drawer-panel-bottom';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 drawer-overlay" />
        <Dialog.Content
          className={`fixed z-50 bg-calamity-bg-secondary border-calamity-border p-6 shadow-mystical-lg focus:outline-none ${panelPosition} ${panelAnimation}`}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold font-display text-calamity-accent-gold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="w-11 h-11 flex items-center justify-center text-calamity-text-secondary hover:text-calamity-primary"
            >
              ✕
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

- [ ] **Step 3: Run tests**

```
cd src/frontend && npx vitest run
```

Expected: **33 passing**. The existing Header tests (`opens the mobile nav drawer`, `closes the drawer after a nav link is clicked`) still pass because the dialog role and aria-labels are unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/src/index.css src/frontend/src/components/ui/Drawer.tsx
git commit -m "style(frontend): smooth slide-in animation for mobile drawer"
```

---

## Task 2: Light Mode Gold Color + Hero Subtitle + Footer Copy

**Files:**
- Modify: `src/frontend/src/index.css` line 57 — change `--color-accent-gold` in `:root.light`
- Modify: `src/frontend/src/components/pages/HomePage.tsx` lines 274–276 — remove subtitle `<p>`
- Modify: `src/frontend/src/components/common/Footer.tsx` line 7 — remove emoji and "com"

**Interfaces:**
- Consumes: nothing new — these are all isolated edits
- Produces: `--color-accent-gold` in light mode resolves to `#6b1414` (deep wine/burgundy) — all consumers (logo, active nav, headings, sidebar dot) inherit automatically

**Why `#6b1414`:** This is a deep wine/burgundy — distinctly non-yellow, with strong contrast on the parchment background (`#f2ede4`). It is darker than the primary crimson (`#9b1c1c`), maintaining visual hierarchy between "hero accent" (gold/wine) and "action/primary" (crimson) in both modes.

- [ ] **Step 1: Change `--color-accent-gold` in `:root.light`**

In `src/frontend/src/index.css`, find line 57:
```css
  --color-accent-gold:         #92600a;
```

Replace with:
```css
  --color-accent-gold:         #6b1414;
```

- [ ] **Step 2: Remove "Codex — Versao 1.0" from the hero**

In `src/frontend/src/components/pages/HomePage.tsx`, find and remove these three lines (the `<p>` just above the `<h1>`):
```tsx
            <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary mb-4">
              Codex — Versao 1.0
            </p>
```

Do not add any replacement — the `<h1>` immediately follows.

- [ ] **Step 3: Fix footer copy**

In `src/frontend/src/components/common/Footer.tsx`, find line 7:
```tsx
        <p>&copy; {currentYear} Terraria Calamity RPG. Desenvolvido com ❤️ por Giovanni Moreira</p>
```

Replace with:
```tsx
        <p>&copy; {currentYear} Terraria Calamity RPG. Desenvolvido por Giovanni Moreira</p>
```

- [ ] **Step 4: Run tests**

```
cd src/frontend && npx vitest run
```

Expected: **33 passing**. The `HomePage.test.tsx` only asserts on the h1 heading — the removed `<p>` is not tested. `Footer.tsx` has no test file.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/index.css
git add src/frontend/src/components/pages/HomePage.tsx
git add src/frontend/src/components/common/Footer.tsx
git commit -m "style(frontend): wine accent for light mode, remove codex subtitle, clean footer"
```

---

## Self-Review

**Spec coverage:**
- [x] Mobile drawer slide-in animation — Task 1
- [x] Light mode gold/yellow replaced (navbar logo + active links via token) — Task 2
- [x] Remove "Codex — Versao 1.0" — Task 2
- [x] Footer: remove ❤️ and "com" — Task 2

**Placeholder scan:** None found — all steps have exact code.

**Type consistency:** No new interfaces introduced; `Drawer` props unchanged.
