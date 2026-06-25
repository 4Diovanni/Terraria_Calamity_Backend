---
name: visual-identity
description: Use when designing, building, redesigning, or reviewing any UI/styling in the Calamity Terraria frontend (src/frontend) — new pages, components, theming, dark/light mode, or mobile/responsive layout work.
---

# Calamity Visual Identity

## Overview

Calamity's frontend is a Terraria-Calamity-mod codex/wiki, not a generic admin dashboard. Every screen must read as **RPG minimalism**: restrained, atmospheric, game-codex feel — and must work in **both dark and light mode** through one shared token system, never a one-off palette per page.

## Current State (baseline to extend, not replace)

`tailwind.config.js` / `index.css` define a dark-only "mystical" palette as CSS variables (`--color-bg-dark`, `--color-primary`, `--color-accent-gold`, etc.), a golden-ratio type scale, and serif fonts (Cinzel/Crimson Text). **No light mode or theme switch exists yet** — `darkMode` strategy isn't set in Tailwind config. Add light mode onto this token system; don't invent new ad-hoc colors.

## Theme System Requirements

1. Set `darkMode: 'class'` in `tailwind.config.js`. Toggle via a `dark`/`light` class on `<html>`; default dark, persist user choice in `localStorage`, fall back to `prefers-color-scheme` on first visit.
2. Every `:root` color variable needs a light-mode override. Components reference CSS variables / `calamity-*` tokens — never hardcoded hex.
3. Light mode keeps the same meaning per accent (red=primary, gold=rare/legendary) remapped for readable contrast — same identity, not a different theme.
4. Contrast-check text vs background in both modes — minimum WCAG AA (4.5:1 body text) — before shipping.

## RPG-Minimalism Checklist

- No decoration that doesn't carry information (a glow/border should signal rarity/state, not just "look cool").
- Generous negative space over dense panels — this codebase already models "Ma" (negative space) as a spacing token; use it.
- Serif display font for headings (Cinzel), serif body font for reading text (Crimson Text) — don't introduce a third typeface family.
- Borders and dividers over heavy drop shadows/skeuomorphism. Flat, codex-like cards.
- Icons/art used sparingly to mark category (weapon class, element, rarity) — not as filler.

## Consistency Rule

One spacing scale, one type scale, one color-token set, one button/card/badge component — reused verbatim across Home, Weapons, Items, Enemies, Biomes, NPCs pages. If a page needs a new visual pattern, add it to the shared `components/ui` set, don't inline a local variant.

## Mobile/Desktop Parity Checklist

- Build mobile-first: base Tailwind classes target small screens, use `sm:`/`md:`/`lg:` to progressively enhance for desktop.
- Primary navigation must collapse to a touch-friendly pattern (hamburger/drawer or bottom nav) below `md`; don't just shrink a desktop nav bar.
- Tap targets ≥ 44×44px; no hover-only affordances for actions needed on touch devices (filters, sort, detail links).
- Tables/grids of items (weapons, NPCs, etc.) must reflow to single/double-column cards on narrow screens, not horizontal-scroll a desktop table.
- Verify both themes at common breakpoints (375px, 768px, 1280px) before calling layout work done.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Adding a light palette only to the page you're touching | Add it to the shared `:root.light` tokens so every page inherits it |
| New component hardcodes `#8b0000` etc. | Use the `calamity-*` Tailwind tokens / CSS variables |
| Treating "minimalism" as "remove the theme" | Keep the RPG atmosphere (fonts, accent colors, rarity cues) — minimalism means restraint, not genericism |
| Desktop-first CSS shrunk down for mobile | Rebuild mobile-first; desktop is the enhancement, not the base |
