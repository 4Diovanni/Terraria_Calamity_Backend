---
tags: [backend, service, weapons]
aliases: [WeaponService]
up: "[[Weapons]]"
related:
  - "[[WeaponController]]"
  - "[[WeaponMapper]]"
  - "[[WeaponRepository]]"
  - "[[SubmissionRepository]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/WeaponService.java
---

# WeaponService

Regra de negócio de CRUD de arma. `@Transactional`; leituras marcadas `readOnly`.
Converte Entity↔DTO via [[WeaponMapper]].

## Métodos

### `create(WeaponRequestDTO) -> WeaponResponseDTO`
Mapeia, salva, devolve DTO. **Chamado por:** [[WeaponController]]. **Chama:**
[[WeaponMapper]], [[WeaponRepository]]`.save`.

### `findById(id) -> WeaponResponseDTO`
Busca por ID (`RuntimeException` se não achar).

### `findAll() / findByClass / findByElement / findByRarity / searchByName -> List`
Consultas de listagem/filtro; cada uma mapeia o resultado do [[WeaponRepository]]
para DTO.

### `update(id, WeaponRequestDTO) -> WeaponResponseDTO`
Carrega a arma, copia campo a campo do DTO mapeado, salva. **Chama:**
[[WeaponRepository]], [[WeaponMapper]].

### `delete(id) -> void`
Valida existência; **bloqueia** se houver submissão associada
(`ResourceInUseException` via [[SubmissionRepository]]`.existsByTargetEntityIdAndEntityType`);
senão deleta.

## Conexões

- Depende de [[WeaponRepository]], [[WeaponMapper]] e [[SubmissionRepository]] (guarda de delete).
- Exposto por [[WeaponController]]; a aprovação de propostas em [[SubmissionService]]
  também escreve `Weapon`.
