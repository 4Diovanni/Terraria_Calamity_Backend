---
tags: [backend, controller, elements]
aliases: [WeaponElementController]
up: "[[Element]]"
related:
  - "[[WeaponElementService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/WeaponElementController.java
---

# WeaponElementController

Controller REST de elementos de arma, base `/api/v1/elements`. Todo público, opera só
sobre o enum `Element` (sem persistência). **Não é consumido pelo frontend** (ver [[Element]]).

## Métodos

### `getAllElementsInfo() -> List<ElementInfoDTO>`
Lista todos os elementos com nome/descrição/cor/grupo. **Chama:**
[[WeaponElementService]]`.getAllElementsInfo`.

### `getElementInfo(elementName) -> ElementInfoDTO`
Info de um elemento (fallback NEUTRAL). **Chama:** `.parseElement`.

### `getElementsByGroup(group) -> List<String>`
Nomes dos elementos de um grupo (`vanilla`/`calamity`/`supreme`).

### `validateElement(ElementValidationRequest) -> ElementValidationResponse`
Valida se um elemento existe/é válido. **Chama:** `.parseElement`.

### `calculateElementBonus(ElementBonusRequest) -> ElementBonusResponse`
Calcula dano final com bônus do elemento. **Chama:** `.parseElement`,
`.calculateElementBonus`.

### `checkCompatibility(ElementCompatibilityRequest) -> ElementCompatibilityResponse`
Verifica compatibilidade entre dois elementos. **Chama:** `.areElementsCompatible`.

## Conexões

- Única dependência: [[WeaponElementService]].
- Vários Request/Response DTOs declarados aninhados aqui.
