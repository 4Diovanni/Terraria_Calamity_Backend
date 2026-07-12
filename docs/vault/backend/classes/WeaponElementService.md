---
tags: [backend, service, elements]
aliases: [WeaponElementService]
up: "[[Element]]"
related:
  - "[[WeaponElementController]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/WeaponElementService.java
---

# WeaponElementService

Lógica de domínio sobre o enum `Element` — sem persistência, opera sobre `Weapon`
em memória. Declara o `ElementInfoDTO` consumido pelo controller.

## Métodos

### `getAllElementsInfo() -> List<ElementInfoDTO>`
Monta a lista de todos os elementos com metadados para a UI. **Chamado por:**
[[WeaponElementController]].

### `parseElement(String) -> Element`
Converte string do cliente para `Element`, fallback `NEUTRAL` (nulo/inválido).

### `isValidElement(Weapon) -> boolean`
Elemento não nulo, não NEUTRAL e com efeito.

### `calculateElementBonus(Weapon) -> double`
Multiplicador de dano por grupo: supreme 2.5, calamity 1.5, vanilla 1.2, senão 1.0.

### `areElementsCompatible(Weapon, Weapon) -> boolean`
Compatibilidade para craft: supreme casa com tudo; mesmo grupo casa entre si.

### `isSuitableForLevel(Weapon, bossLevel) -> boolean`
Exigência de elemento por nível de boss (≥10 supreme, ≥7 calamity+, etc.).

### `getElementColor / getElementDisplayName / getElementDescription(Weapon) -> String`
Atalhos para os metadados do elemento da arma.

### `filterByElementGroup(List, group) / filterByExactElement(List, Element) -> List<Weapon>`
Filtros de coleção por grupo ou elemento exato.

## Conexões

- Exposto por [[WeaponElementController]]. Sem dependências de repositório.
