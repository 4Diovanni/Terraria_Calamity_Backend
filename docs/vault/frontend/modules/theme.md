---
tags: [frontend, lib, design-system]
aliases: [theme]
up: "[[UIComponents]]"
related:
  - "[[UIComponents]]"
status: ativo
source: src/frontend/src/lib/theme.ts
---

# theme.ts

Utilitário de tema dark/light: leitura da preferência e aplicação no `<html>`.
Persiste em `localStorage` (`calamity-theme`).

## Exports / Métodos

### `getInitialTheme() -> Theme`
Tema salvo, ou `prefers-color-scheme` do SO como fallback.

### `applyTheme(theme) -> void`
Alterna as classes `dark`/`light` no `documentElement` e persiste a escolha.

### `getStoredTheme() / getPreferredTheme()` · privados
Base do `getInitialTheme` (localStorage vs media query).

## Conexões

- Consumido pelo `ThemeToggle` de [[UIComponents]].
- Suporta o dark/light mode da identidade visual (skill `visual-identity`).
