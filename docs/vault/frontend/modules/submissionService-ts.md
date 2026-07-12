---
tags: [frontend, service, submissions]
aliases: [submissionService, submissionService.ts]
up: "[[Contributions]]"
related:
  - "[[apiClient-ts]]"
  - "[[SubmissionController]]"
status: ativo
source: src/frontend/src/services/submissionService.ts
---

# submissionService.ts

Client HTTP do fluxo de contribuição (`/api/v1/submissions`), sobre [[apiClient-ts]].
Contraparte frontend do [[SubmissionController]]. Todas as chamadas passam
`entityType=WEAPON`.

## Métodos

### `create(entityType, WeaponSubmissionRequest) -> WeaponSubmission`
`POST /`. **Chamado por:** [[Contributions]] (nova proposta). **Chama:**
[[SubmissionController]]`.create`.

### `getMine(entityType) -> WeaponSubmission[]`
`GET /mine`. **Chamado por:** [[Contributions]] ("Minhas Propostas").

### `cancel(id) -> void`
`DELETE /{id}`.

### `getAll(entityType, status=PENDING) -> WeaponSubmission[]`
`GET /` (fila). **Chamado por:** [[AdminPage]].

### `getById(id) -> WeaponSubmission`
`GET /{id}`. Admin.

### `approve(id) / reject(id, reason) -> WeaponSubmission`
`POST /{id}/approve` · `POST /{id}/reject`. Admin. **Chamado por:** [[AdminPage]].

## Conexões

- Sobre [[apiClient-ts]]; consumido por [[Contributions]] e [[AdminPage]].
- Espelha o [[SubmissionController]] do backend.
