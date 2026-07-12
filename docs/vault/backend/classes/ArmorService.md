---
tags: [backend, service, armor]
aliases: [ArmorService]
up: "[[Armor]]"
related:
  - "[[ArmorController]]"
  - "[[ArmorMapper]]"
  - "[[ArmorRepository]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/ArmorService.java
---

# ArmorService

Regra de negócio de CRUD de armadura (com peças aninhadas). `@Transactional`.
Converte via [[ArmorMapper]].

## Métodos

### `create(ArmorRequestDTO) -> ArmorResponseDTO`
Mapeia, salva, devolve DTO. **Chamado por:** [[ArmorController]].

### `findById(id) / findAll / findByClass / findByRarity -> ...`
Consultas de leitura/filtro sobre [[ArmorRepository]].

### `update(id, ArmorRequestDTO) -> ArmorResponseDTO`
Copia campos, então **limpa as peças e faz `saveAndFlush` antes de readicionar** — o
flush força os deletes de órfãos antes dos re-inserts, evitando colisão com
`uq_armor_pieces_armor_slot` ao reeditar os mesmos slots (nota não óbvia no código).

### `delete(id) -> void`
Valida existência e deleta (sem guarda de submissão — armadura não tem fluxo de proposta).

## Conexões

- Depende de [[ArmorRepository]] e [[ArmorMapper]].
- Exposto por [[ArmorController]].
