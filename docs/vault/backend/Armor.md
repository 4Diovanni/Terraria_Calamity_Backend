---
tags: [backend, armor]
aliases: [Armadura, Armor]
up: "[[Backend-MOC]]"
related:
  - "[[Weapons]]"
  - "[[ArmorPages]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/ArmorController.java
  - src/main/java/com/terraria/calamity/application/service/ArmorService.java
  - src/main/java/com/terraria/calamity/application/mapper/ArmorMapper.java
  - src/main/java/com/terraria/calamity/domain/entity/Armor.java
  - src/main/java/com/terraria/calamity/domain/entity/ArmorPiece.java
  - src/main/java/com/terraria/calamity/domain/dto/ArmorResponseDTO.java
  - src/main/java/com/terraria/calamity/domain/dto/ArmorPieceResponseDTO.java
  - src/main/java/com/terraria/calamity/domain/repository/ArmorRepository.java
---

# Armor — CRUD de Armaduras

Endpoints de armadura (`/api/v1/armor`), com peças (`ArmorPiece`) aninhadas. Espelha o
padrão do [[Weapons]] mas **todos os endpoints são públicos** — CRUD completo sem
`@PreAuthorize`/JWT, diferente de `WeaponController` (nota não óbvia, ver Notas).

## Arquivos

- `ArmorController.java` — `GET/POST/PUT/DELETE /api/v1/armor`; filtros por
  `armorClass`/`rarity` via query param; `ArmorRequestDTO`/`ArmorPieceRequestDTO`
  aninhados no controller (não em `domain/dto`, ao contrário do `ArmorResponseDTO`)
- `ArmorService.java` — regra de negócio de CRUD
- `ArmorMapper.java` — Entity ↔ DTO (MapStruct)
- `Armor.java` — entidade (nome, classe, raridade, defesa total, lore)
- `ArmorPiece.java` — peça individual (slot, nome, defesa)
- `ArmorRepository.java` — acesso a dados JPA

## Notas

Ao contrário de [[Weapons]] e [[Submission]], `ArmorController` não passa por
`@PreAuthorize`/JWT em nenhum verbo — POST/PUT/DELETE de armadura são públicos hoje.
Não existe fluxo de submissão/aprovação para armadura (só para arma).

## Conexões

- Consumido pelo frontend em [[ArmorPages]] (listagem e detalhe).
- Compartilha padrões de raridade com [[Weapons]].
