---
tags: [frontend, lib, weapons]
aliases: [weaponPreview]
up: "[[WeaponsPage]]"
related:
  - "[[weaponDiff]]"
status: ativo
source: src/frontend/src/lib/weaponPreview.ts
---

# weaponPreview.ts

Função pura que monta uma `Weapon` "de mentira" para o preview ao vivo a partir dos
valores do formulário.

## Exports / Métodos

### `buildPreviewWeapon(data, base?) -> Weapon`
Junta `WeaponFormData` com os campos que só existem depois de persistir
(`id`/`createdAt`/`markdownContent`/`flavorText`): usa `base` se for edição de arma
existente, senão placeholders neutros (criação). **Chamado por:** `WeaponFormWithPreview`
/ `SubmissionPreview` (ver [[WeaponsPage]], [[Contributions]]).

## Conexões

- Alimenta o preview reaproveitado entre [[WeaponsPage]] e [[Contributions]].
