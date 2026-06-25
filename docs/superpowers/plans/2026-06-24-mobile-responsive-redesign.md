# Mobile/Desktop Responsive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Calamity frontend (`src/frontend`) usable and visually consistent on both mobile and desktop, with a working dark/light theme, per the approved spec at `docs/superpowers/specs/2026-06-24-mobile-responsive-redesign-design.md`.

**Architecture:** Wire the existing `calamity-*` Tailwind color tokens to CSS variables with a light-mode override block (zero changes to consuming files), then layer in shared Radix-based `ThemeToggle`/`Drawer`/`Badge` components, then apply mobile nav + filter-drawer + card-grid patterns to `Header` and `WeaponsPage` (the only page with real filters/listing today), then do light cosmetic passes on the remaining pages.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS 3.4, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-switch`), vitest + `@testing-library/react` (already configured this session).

## Global Constraints

- All work happens in `C:\Projetos\Terraria_Calamity_Backend\src\frontend`.
- No new one-off page-local styling — every visual change reuses the shared `calamity-*` tokens / `components/ui` primitives.
- No `dark:` / `light:` Tailwind variant utilities are introduced — theme switching is done entirely via CSS variables keyed off a `dark`/`light` class on `<html>` (set by `src/lib/theme.ts`). `darkMode: 'class'` is still set in `tailwind.config.js` for forward compatibility, but this plan does not rely on it.
- WCAG AA contrast (4.5:1) for body text in both themes.
- TDD throughout: write the test, watch it fail, implement, watch it pass, then commit. Run `npx vitest run --config vitest.config.ts <path>` (from `src/frontend`) for each task's tests, and `npx tsc -b` + `npx vite build` once at the end of the plan to confirm the whole app still typechecks and builds.
- One commit per task.

---

### Task 1: Wire Tailwind tokens to theme-aware CSS variables + drop decorative type scale

**Files:**
- Modify: `src/frontend/tailwind.config.js`
- Modify: `src/frontend/src/index.css`
- Modify: `src/frontend/index.html`

**Interfaces:**
- Produces: every existing `calamity-*` Tailwind utility class (e.g. `bg-calamity-bg-dark`, `text-calamity-accent-gold`) now reads from a CSS variable that flips value when `<html>` has class `light` vs `dark`. Later tasks rely on this — they do not need their own light-mode variants.

- [ ] **Step 1: Update `tailwind.config.js`** — set `darkMode: 'class'`, point every `calamity.*` color at the matching CSS variable instead of a hardcoded hex, and remove the unused decorative tokens (`fontSize` golden-ratio override, `backgroundImage.mystical-gradient`, `boxShadow.glow-gold`, `animation.glow`/`fade-in-up` and their keyframes — confirmed unused via `grep -r "mystical-gradient\|animate-glow\b\|glow-gold\|fade-in-up" src/frontend/src`, zero matches). Keep `fontFamily`, `spacing.ma`/`ma-lg`, `animation.fade-in`/`slow-spin` and their keyframes, and `boxShadow.mystical`/`mystical-lg` — all confirmed still used:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'calamity': {
          'bg-dark': 'var(--color-bg-dark)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary': 'var(--color-bg-tertiary)',

          'primary': 'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-dark': 'var(--color-primary-dark)',

          'accent-purple': 'var(--color-accent-purple)',
          'accent-gold': 'var(--color-accent-gold)',
          'accent-green': 'var(--color-accent-green)',
          'accent-cyan': 'var(--color-accent-cyan)',

          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-tertiary)',

          'border': 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
        },
      },
      fontFamily: {
        'display': ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        'body': ['"Crimson Text"', '"Libre Baskerville"', 'serif'],
        'accent': ['"Marcellus SC"', 'serif'],
      },
      spacing: {
        'ma': '15%',
        'ma-lg': '20%',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in',
        'slow-spin': 'spin 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
      boxShadow: {
        'mystical': '0 0 20px rgba(139, 0, 0, 0.3)',
        'mystical-lg': '0 0 40px rgba(139, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
```

Removing the custom `fontSize` block means `text-xs` … `text-6xl` fall back to Tailwind's built-in modular scale (e.g. `5xl` = 3rem/1, `6xl` = 3.75rem/1) — predictable at small viewport widths, replacing the golden-ratio decorative scale per the spec.

- [ ] **Step 2: Add the `:root.light` override block to `index.css`**, directly below the existing `:root` block (leave the existing dark `:root` values as the default/dark theme — do not change them):

```css
:root.light {
  --color-primary: #a30000;
  --color-primary-light: #c41e1e;
  --color-primary-dark: #800000;

  --color-bg-dark: #f3ede4;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #e8ded2;

  --color-accent-purple: #5a189a;
  --color-accent-gold: #8a6508;
  --color-accent-green: #45591f;
  --color-accent-cyan: #2f5b5d;

  --color-text-primary: #2a1810;
  --color-text-secondary: #5c4a3a;
  --color-text-tertiary: #8a7a6a;

  --color-border: #d8c8b8;
  --color-border-light: #c0a890;
}
```

