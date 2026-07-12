---
tags: [backend, moc]
aliases: [Backend, Mapa do Backend]
up: "[[INDEX]]"
related:
  - "[[Frontend-MOC]]"
  - "[[Infra-MOC]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity
---

# Backend — Mapa

API RESTful em Spring Boot 4.1.0 / Java 21, camadas `api` → `application` → `domain`,
descrita em [[ARCHITECTURE]].

## Módulos indexados

- [[Auth]] — login/registro, JWT, segurança
- [[Weapons]] — CRUD de armas e submissões de contribuição

## Módulos ainda não indexados (retrofit futuro)

- Admin (`AdminController`, `AdminDashboardService`)
- Armor (`ArmorController`, `ArmorService`, `ArmorMapper`)
- Submission / fluxo de contribuição (`SubmissionController`, `SubmissionService`)
- Element (`WeaponElementController`, `WeaponElementService`)

## Camadas

- `api/controller` — REST controllers
- `api/exception` — `GlobalExceptionHandler` + exceções de domínio
- `application/service` — regras de negócio
- `application/mapper` — Entity ↔ DTO (MapStruct)
- `domain/entity`, `domain/dto`, `domain/repository` — persistência JPA

## Conexões

- Persistência via [[Infra-MOC]] (Supabase Postgres + Flyway).
- Consumido pelo [[Frontend-MOC]] via `axios` (ver `src/frontend/src/services`).
