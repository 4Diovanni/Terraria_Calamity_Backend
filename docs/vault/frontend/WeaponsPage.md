---
tags: [frontend, weapons, page]
aliases: [Página de Armas, WeaponsPage]
up: "[[Frontend-MOC]]"
related:
  - "[[Weapons]]"
  - "[[Carousel]]"
  - "[[Contributions]]"
status: ativo
source:
  - src/frontend/src/components/pages/WeaponsPage.tsx
  - src/frontend/src/components/pages/WeaponCard.tsx
  - src/frontend/src/components/pages/WeaponForm.tsx
  - src/frontend/src/components/pages/WeaponFormWithPreview.tsx
  - src/frontend/src/components/pages/SubmissionPreview.tsx
---

# WeaponsPage — Listagem e Contribuição de Armas

Página que lista armas com filtro (classe, raridade, elemento, busca, ordenação) e
abre um drawer para criar uma nova arma via `WeaponFormWithPreview`.

## Arquivos

- `WeaponsPage.tsx` — página principal; usa `useWeapons`/`useAuth`, filtros locais
  (`selectedClass`, `selectedRarity`, `selectedElement`, `searchTerm`, `sortBy`)
- `WeaponCard.tsx` — card de arma na listagem
- `WeaponForm.tsx` — formulário de criação/edição
- `WeaponFormWithPreview.tsx` — formulário ligado ao `SubmissionPreview` (preview ao
  vivo da proposta antes de enviar)
- `SubmissionPreview.tsx` — renderiza a página completa da proposta para revisão

## Módulos (notas de método)

- [[weaponService-ts]] — client HTTP de arma (espelha [[WeaponController]])
- [[useWeapons]] — hook que carrega a lista (com estado de cold start)
- [[weaponRarity]] — bucketiza a raridade numérica nos tiers visuais
- [[weaponPreview]] — monta a `Weapon` de preview a partir do formulário

## Conexões

- Consome a API descrita em [[Weapons]] (`weaponService`).
- Reaproveita o padrão visual de card também usado em [[Carousel]].
- Escrita exige usuário autenticado — ver [[Auth]].
- `WeaponFormWithPreview`/`SubmissionPreview` também são reaproveitados em
  [[Contributions]].
