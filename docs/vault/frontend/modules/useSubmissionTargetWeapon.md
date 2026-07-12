---
tags: [frontend, hook, submissions]
aliases: [useSubmissionTargetWeapon]
up: "[[Contributions]]"
related:
  - "[[weaponService-ts]]"
  - "[[weaponDiff]]"
status: ativo
source: src/frontend/src/hooks/useSubmissionTargetWeapon.ts
---

# useSubmissionTargetWeapon.ts

Busca a arma-alvo de uma submissão `UPDATE`, sob demanda. Base do diff/preview de
submissões.

## Métodos

### `useSubmissionTargetWeapon(submission) -> { weapon, loading, notFound }`
Se a submissão é `UPDATE` com `targetWeaponId`, chama [[weaponService-ts]]`.getWeaponById`
(com guarda de cancelamento); `CREATE` ou sem alvo não busca nada. `notFound` cobre a
arma original deletada. **Chamado por:** `SubmissionDiff` e `SubmissionPreview` (ver
[[Contributions]]).

## Conexões

- Sobre [[weaponService-ts]]; alimenta [[weaponDiff]] (`computeWeaponDiff`) em [[Contributions]].
