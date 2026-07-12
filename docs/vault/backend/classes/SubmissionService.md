---
tags: [backend, service, submissions]
aliases: [SubmissionService]
up: "[[Submission]]"
related:
  - "[[SubmissionController]]"
  - "[[WeaponPayloadMapper]]"
  - "[[SubmissionRepository]]"
  - "[[WeaponRepository]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/SubmissionService.java
---

# SubmissionService

Regra de negócio do ciclo de vida de uma proposta. `@Transactional`. Payload
proposto convertido de/para DTO tipado via [[WeaponPayloadMapper]].

## Métodos

### `create(WeaponSubmissionRequestDTO, submitterEmail) -> WeaponSubmissionResponseDTO`
Resolve o autor; se `targetWeaponId` presente → `UPDATE` (valida existência da arma e
barra proposta pendente duplicada), senão `CREATE`. Salva a `Submission`.
**Chama:** [[WeaponRepository]], [[SubmissionRepository]], [[WeaponPayloadMapper]].

### `findMine(submitterEmail) / findByStatus(status) / findById(id) -> ...`
Consultas de leitura da fila (minhas propostas, por status, por ID).

### `cancel(id, requesterEmail) -> void`
Só o autor, só se `PENDING` (`ForbiddenActionException`/`InvalidSubmissionStateException`),
então deleta.

### `approve(id) -> WeaponSubmissionResponseDTO`
Exige `PENDING`. Se `CREATE`, salva nova `Weapon`; se `UPDATE`, aplica o payload na
arma-alvo. Marca `APPROVED`. **Chama:** [[WeaponRepository]], [[WeaponPayloadMapper]]
(`toApprovedWeapon`/`applyToExistingWeapon`).

### `reject(id, reason) -> WeaponSubmissionResponseDTO`
Exige `PENDING`; grava motivo e marca `REJECTED`.

### `getSubmissionOrThrow(id) -> Submission` · privado
Carrega a submissão ou lança.

## Conexões

- Escreve `Weapon` de [[Weapons]] ao aprovar.
- Depende de [[SubmissionRepository]], [[WeaponRepository]], [[WeaponPayloadMapper]].
- Exposto por [[SubmissionController]].
