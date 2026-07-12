---
tags: [backend, repository, weapons]
aliases: [WeaponRepository]
up: "[[Weapons]]"
related:
  - "[[WeaponService]]"
status: ativo
source: src/main/java/com/terraria/calamity/domain/repository/WeaponRepository.java
---

# WeaponRepository

`JpaRepository<Weapon, Long>`. Acesso a dados de arma.

## Métodos (query methods)

### `findByWeaponClass(WeaponClass) -> List<Weapon>`
Por classe. **Chamado por:** [[WeaponService]]`.findByClass`.

### `findByElement(Element) -> List<Weapon>`
Por elemento. **Chamado por:** `.findByElement`.

### `findByRarity(Integer) -> List<Weapon>`
Por raridade. **Chamado por:** `.findByRarity`.

### `findByNameContainingIgnoreCase(String) -> List<Weapon>`
Busca parcial case-insensitive. **Chamado por:** `.searchByName`.

### `findWeaponsByClassAndMinimumRarity(class, minRarity) -> List<Weapon>`
`@Query` JPQL: classe + raridade mínima, ordenado. Sem uso conhecido nos services
hoje (candidato a limpeza).

Herdados: `findAll`, `findById`, `save`, `existsById`, `deleteById` — usados por
[[WeaponService]] no CRUD e por [[SubmissionService]] ao aprovar.

## Conexões

- Usado por [[WeaponService]] e [[SubmissionService]] (aprovação escreve `Weapon`).