(`--color-accent-gold`/`-purple`/`-green`/`-cyan` are darkened relative to their dark-mode hex so they keep AA-level contrast as text color against the light parchment background; `--color-primary` is likewise adjusted for contrast while staying recognizably "blood red".)

- [ ] **Step 3: Update `index.html`** — change `<meta name="color-scheme" content="dark">` to `content="dark light"`, and add an inline anti-FOUC script as the first thing inside `<head>` (right after `<meta charset>`) that applies the correct theme class before any paint:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('calamity-theme');
          var theme = stored === 'light' || stored === 'dark'
            ? stored
            : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
          document.documentElement.classList.add(theme);
        } catch (e) {
          document.documentElement.classList.add('dark');
        }
      })();
    </script>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Terraria Calamity RPG - Um arsenal místico de armas do mod Calamity adaptado para RPG de mesa" />
    <meta name="theme-color" content="#1a0f0f" />
    <meta name="color-scheme" content="dark light" />
    <title>Terraria Calamity RPG - Arsenal Místico</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

The `'calamity-theme'` localStorage key here must match exactly what `src/lib/theme.ts` uses in Task 2 — that's where the real read/write logic lives; this inline script is a deliberate, minimal duplicate solely to avoid a flash of the wrong theme before React mounts.

- [ ] **Step 4: Verify nothing broke.** Run the dev build and confirm it compiles, then sanity-check theme switching manually:

```bash
cd src/frontend
npx vite build
```
Expected: build succeeds with no Tailwind/PostCSS errors.

Then run `npx vite preview`, open the printed URL, open devtools, run `document.documentElement.classList.add('light')` in the console, and confirm the page background/text/borders visibly change (this is the manual check the spec calls for — no automated visual test).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/tailwind.config.js src/frontend/src/index.css src/frontend/index.html
git commit -m "feat(frontend): wire calamity tokens to theme-aware CSS variables"
```

---

### Task 2: `theme.ts` persistence utility

**Files:**
- Create: `src/frontend/src/lib/theme.ts`
- Test: `src/frontend/src/lib/theme.test.ts`
- Modify: `src/frontend/src/test/setup.ts` (add a `matchMedia` stub — jsdom doesn't implement it)

**Interfaces:**
- Produces: `Theme = 'dark' | 'light'`, `getInitialTheme(): Theme`, `applyTheme(theme: Theme): void`, storage key `'calamity-theme'` (must match the inline script from Task 1, Step 3).
- Consumed by: `ThemeToggle` (Task 3).

- [ ] **Step 1: Add a `matchMedia` stub to the test setup** (jsdom has no `window.matchMedia`; without this, any test that imports `theme.ts` throws):

```ts
import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 2: Write the failing test** — create `src/frontend/src/lib/theme.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialTheme, applyTheme } from './theme';

describe('theme persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('returns the stored theme when one exists', () => {
    localStorage.setItem('calamity-theme', 'light');
    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to the system preference when nothing is stored', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);
    expect(getInitialTheme()).toBe('light');
  });

  it('defaults to dark when there is no stored value and no light preference', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    expect(getInitialTheme()).toBe('dark');
  });

  it('applyTheme persists the choice and toggles the html classes', () => {
    applyTheme('light');
    expect(localStorage.getItem('calamity-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    applyTheme('dark');
    expect(localStorage.getItem('calamity-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/lib/theme.test.ts
```
Expected: FAIL — `Cannot find module './theme'`.

- [ ] **Step 4: Implement `src/frontend/src/lib/theme.ts`**

```ts
export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'calamity-theme';

const getStoredTheme = (): Theme | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
};

const getPreferredTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export const getInitialTheme = (): Theme => getStoredTheme() ?? getPreferredTheme();

export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  localStorage.setItem(STORAGE_KEY, theme);
};
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/lib/theme.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/lib/theme.ts src/frontend/src/lib/theme.test.ts src/frontend/src/test/setup.ts
git commit -m "feat(frontend): add theme persistence utility with system-preference fallback"
```

---

### Task 3: `ThemeToggle` component

**Files:**
- Create: `src/frontend/src/components/ui/ThemeToggle.tsx`
- Test: `src/frontend/src/components/ui/ThemeToggle.test.tsx`
- Modify: `src/frontend/src/components/ui/index.ts` (export it)
- Modify: `src/frontend/package.json` (new dependency)

**Interfaces:**
- Consumes: `getInitialTheme`, `applyTheme`, `Theme` from `../../lib/theme` (Task 2).
- Produces: `<ThemeToggle />` — no props. Used by `Header` (Task 6).

- [ ] **Step 1: Install the Radix Switch primitive**

```bash
cd src/frontend
npm install @radix-ui/react-switch
```

