---
tags: [backend, controller, weapons]
aliases: [WeaponController]
up: "[[Weapons]]"
related:
  - "[[WeaponService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/WeaponController.java
---

# WeaponController

Controller REST de armas, base `/api/v1/weapons`. GET públicos; POST/PUT/DELETE
protegidos por JWT (ver [[SecurityConfig]]). Delega ao [[WeaponService]].

## Métodos

### `getAllWeapons() -> List<WeaponResponseDTO>`
Lista todas. **Chama:** [[WeaponService]]`.findAll`.

### `getWeaponById(id) -> WeaponResponseDTO`
Uma arma por ID. **Chama:** `.findById`.

### `findByElement(String) -> List`
Filtra por elemento; converte string via `Element.fromString` (fallback NEUTRAL).
**Chama:** `.findByElement`.

### `findByWeaponClass(String) -> List`
Filtra por classe (MELEE/RANGED/...); 400 se inválida. **Chama:** `.findByClass`.

### `findByRarity(Integer) -> List`
Filtra por raridade numérica. **Chama:** `.findByRarity`.

### `searchByName(name) -> List`
Busca parcial case-insensitive (`?name=`). **Chama:** `.searchByName`.

### `createWeapon(WeaponRequestDTO) -> 201`
Cria arma. **Chama:** `.create`. Protegido.

### `updateWeapon(id, WeaponRequestDTO) -> 200`
Atualiza arma. **Chama:** `.update`. Protegido.

### `deleteWeapon(id) -> 204`
Deleta arma. **Chama:** `.delete`. Protegido.

## Conexões

- Única dependência: [[WeaponService]].
- `WeaponRequestDTO` é declarado aninhado aqui (não em `domain/dto`).
- Consumido pelo frontend via `weaponService.ts` (ver [[WeaponsPage]]).
