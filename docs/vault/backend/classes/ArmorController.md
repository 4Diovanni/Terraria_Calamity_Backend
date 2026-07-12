---
tags: [backend, controller, armor]
aliases: [ArmorController]
up: "[[Armor]]"
related:
  - "[[ArmorService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/ArmorController.java
---

# ArmorController

Controller REST de armaduras, base `/api/v1/armor`. **Todos os verbos são públicos** —
sem `@PreAuthorize`/JWT, diferente de [[WeaponController]] (nota não óbvia, ver [[Armor]]).

## Métodos

### `getAllArmors(armorClass?, rarity?) -> List<ArmorResponseDTO>`
Lista; se `armorClass` ou `rarity` vierem por query, filtra. **Chama:**
[[ArmorService]]`.findByClass`/`.findByRarity`/`.findAll`.

### `getArmorById(id) -> ArmorResponseDTO`
Uma armadura por ID. **Chama:** `.findById`.

### `createArmor(ArmorRequestDTO) -> 201`
Cria armadura com peças. **Chama:** `.create`.

### `updateArmor(id, ArmorRequestDTO) -> 200`
Atualiza. **Chama:** `.update`.

### `deleteArmor(id) -> 204`
Deleta. **Chama:** `.delete`.

## Conexões

- Única dependência: [[ArmorService]].
- `ArmorRequestDTO`/`ArmorPieceRequestDTO` são declarados aninhados aqui.
- Consumido pelo frontend via `armorService.ts` (ver [[ArmorPages]]).
