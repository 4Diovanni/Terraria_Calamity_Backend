---
tags: [frontend, lib, weapons]
aliases: [weaponRarity]
up: "[[WeaponsPage]]"
related:
  - "[[UIComponents]]"
status: ativo
source: src/frontend/src/lib/weaponRarity.ts
---

# weaponRarity.ts

Função pura de bucketização da raridade de arma.

## Exports / Métodos

### `weaponRarityToTier(rarity) -> RarityLevel`
Converte a raridade numérica do backend (-1 a 17) nos 5 tiers visuais
(`COMMON`→`LEGENDARY`) usados por `Badge`/borda de acento. Só nas telas de arma —
armadura tem esquema próprio. **Chamado por:** [[WeaponsPage]] (filtro/ordenação) e
cards de arma.

## Conexões

- Alimenta os componentes visuais de [[UIComponents]] (`Badge`) nas telas de [[WeaponsPage]].
