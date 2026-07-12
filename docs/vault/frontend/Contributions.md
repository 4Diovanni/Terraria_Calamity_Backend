---
tags: [frontend, submissions, weapons]
aliases: [Contribuições, Contributions, Minhas Propostas]
up: "[[Frontend-MOC]]"
related:
  - "[[AdminPage]]"
  - "[[WeaponsPage]]"
status: ativo
source:
  - src/frontend/src/components/pages/UserContributeView.tsx
  - src/frontend/src/components/pages/SubmissionDiff.tsx
  - src/frontend/src/components/pages/SubmissionStatusBadge.tsx
  - src/frontend/src/components/pages/SubmissionPreview.tsx
  - src/frontend/src/hooks/useSubmissionTargetWeapon.ts
  - src/frontend/src/services/submissionService.ts
  - src/frontend/src/types/weaponSubmission.ts
---

# Contributions — Área de Contribuições do Usuário

Aba onde qualquer usuário autenticado propõe uma nova arma ou edição, e acompanha o
status das próprias propostas. Contraparte do usuário comum à fila de revisão do
admin ([[AdminPage]]).

## Arquivos

- `UserContributeView.tsx` — abas "Nova Proposta" (`WeaponFormWithPreview`, ver
  [[WeaponsPage]]) e "Minhas Propostas" (lista com cancelar)
- `SubmissionDiff.tsx` — diff estilo GitHub entre a arma atual e o valor proposto
  (usa `useSubmissionTargetWeapon` + `computeWeaponDiff`)
- `SubmissionStatusBadge.tsx` — badge visual de status (`PENDING`/`APPROVED`/`REJECTED`)
- `SubmissionPreview.tsx` — renderiza a página completa da arma com os valores
  propostos aplicados (preview ao vivo)
- `useSubmissionTargetWeapon.ts` — hook que busca a arma-alvo de uma submissão de
  tipo `UPDATE`
- `submissionService.ts` — client HTTP: criar, listar minhas, cancelar

## Módulos (notas de método)

- [[submissionService-ts]] — client HTTP de submissões (espelha [[SubmissionController]])
- [[useSubmissionTargetWeapon]] — busca a arma-alvo de uma submissão UPDATE
- [[weaponDiff]] — `computeWeaponDiff` (diff campo a campo estilo GitHub)

## Conexões

- Consome a API descrita em [[Submission]] (nota-índice do backend,
  `docs/vault/backend/Submission.md`).
- Reaproveitado pela fila de revisão do [[AdminPage]] (mesmo
  `SubmissionDiff`/`SubmissionPreview`).
- Formulário e preview de arma vêm de [[WeaponsPage]].
