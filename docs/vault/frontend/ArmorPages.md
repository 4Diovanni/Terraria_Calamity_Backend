---
tags: [frontend, armor, page]
aliases: [Página de Armaduras, ArmorPages]
up: "[[Frontend-MOC]]"
related:
  - "[[Armor]]"
  - "[[WeaponsPage]]"
status: ativo
source:
  - src/frontend/src/components/pages/ArmorPage.tsx
  - src/frontend/src/components/pages/ArmorDetailPage.tsx
  - src/frontend/src/components/pages/ArmorCard.tsx
  - src/frontend/src/components/pages/ArmorPieceCard.tsx
  - src/frontend/src/services/armorService.ts
  - src/frontend/src/types/armor.ts
---

# ArmorPages — Listagem e Detalhe de Armadura

Listagem com filtro (classe, raridade, busca, ordenação) e página de detalhe com as
peças da armadura ordenadas por slot.

## Arquivos

- `ArmorPage.tsx` — listagem; filtros locais (`selectedClass`, `selectedRarity`,
  `searchTerm`, `sortBy`)
- `ArmorDetailPage.tsx` — detalhe de uma armadura; ordena peças via
  `ARMOR_SLOT_ORDER`; borda de acento por raridade (cor semântica de gameplay,
  hex hardcoded intencionalmente — ver regra de exceção no `CLAUDE.md`)
- `ArmorCard.tsx` — card na listagem
- `ArmorPieceCard.tsx` — card de peça individual na página de detalhe
- `armorService.ts` — client HTTP do `/api/v1/armor`
- `types/armor.ts` — `Armor`, `ArmorClass`, `ArmorSlot`, `ARMOR_SLOT_ORDER`

## Conexões

- Consome a API descrita em [[Armor]] (nota-índice do backend).
- Segue o mesmo padrão de listagem/filtro de [[WeaponsPage]], mas **sem** fluxo de
  submissão/contribuição — armadura ainda não passa por [[Contributions]]/[[Submission]].
