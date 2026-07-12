---
tags: [frontend, lib, submissions]
aliases: [weaponDiff]
up: "[[Contributions]]"
related:
  - "[[useSubmissionTargetWeapon]]"
  - "[[weaponPreview]]"
status: ativo
source: src/frontend/src/lib/weaponDiff.ts
---

# weaponDiff.ts

Função pura que compara os 13 campos de `WeaponFormData` entre a arma atual e a
proposta, para o diff estilo GitHub.

## Exports / Métodos

### `computeWeaponDiff(current, proposed) -> DiffField[]`
Para cada campo (em `FIELD_ORDER`, com rótulos PT-BR): monta `{label, oldValue,
newValue, changed}`. Se `current` é null (submissão `CREATE`), tudo conta como
`changed`. **Chamado por:** `SubmissionDiff` (ver [[Contributions]]), tipicamente com a
arma vinda de [[useSubmissionTargetWeapon]].

### `formatFieldValue(key, source)` · privado
Formata valores (ex.: crítico com `%`, preço com "moedas").

## Conexões

- Consome a arma-alvo de [[useSubmissionTargetWeapon]]; renderizado em [[Contributions]].
