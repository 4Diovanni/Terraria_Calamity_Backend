---
tags: [backend, controller, submissions]
aliases: [SubmissionController]
up: "[[Submission]]"
related:
  - "[[SubmissionService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/controller/SubmissionController.java
---

# SubmissionController

Controller REST do fluxo de contribuição, base `/api/v1/submissions`. Rotas de usuário
(criar/minhas/cancelar) e rotas só-admin (`@PreAuthorize`). Hoje só aceita
`entityType=WEAPON` (`isSupportedWeaponType`).

## Métodos

### `create(entityType, WeaponSubmissionRequestDTO, Authentication) -> 201`
Cria proposta em nome do autenticado. **Chama:** [[SubmissionService]]`.create`.

### `findMine(entityType, Authentication) -> List`
Propostas do próprio usuário. **Chama:** `.findMine`.

### `cancel(id, Authentication) -> 204`
Cancela a própria proposta pendente. **Chama:** `.cancel`.

### `findByStatus(entityType, status) -> List` · admin
Fila filtrada por status (default PENDING). **Chama:** `.findByStatus`.

### `findById(id) -> WeaponSubmissionResponseDTO` · admin
Uma proposta. **Chama:** `.findById`.

### `approve(id) -> 200` · admin
Aprova (aplica na `Weapon`). **Chama:** `.approve`.

### `reject(id, RejectSubmissionRequestDTO) -> 200` · admin
Rejeita com motivo. **Chama:** `.reject`.

### `isSupportedWeaponType(String) -> boolean` · privado
Valida se o `entityType` é `WEAPON`; senão o endpoint devolve 400.

## Conexões

- Única dependência: [[SubmissionService]].
- Rotas admin marcadas com `@PreAuthorize("hasRole('ADMIN')")`.
- Consumido pelo frontend via `submissionService.ts` (ver [[Contributions]], [[AdminPage]]).