- [ ] **Step 2: Write the failing test** — create `src/frontend/src/components/ui/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('defaults to dark mode', () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('switches to light mode when clicked and persists the choice', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('switch'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('calamity-theme')).toBe('light');
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/ThemeToggle.test.tsx
```
Expected: FAIL — `Cannot find module './ThemeToggle'`.

- [ ] **Step 4: Implement `src/frontend/src/components/ui/ThemeToggle.tsx`**

```tsx
import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState } from 'react';
import { applyTheme, getInitialTheme, Theme } from '../../lib/theme';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true">🌙</span>
      <Switch.Root
        checked={theme === 'light'}
        onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
        aria-label="Alternar entre modo claro e escuro"
        className="w-11 h-6 rounded-full bg-calamity-bg-tertiary border border-calamity-border relative data-[state=checked]:bg-calamity-accent-gold transition-colors"
      >
        <Switch.Thumb className="block w-4 h-4 rounded-full bg-calamity-text-primary translate-x-1 transition-transform data-[state=checked]:translate-x-6" />
      </Switch.Root>
      <span aria-hidden="true">☀️</span>
    </div>
  );
};
```

- [ ] **Step 5: Export it from the barrel** — add to `src/frontend/src/components/ui/index.ts`:

```ts
export { ThemeToggle } from './ThemeToggle';
```

- [ ] **Step 6: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/ThemeToggle.test.tsx
```
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/frontend/package.json src/frontend/package-lock.json src/frontend/src/components/ui/ThemeToggle.tsx src/frontend/src/components/ui/ThemeToggle.test.tsx src/frontend/src/components/ui/index.ts
git commit -m "feat(frontend): add ThemeToggle component"
```

---

### Task 4: `Drawer` component (mobile nav panel + filter bottom-sheet)

**Files:**
- Create: `src/frontend/src/components/ui/Drawer.tsx`
- Test: `src/frontend/src/components/ui/Drawer.test.tsx`
- Modify: `src/frontend/src/components/ui/index.ts`
- Modify: `src/frontend/package.json`

**Interfaces:**
- Produces: `<Drawer open={boolean} onOpenChange={(open: boolean) => void} title={string} side={'right' | 'bottom'} children={ReactNode} />`. `side` defaults to `'right'`. Used by `Header` (Task 6, `side="right"`) and `WeaponsPage` (Task 8, `side="bottom"`).

- [ ] **Step 1: Install the Radix Dialog primitive**

```bash
cd src/frontend
npm install @radix-ui/react-dialog
```

- [ ] **Step 2: Write the failing test** — create `src/frontend/src/components/ui/Drawer.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders the title and children when open', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} onOpenChange={() => {}} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    fireEvent.keyDown(screen.getByText('Conteúdo'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when the close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/Drawer.test.tsx
```
Expected: FAIL — `Cannot find module './Drawer'`.

- [ ] **Step 4: Implement `src/frontend/src/components/ui/Drawer.tsx`**

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          className={`fixed z-50 bg-calamity-bg-secondary border-calamity-border p-6 shadow-mystical-lg focus:outline-none ${panelPosition}`}
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

- [ ] **Step 5: Export it from the barrel** — add to `src/frontend/src/components/ui/index.ts`:

```ts
export { Drawer } from './Drawer';
```

- [ ] **Step 6: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/Drawer.test.tsx
```
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/frontend/package.json src/frontend/package-lock.json src/frontend/src/components/ui/Drawer.tsx src/frontend/src/components/ui/Drawer.test.tsx src/frontend/src/components/ui/index.ts
git commit -m "feat(frontend): add Drawer component for mobile nav and filter sheets"
```

---

### Task 5: `Badge` component

**Files:**
- Create: `src/frontend/src/components/ui/Badge.tsx`
- Test: `src/frontend/src/components/ui/Badge.test.tsx`
- Modify: `src/frontend/src/components/ui/index.ts`

