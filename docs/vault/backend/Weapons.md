---
tags:
  - backend
  - weapons
  - submissions
aliases:
  - Armas
  - Weapons
up: "[[Backend-MOC]]"
related:
  - "[[Auth]]"
  - "[[WeaponsPage]]"
  - "[[Submission]]"
  - "[[Element]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/WeaponController.java
  - src/main/java/com/terraria/calamity/api/controller/SubmissionController.java
  - src/main/java/com/terraria/calamity/application/service/WeaponService.java
  - src/main/java/com/terraria/calamity/application/service/SubmissionService.java
  - src/main/java/com/terraria/calamity/application/mapper/WeaponMapper.java
  - src/main/java/com/terraria/calamity/application/mapper/WeaponPayloadMapper.java
  - src/main/java/com/terraria/calamity/domain/entity/Weapon.java
  - src/main/java/com/terraria/calamity/domain/entity/Submission.java
  - src/main/java/com/terraria/calamity/domain/repository/WeaponRepository.java
---

# Weapons — CRUD e Fluxo de Contribuição

Endpoints de arma (`/api/weapons`) com GET público e POST/PUT/DELETE protegidos por
JWT (ver [[Auth]]), mais o fluxo de submissão de contribuições da comunidade.

## Arquivos

- `WeaponController.java` — `GET/POST/PUT/DELETE /api/weapons`
- `SubmissionController.java` — fila de propostas de arma pendentes de aprovação
- `WeaponService.java` — regra de negócio de CRUD de armas
- `SubmissionService.java` — regra de negócio de aprovação/rejeição de propostas
- `WeaponMapper.java` / `WeaponPayloadMapper.java` — Entity ↔ DTO (MapStruct)
- `Weapon.java` — entidade JPA (classe, raridade, elemento, dano, etc.)
- `Submission.java` — entidade da proposta em revisão (diff contra a arma atual)
- `WeaponRepository.java` — acesso a dados JPA

## Conexões

- Escrita protegida por [[Auth]].
- Consumido pelo frontend em [[WeaponsPage]] (listagem, formulário, preview).
- Propostas de criação/edição passam pelo fluxo de [[Submission]] antes de alterar
  uma `Weapon` diretamente.
- Campo `element` usa o enum descrito em [[Element]].
