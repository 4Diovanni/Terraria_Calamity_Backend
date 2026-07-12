---
tags: [backend, repository, submissions]
aliases: [SubmissionRepository]
up: "[[Submission]]"
related:
  - "[[SubmissionService]]"
  - "[[AdminDashboardService]]"
  - "[[WeaponService]]"
status: ativo
source: src/main/java/com/terraria/calamity/domain/repository/SubmissionRepository.java
---

# SubmissionRepository

`JpaRepository<Submission, Long>`. Acesso a dados das propostas.

## Métodos (query methods)

### `findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(user, entityType) -> List`
"Minhas propostas". **Chamado por:** [[SubmissionService]]`.findMine`.

### `findByEntityTypeAndStatusOrderByCreatedAtAsc(entityType, status) -> List`
Fila por status. **Chamado por:** `.findByStatus`.

### `existsByTargetEntityIdAndEntityTypeAndStatus(...) -> boolean`
Barra proposta pendente duplicada. **Chamado por:** `.create`.

### `existsByTargetEntityIdAndEntityType(...) -> boolean`
Guarda de delete de arma. **Chamado por:** [[WeaponService]]`.delete`.

### `countByStatus(status) -> long`
Contagem por status. **Chamado por:** [[AdminDashboardService]].

## Conexões

- Usado por [[SubmissionService]], [[WeaponService]] (guarda de delete) e
  [[AdminDashboardService]] (contagens).
