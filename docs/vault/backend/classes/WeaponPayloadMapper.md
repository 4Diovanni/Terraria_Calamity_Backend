---
tags: [backend, mapper, submissions]
aliases: [WeaponPayloadMapper]
up: "[[Submission]]"
related:
  - "[[SubmissionService]]"
  - "[[JacksonConfig]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/mapper/WeaponPayloadMapper.java
---

# WeaponPayloadMapper

Converte entre o **payload JSON genérico** da `Submission` (`Map<String,Object>`) e o
DTO tipado de arma, via `ObjectMapper` (injetado de [[JacksonConfig]]). É o que
permite a tabela `submissions` ser genérica sem coluna por campo.

## Métodos

### `toEntity(dto, submittedBy, targetEntityId, type) -> Submission`
DTO → `Submission`; serializa o DTO em `Map` e remove `targetWeaponId` do payload.
**Chamado por:** [[SubmissionService]]`.create`.

### `toResponseDTO(Submission) -> WeaponSubmissionResponseDTO`
Submission → DTO de resposta (desserializa o payload de volta ao DTO tipado).

### `toApprovedWeapon(Submission) -> Weapon`
Payload → nova `Weapon` (usado ao aprovar um `CREATE`).

### `applyToExistingWeapon(Submission, Weapon) -> void`
Copia o payload numa `Weapon` existente (usado ao aprovar um `UPDATE`).

### `toPayloadDTO(Submission) -> WeaponSubmissionRequestDTO` · privado
`objectMapper.convertValue` do payload para o DTO; base dos métodos acima.

## Conexões

- Depende do `ObjectMapper` de [[JacksonConfig]].
- Usado exclusivamente por [[SubmissionService]].
