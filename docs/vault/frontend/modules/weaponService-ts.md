---
tags: [frontend, service, weapons]
aliases: [weaponService, weaponService.ts]
up: "[[WeaponsPage]]"
related:
  - "[[apiClient-ts]]"
  - "[[useWeapons]]"
  - "[[WeaponController]]"
status: ativo
source: src/frontend/src/services/weaponService.ts
---

# weaponService.ts

Client HTTP de armas (`/api/v1/weapons`), sobre [[apiClient-ts]]. Contraparte frontend
do [[WeaponController]].

## Métodos

### `getAllWeapons() -> Weapon[]`
`GET /`. **Chamado por:** [[useWeapons]]. **Chama:** [[WeaponController]]`.getAllWeapons`.

### `getWeaponById(id) -> Weapon`
`GET /{id}`. **Chama:** `.getWeaponById`.

### `getWeaponsByElement / getWeaponsByClass / getWeaponsByRarity(x) -> Weapon[]`
Filtros por elemento/classe/raridade (rotas `/element|class|rarity/{x}`).

### `searchWeapons(name) -> Weapon[]`
`GET /search?name=`. **Chama:** `.searchByName`.

### `createWeapon(WeaponFormData) -> Weapon`
`POST /`. **Chamado por:** [[WeaponsPage]] e [[Contributions]] (admin). Protegido.

### `updateWeapon(id, WeaponFormData) -> Weapon`
`PUT /{id}`. Protegido.

### `deleteWeapon(id) -> void`
`DELETE /{id}`. Protegido.

## Conexões

- Sobre [[apiClient-ts]]; consumido por [[useWeapons]] e páginas de arma ([[WeaponsPage]]).
- Espelha o [[WeaponController]] do backend.