**Interfaces:**
- Produces: `<Badge variant={'class' | 'element' | 'rarity'} value={string} />`. Consumed by `WeaponCard` (Task 7) and `WeaponDetailPage` (Task 9), replacing their duplicated `getWeaponClassColor`/`getRarityColor`/`getElementColor` functions.

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/ui/Badge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the value as uppercase text', () => {
    render(<Badge variant="rarity" value="LEGENDARY" />);
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('applies a known variant color', () => {
    render(<Badge variant="class" value="MELEE" />);
    expect(screen.getByText('MELEE')).toHaveClass('text-red-400');
  });

  it('falls back to a neutral color for an unknown value', () => {
    render(<Badge variant="element" value="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toHaveClass('text-gray-400');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/Badge.test.tsx
```
Expected: FAIL — `Cannot find module './Badge'`.

- [ ] **Step 3: Implement `src/frontend/src/components/ui/Badge.tsx`** (color maps ported verbatim from the duplicated functions in `WeaponsPage.tsx`/`WeaponDetailPage.tsx`, now defined once):

```tsx
type BadgeVariant = 'class' | 'element' | 'rarity';

const VARIANT_COLORS: Record<BadgeVariant, Record<string, string>> = {
  class: {
    MELEE: 'bg-red-600/20 text-red-400',
    RANGED: 'bg-cyan-600/20 text-cyan-400',
    MAGE: 'bg-blue-600/20 text-blue-400',
    SUMMON: 'bg-yellow-600/20 text-yellow-400',
    ROGUE: 'bg-green-600/20 text-green-400',
  },
  rarity: {
    COMMON: 'bg-gray-400/20 text-gray-400',
    UNCOMMON: 'bg-green-400/20 text-green-400',
    RARE: 'bg-blue-400/20 text-blue-400',
    EPIC: 'bg-purple-400/20 text-purple-400',
    LEGENDARY: 'bg-yellow-400/20 text-yellow-400',
  },
  element: {
    NEUTRAL: 'bg-gray-600/20 text-gray-400',
    FIRE: 'bg-red-600/20 text-red-400',
    ICE: 'bg-blue-400/20 text-blue-400',
    LIGHTNING: 'bg-yellow-500/20 text-yellow-400',
    EARTH: 'bg-amber-700/20 text-amber-400',
    WATER: 'bg-blue-600/20 text-blue-400',
    WIND: 'bg-sky-400/20 text-sky-400',
    NATURE: 'bg-green-600/20 text-green-400',
    HOLY: 'bg-yellow-400/20 text-yellow-400',
    BRIMSTONE: 'bg-red-700/20 text-red-400',
    HOLY_FLAMES: 'bg-yellow-400/20 text-yellow-400',
    SHADOWFLAME: 'bg-slate-700/20 text-slate-400',
    ASTRAL: 'bg-purple-600/20 text-purple-400',
    PLAGUE: 'bg-lime-500/20 text-lime-400',
    GOD_SLAYER: 'bg-red-800/20 text-red-400',
    SULPHURIC: 'bg-green-400/20 text-green-400',
    SHADOW: 'bg-gray-800/20 text-gray-400',
    BLOOD: 'bg-red-900/20 text-red-400',
    CRYSTAL: 'bg-cyan-500/20 text-cyan-400',
    ARCANE: 'bg-purple-500/20 text-purple-400',
    ELEMENTAL: 'bg-pink-500/20 text-pink-400',
    COSMIC: 'bg-blue-700/20 text-blue-400',
    TEMPORAL: 'bg-sky-500/20 text-sky-400',
    ABYSSAL: 'bg-indigo-900/20 text-indigo-400',
    TOXIC: 'bg-lime-400/20 text-lime-400',
    OMNI: 'bg-pink-600/20 text-pink-400',
    MAGIC: 'bg-purple-600/20 text-purple-400',
  },
};

const FALLBACK_COLOR = 'bg-gray-600/20 text-gray-400';

interface BadgeProps {
  variant: BadgeVariant;
  value: string;
}

export const Badge = ({ variant, value }: BadgeProps) => {
  const colorClasses = VARIANT_COLORS[variant][value] ?? FALLBACK_COLOR;
  return (
    <span className={`inline-block px-3 py-1 rounded text-xs font-display uppercase ${colorClasses}`}>
      {value}
    </span>
  );
};
```

- [ ] **Step 4: Export it from the barrel** — add to `src/frontend/src/components/ui/index.ts`:

```ts
export { Badge } from './Badge';
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/ui/Badge.test.tsx
```
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/ui/Badge.tsx src/frontend/src/components/ui/Badge.test.tsx src/frontend/src/components/ui/index.ts
git commit -m "feat(frontend): add Badge component"
```

---

### Task 6: `Header` mobile nav drawer + theme toggle

**Files:**
- Modify: `src/frontend/src/components/common/Header.tsx`
- Create: `src/frontend/src/components/common/Header.test.tsx`

**Interfaces:**
- Consumes: `Drawer` (Task 4), `ThemeToggle` (Task 3).

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/common/Header.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('opens the mobile nav drawer when the menu button is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer after a nav link is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Armas'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/common/Header.test.tsx
```
Expected: FAIL — no element with the accessible name `Abrir menu de navegação` (current `Header` has no menu button).

- [ ] **Step 3: Implement the new `src/frontend/src/components/common/Header.tsx`**

```tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';

const tabs = [
  { label: 'Início', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

export const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = (onNavigate?: () => void) =>
    tabs.map((tab) => (
      <Link
        key={tab.path}
        to={tab.path}
        onClick={onNavigate}
        className={`text-lg font-display uppercase tracking-wider hover:text-calamity-primary transition-all duration-300 pb-2 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-primary border-calamity-primary'
            : 'text-calamity-text-primary border-transparent hover:border-calamity-accent-gold'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b-2 border-calamity-primary shadow-mystical sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-2xl md:text-4xl font-bold font-display text-calamity-accent-gold hover:text-calamity-primary transition-colors duration-300"
        >
          ⚡ Terraria Calamity RPG
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen(true)}
            className="md:hidden w-11 h-11 flex items-center justify-center text-calamity-text-primary border border-calamity-border"
          >
            ☰
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

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/common/Header.test.tsx
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/common/Header.tsx src/frontend/src/components/common/Header.test.tsx
git commit -m "feat(frontend): collapse Header nav into a mobile drawer, add theme toggle"
```

---

### Task 7: `WeaponCard` component

**Files:**
- Create: `src/frontend/src/components/pages/WeaponCard.tsx`
- Test: `src/frontend/src/components/pages/WeaponCard.test.tsx`

**Interfaces:**
- Consumes: `Card`, `CardBody` from `../ui` (existing), `Badge` from `../ui` (Task 5).
- Produces: `<WeaponCard weapon={Weapon} onSelect={(id: string) => void} />`. Used by `WeaponsPage` (Task 8).

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/pages/WeaponCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponCard } from './WeaponCard';
import { Weapon, WeaponTypeClass, Element, RarityLevel } from '../../types/weapon';

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'Uma lâmina lendária forjada na Floresta da Corrupção.',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: RarityLevel.LEGENDARY,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponCard', () => {
  it('renders the weapon name, damage and badges', () => {
    render(<WeaponCard weapon={weapon} onSelect={() => {}} />);
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
    expect(screen.getByText('55 DANO')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('calls onSelect with the weapon id when clicked', () => {
    const onSelect = vi.fn();
    render(<WeaponCard weapon={weapon} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponCard.test.tsx
```
Expected: FAIL — `Cannot find module './WeaponCard'`.

- [ ] **Step 3: Implement `src/frontend/src/components/pages/WeaponCard.tsx`**

```tsx
import { Card, CardBody, Badge } from '../ui';
import { Weapon } from '../../types/weapon';

interface WeaponCardProps {
  weapon: Weapon;
  onSelect: (id: string) => void;
}

export const WeaponCard = ({ weapon, onSelect }: WeaponCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(weapon.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {weapon.imageUrl && (
          <img src={weapon.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{weapon.name}</h3>
          <span className="text-lg font-bold text-calamity-accent-gold whitespace-nowrap">
            {weapon.baseDamage} DANO
          </span>
        </div>
        <p className="text-calamity-text-secondary text-sm line-clamp-2">{weapon.description}</p>
        <div className="flex gap-2 flex-wrap mt-auto">
          <Badge variant="rarity" value={weapon.rarity} />
          <Badge variant="element" value={weapon.element} />
          <Badge variant="class" value={weapon.weaponClass} />
        </div>
      </CardBody>
    </Card>
  </button>
);
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponCard.test.tsx
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/WeaponCard.tsx src/frontend/src/components/pages/WeaponCard.test.tsx
git commit -m "feat(frontend): add WeaponCard component"
```

---

### Task 8: `WeaponsPage` — mobile filter drawer + card grid

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponsPage.tsx`
- Create: `src/frontend/src/components/pages/WeaponsPage.test.tsx`

**Interfaces:**
- Consumes: `WeaponCard` (Task 7), `Drawer` (Task 4), `useWeapons` (existing, already exposes `wakingUp`/`retryAttempt`).

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/pages/WeaponsPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeaponsPage } from './WeaponsPage';
import { useWeapons } from '../../hooks/useWeapons';
import { Weapon, WeaponTypeClass, Element, RarityLevel } from '../../types/weapon';

vi.mock('../../hooks/useWeapons');

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: RarityLevel.LEGENDARY,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponsPage', () => {
  beforeEach(() => {
    vi.mocked(useWeapons).mockReturnValue({
      weapons: [weapon],
      loading: false,
      error: null,
      wakingUp: false,
      retryAttempt: null,
      refetch: vi.fn(),
    });
  });

  it('renders the weapon list as a card grid', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
  });

  it('opens the filter drawer from the mobile filter button', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Buscar por Nome')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponsPage.test.tsx
```
Expected: FAIL — no button with accessible name matching `/Filtrar/` (current page has no mobile filter trigger).

- [ ] **Step 3: Replace `src/frontend/src/components/pages/WeaponsPage.tsx`** — this removes the three duplicated `getWeaponClassColor`/`getRarityColor`/`getElementColor` functions (now covered by `Badge`), replaces the listing rows with a `WeaponCard` grid, and adds the mobile filter drawer:

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeapons } from "../../hooks/useWeapons";
import { Loading } from "../ui/Loading";
import { Error } from "../ui/Error";
import { Drawer } from "../ui/Drawer";
import { WeaponCard } from "./WeaponCard";

const WEAPON_CLASSES = ["MELEE", "RANGED", "MAGE", "SUMMON", "ROGUE"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
const ELEMENT = [
  "NEUTRAL", "FIRE", "ICE", "LIGHTNING", "EARTH", "WATER", "WIND", "NATURE",
  "HOLY", "BRIMSTONE", "HOLY_FLAMES", "SHADOWFLAME", "ASTRAL", "PLAGUE",
  "GOD_SLAYER", "SULPHURIC", "SHADOW", "BLOOD", "CRYSTAL", "ARCANE",
  "ELEMENTAL", "COSMIC", "TEMPORAL", "ABYSSAL", "TOXIC", "OMNI", "MAGIC",
];

export const WeaponsPage = () => {
  const navigate = useNavigate();
  const { weapons, loading, error, wakingUp, retryAttempt, refetch } = useWeapons();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "damage">("name");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [selectedClass, selectedRarity, selectedElement, searchTerm].filter(
    Boolean
  ).length;

  const filteredWeapons = weapons
    .filter((weapon) => {
      if (selectedClass && weapon.weaponClass !== selectedClass) return false;
      if (selectedRarity && weapon.rarity !== selectedRarity) return false;
      if (selectedElement && weapon.element !== selectedElement) return false;
      if (searchTerm && !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : b.baseDamage - a.baseDamage));

  if (loading) {
    return (
      <Loading
        message={
          wakingUp
            ? `Acordando o servidor... (tentativa ${retryAttempt?.attempt}/${retryAttempt?.maxRetries})`
            : "Carregando armas do Calamity..."
        }
      />
    );
  }

  if (error) {
    return <Error message={`Erro ao carregar armas: ${error}`} onRetry={refetch} />;
  }

  const filterControls = (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">
          Buscar por Nome
        </label>
        <input
          type="text"
          placeholder="Digite o nome da arma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Classe</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Classes</option>
          {WEAPON_CLASSES.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Raridade</label>
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Raridades</option>
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Elemento</label>
        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todos os Elementos</option>
          {ELEMENT.map((element) => (
            <option key={element} value={element}>{element}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "damage")}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="damage">Dano (Maior)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            ⚔️ Armas
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total: <span className="text-calamity-primary font-bold">{filteredWeapons.length}</span> armas encontradas
          </p>
        </div>

        <div className="md:hidden mb-8">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="w-full px-4 py-3 bg-calamity-bg-secondary border-2 border-calamity-border text-calamity-text-primary font-display"
          >
            Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount} ativos)` : ""}
          </button>
        </div>

        <div className="hidden md:block bg-calamity-bg-secondary border-2 border-calamity-border p-8 mb-12 shadow-mystical">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Filtros</h2>
          {filterControls}
        </div>

        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filtros" side="bottom">
          <div className="flex flex-col gap-6">
            {filterControls}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="px-6 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary font-display"
            >
              Aplicar Filtros
            </button>
          </div>
        </Drawer>

        {filteredWeapons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhuma arma encontrada</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWeapons.map((weapon) => (
              <WeaponCard key={weapon.id} weapon={weapon} onSelect={(id) => navigate(`/weapons/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponsPage.test.tsx
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/WeaponsPage.tsx src/frontend/src/components/pages/WeaponsPage.test.tsx
git commit -m "feat(frontend): responsive filter drawer and card grid for WeaponsPage"
```

---

### Task 9: `WeaponDetailPage` — replace local color functions with `Badge`

**Files:**
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`
- Create: `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`

**Interfaces:**
- Consumes: `Badge` from `../ui` (Task 5).

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/pages/WeaponDetailPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WeaponDetailPage } from './WeaponDetailPage';
import { weaponService } from '../../services/weaponService';
import { Weapon, WeaponTypeClass, Element, RarityLevel } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const weapon: Weapon = {
  id: '42',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: RarityLevel.LEGENDARY,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponDetailPage', () => {
  beforeEach(() => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(weapon);
  });

  it('renders the weapon name and rarity/element/class badges', async () => {
    render(
      <MemoryRouter initialEntries={['/weapons/42']}>
        <Routes>
          <Route path="/weapons/:id" element={<WeaponDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    expect(screen.getByText('MELEE')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponDetailPage.test.tsx
```
Expected: FAIL — `Cannot find module '../../services/weaponService'` mock mismatch or assertion failure (current page renders the same badges via raw spans, so this specific test may actually pass against the *old* code by coincidence — if so, skip to Step 3 anyway since the real goal is removing the duplicated color functions; re-run after Step 3 to confirm behavior is preserved).

- [ ] **Step 3: Replace `src/frontend/src/components/pages/WeaponDetailPage.tsx`** — removes the three duplicated color-mapping functions (~90 lines) and the gradient header, replaces the rarity/element/class pills with `Badge`, and drops the redundant "Raridade"/"Elemento" info boxes (now shown once, in the header, as badges):

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Weapon } from '../../types/weapon';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { Badge } from '../ui/Badge';

export const WeaponDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID da arma não fornecido');
        const data = await weaponService.getWeaponById(id);
        setWeapon(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar arma';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes da arma..." />;
  }

  if (error || !weapon) {
    return <ErrorView message={error || 'Arma não encontrada'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/weapons')}
          className="flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          ← Voltar para Armas
        </button>
      </div>

      <section className="bg-calamity-bg-secondary py-12 border-b-2 border-calamity-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {weapon.imageUrl && (
              <img
                src={weapon.imageUrl}
                alt={weapon.name}
                className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">
                {weapon.name}
              </h1>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="rarity" value={weapon.rarity} />
                <Badge variant="element" value={weapon.element} />
                <Badge variant="class" value={weapon.weaponClass} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Estatísticas
              </h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Dano</span>
                  <span className="text-2xl font-bold text-calamity-accent-gold">{weapon.baseDamage}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-primary h-full" style={{ width: `${Math.min((weapon.baseDamage / 200) * 100, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Chance de Crítico</span>
                  <span className="text-2xl font-bold text-calamity-accent-purple">{weapon.criticalChance}%</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-accent-purple h-full" style={{ width: `${weapon.criticalChance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Velocidade</span>
                  <span className="text-2xl font-bold text-calamity-accent-green">{weapon.attacksPerTurn}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-accent-green h-full" style={{ width: `${Math.min((weapon.attacksPerTurn / 5) * 100, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Knockback</span>
                  <span className="text-2xl font-bold text-calamity-primary">{weapon.range}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-primary h-full" style={{ width: `${Math.min((weapon.range / 10) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical mb-8">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
                Descrição
              </h2>
              <p className="text-calamity-text-secondary font-body leading-relaxed text-lg">{weapon.description}</p>
            </div>

            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Informações
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Tipo</p>
                  <p className="text-lg font-bold text-calamity-primary">{weapon.weaponClass}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">ID</p>
                  <p className="text-lg font-bold text-calamity-accent-gold font-mono">{weapon.id}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Adicionado em</p>
                  <p className="text-lg font-bold text-calamity-text-secondary">
                    {new Date(weapon.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/WeaponDetailPage.test.tsx
```
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/WeaponDetailPage.tsx src/frontend/src/components/pages/WeaponDetailPage.test.tsx
git commit -m "refactor(frontend): use Badge in WeaponDetailPage, drop duplicated color maps"
```

---

### Task 10: Placeholder pages (Items, Enemies, NPCs, Biomes) — responsive tightening

**Files:**
- Modify: `src/frontend/src/components/pages/ItemsPage.tsx`
- Modify: `src/frontend/src/components/pages/EnemiesPage.tsx`
- Modify: `src/frontend/src/components/pages/NPCsPage.tsx`
- Modify: `src/frontend/src/components/pages/BiomesPage.tsx`
- Create: `src/frontend/src/components/pages/PlaceholderPages.test.tsx`

These four pages already use only `calamity-*` token classes (no hardcoded colors, no decorative glow effects) — they're already theme-aware as of Task 1 with zero changes. The only real gap is that `text-6xl`/`text-5xl` headings have no smaller mobile fallback and the content has no horizontal padding, so on a narrow phone the icon/heading sit flush against the screen edges. Fix: add `px-4` and step the heading/icon sizes down on the smallest breakpoint. The structure (icon, heading, message, back button) is unchanged — no filter/listing functionality is invented for pages with no real data yet.

**Interfaces:** none — these are leaf pages with no props, consumed only by `App.tsx` routes (unchanged).

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/pages/PlaceholderPages.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ItemsPage } from './ItemsPage';
import { EnemiesPage } from './EnemiesPage';
import { NPCsPage } from './NPCsPage';
import { BiomesPage } from './BiomesPage';

describe('placeholder pages', () => {
  it.each([
    ['ItemsPage', ItemsPage, 'Itens'],
    ['EnemiesPage', EnemiesPage, 'Inimigos'],
    ['NPCsPage', NPCsPage, 'NPCs'],
    ['BiomesPage', BiomesPage, 'Biomas'],
  ])('%s renders its heading inside a padded, responsive container', (_name, Page, heading) => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );
    const headingEl = screen.getByRole('heading', { name: heading });
    expect(headingEl).toBeInTheDocument();
    expect(headingEl.closest('div')?.className).toMatch(/px-4/);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/PlaceholderPages.test.tsx
```
Expected: FAIL — no ancestor `div` currently has a `px-4` class on these pages.

- [ ] **Step 3: Update all four files** with the same diff shape. `src/frontend/src/components/pages/ItemsPage.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';

export const ItemsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl mb-6">💎</div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">Itens</h1>
        <p className="text-xl sm:text-2xl text-calamity-text-secondary mb-8 font-body">
          Esta seção está em desenvolvimento
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary font-display transition-all duration-800"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
```

`src/frontend/src/components/pages/EnemiesPage.tsx` (same shape, icon `👹`, heading `Inimigos`):

```tsx
import { useNavigate } from 'react-router-dom';

export const EnemiesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl mb-6">👹</div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">Inimigos</h1>
        <p className="text-xl sm:text-2xl text-calamity-text-secondary mb-8 font-body">
          Esta seção está em desenvolvimento
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary font-display transition-all duration-800"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
```

`src/frontend/src/components/pages/NPCsPage.tsx` (icon `🧙`, heading `NPCs`):

```tsx
import { useNavigate } from 'react-router-dom';

export const NPCsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl mb-6">🧙</div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">NPCs</h1>
        <p className="text-xl sm:text-2xl text-calamity-text-secondary mb-8 font-body">
          Esta seção está em desenvolvimento
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary font-display transition-all duration-800"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
```

`src/frontend/src/components/pages/BiomesPage.tsx` (icon `🏜️`, heading `Biomas`):

```tsx
import { useNavigate } from 'react-router-dom';

export const BiomesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl mb-6">🏜️</div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">Biomas</h1>
        <p className="text-xl sm:text-2xl text-calamity-text-secondary mb-8 font-body">
          Esta seção está em desenvolvimento
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border-2 border-calamity-primary font-display transition-all duration-800"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/PlaceholderPages.test.tsx
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/components/pages/ItemsPage.tsx src/frontend/src/components/pages/EnemiesPage.tsx src/frontend/src/components/pages/NPCsPage.tsx src/frontend/src/components/pages/BiomesPage.tsx src/frontend/src/components/pages/PlaceholderPages.test.tsx
git commit -m "style(frontend): tighten placeholder pages for narrow viewports"
```

---

### Task 11: `HomePage` smoke test + delete dead `Home.tsx`

**Files:**
- Create: `src/frontend/src/components/pages/HomePage.test.tsx`
- Delete: `src/frontend/src/components/pages/Home.tsx`

`HomePage.tsx` (the real `/` route) is already mobile-first — every grid in it (`grid md:grid-cols-2`, `grid md:grid-cols-4`, `grid md:grid-cols-2 lg:grid-cols-5`) defaults to a single column below `md` with no explicit fix needed, and it already only uses `calamity-*` tokens, so it inherits dark/light theming and the new modular type scale automatically from Task 1. `Home.tsx` is dead code confirmed unreferenced by any route (`App.tsx` uses `HomePage`) or import (`grep -rn "pages/Home['\"]" src/frontend/src` → no matches besides the file itself) and is removed.

**Interfaces:** none.

- [ ] **Step 1: Write the failing test** — create `src/frontend/src/components/pages/HomePage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useWeapons } from '../../hooks';

vi.mock('../../hooks', () => ({
  useWeapons: vi.fn(),
}));

describe('HomePage', () => {
  it('renders the hero heading and category links', () => {
    vi.mocked(useWeapons).mockReturnValue({
      weapons: [],
      loading: false,
      error: null,
      wakingUp: false,
      retryAttempt: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Terraria Calamity RPG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Armas/ })).toBeInTheDocument();
  });
});
```

Note: this file needs `import { vi } from 'vitest';` alongside the other imports — `vitest.config.ts` sets `globals: true`, but `vi` itself must still be imported explicitly.

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/HomePage.test.tsx
```
Expected: FAIL if the mock shape doesn't match the hook's real return type, or PASS immediately since `HomePage` already renders this content — either way, inspect the failure; if it fails only because `vi` wasn't imported, fix the import and re-run before moving on. The goal of this task is coverage, not a behavior change, so a same-day pass after fixing the import is expected and fine.

- [ ] **Step 3: Confirm `Home.tsx` is truly unused, then delete it**

```bash
cd src/frontend
grep -rn "pages/Home['\"]" src
```
Expected: no output (no import path ends exactly at `Home` — `HomePage` won't match this anchored pattern).

```bash
git rm src/frontend/src/components/pages/Home.tsx
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts src/components/pages/HomePage.test.tsx
```
Expected: PASS (1 test).

- [ ] **Step 5: Run the full test suite, typecheck, and build**

```bash
cd src/frontend
npx vitest run --config vitest.config.ts
npx tsc -b
npx vite build
```
Expected: all tests pass, no type errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/components/pages/HomePage.test.tsx
git commit -m "test(frontend): add HomePage smoke test, remove dead Home.tsx"
```

---

## Self-Review Notes

- **Spec coverage:** Token system + dark/light (Task 1-2), `ThemeToggle`/`Drawer`/`Badge` (Tasks 3-5), mobile nav (Task 6), Weapons filter-drawer + card grid (Tasks 7-8), `Badge` reuse in detail page (Task 9), placeholder pages (Task 10), Home cleanup (Task 11) — every spec section maps to a task.
- **Type consistency:** `Drawer`'s `side` prop (`'right' | 'bottom'`), `Badge`'s `variant` prop (`'class' | 'element' | 'rarity'`), and `useWeapons`' `wakingUp`/`retryAttempt` shape are used identically across every task that consumes them.
- **No placeholders:** every step has runnable code; nothing deferred to "see Task N" for actual implementation.
