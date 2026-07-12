---
tags: [backend, submissions, weapons]
aliases: [Submissões, Submission, Fluxo de Contribuição]
up: "[[Backend-MOC]]"
related:
  - "[[Weapons]]"
  - "[[Admin]]"
  - "[[Auth]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/SubmissionController.java
  - src/main/java/com/terraria/calamity/application/service/SubmissionService.java
  - src/main/java/com/terraria/calamity/domain/entity/Submission.java
  - src/main/java/com/terraria/calamity/domain/entity/SubmissionStatus.java
  - src/main/java/com/terraria/calamity/domain/entity/SubmissionType.java
  - src/main/java/com/terraria/calamity/domain/entity/EntityType.java
  - src/main/java/com/terraria/calamity/domain/repository/SubmissionRepository.java
  - src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionRequestDTO.java
  - src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionResponseDTO.java
  - src/main/java/com/terraria/calamity/domain/dto/RejectSubmissionRequestDTO.java
  - src/main/java/com/terraria/calamity/api/exception/InvalidSubmissionStateException.java
  - src/main/java/com/terraria/calamity/api/exception/ForbiddenActionException.java
---

# Submission — Fluxo de Contribuição

Ciclo de vida de uma proposta (criar/editar arma) enviada por qualquer usuário
autenticado e revisada por um admin: `PENDING` → `APPROVED` | `REJECTED`.

## Arquivos

- `SubmissionController.java` — `POST /api/v1/submissions` (criar), `GET .../mine`
  (minhas propostas), `DELETE /{id}` (cancelar), e as rotas só-admin: `GET` (listar por
  status), `GET /{id}`, `POST /{id}/approve`, `POST /{id}/reject`
- `SubmissionService.java` — regra de negócio: criação (`SubmissionType.CREATE` ou
  `UPDATE`), aprovação (aplica o payload na `Weapon` alvo), rejeição (exige motivo)
- `Submission.java` — entidade: tipo, status, payload proposto, autor, arma-alvo
- `SubmissionStatus.java` — `PENDING` | `APPROVED` | `REJECTED`
- `SubmissionType.java` — `CREATE` | `UPDATE`
- `EntityType.java` — tipo de entidade-alvo (hoje só `WEAPON` é suportado, ver
  `isSupportedWeaponType` no controller)
- Exceções: `InvalidSubmissionStateException`, `ForbiddenActionException`

## Conexões

- Opera sobre entidades de [[Weapons]] (aprovar aplica o diff numa `Weapon`).
- Alimenta as contagens do [[Admin]] (pendentes/aprovadas/rejeitadas).
- Exige autenticação — ver [[Auth]].
- Consumido pelo frontend na fila de revisão do admin ([[AdminPage]]) e na aba de
  contribuições do usuário ([[Contributions]]).
