---
tags: [backend, repository, armor]
aliases: [ArmorRepository]
up: "[[Armor]]"
related:
  - "[[ArmorService]]"
status: ativo
source: src/main/java/com/terraria/calamity/domain/repository/ArmorRepository.java
---

# ArmorRepository

`JpaRepository<Armor, Long>`. Acesso a dados de armadura.

## Métodos (query methods)

### `findByArmorClass(ArmorClass) -> List<Armor>`
Por classe. **Chamado por:** [[ArmorService]]`.findByClass`.

### `findByRarity(Rarity) -> List<Armor>`
Por raridade. **Chamado por:** [[ArmorService]]`.findByRarity`.

Herdados (`findAll`/`findById`/`save`/`saveAndFlush`/`existsById`/`deleteById`) usados
por [[ArmorService]] no CRUD — inclusive o `saveAndFlush` do workaround de peças.

## Conexões

- Usado exclusivamente por [[ArmorService]].
