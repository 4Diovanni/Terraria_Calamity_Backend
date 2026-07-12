---
tags: [backend, mapper, armor]
aliases: [ArmorMapper]
up: "[[Armor]]"
related:
  - "[[ArmorService]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/mapper/ArmorMapper.java
---

# ArmorMapper

Conversão Entity↔DTO de armadura, incluindo as peças (`ArmorPiece`) aninhadas.
`@Component` manual.

## Métodos

### `toEntity(ArmorRequestDTO) -> Armor`
DTO → `Armor`; converte `armorClass`/`rarity`/slots de string para enum e adiciona as
peças via `armor.addPiece`. **Chamado por:** [[ArmorService]] (create/update).

### `toPieceEntity(ArmorPieceRequestDTO) -> ArmorPiece` · privado
Uma peça do DTO → entidade.

### `toResponseDTO(Armor) -> ArmorResponseDTO`
`Armor` (+ peças) → DTO de resposta. **Chamado por:** [[ArmorService]] (leituras).

## Conexões

- Usado exclusivamente por [[ArmorService]].
