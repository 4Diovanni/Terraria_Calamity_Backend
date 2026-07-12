---
tags: [backend, service, admin]
aliases: [AdminDashboardService]
up: "[[Admin]]"
related:
  - "[[AdminController]]"
  - "[[UserRepository]]"
  - "[[WeaponRepository]]"
  - "[[SubmissionRepository]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java
---

# AdminDashboardService

Monta as contagens agregadas do painel admin. Só leitura (`@Transactional(readOnly)`).

## Métodos

### `getDashboard() -> AdminDashboardResponseDTO`
Agrega: total de usuários, total de admins (`countByRole(ADMIN)`), total de armas, e
submissões `PENDING`/`APPROVED`/`REJECTED` (`countByStatus`). **Chamado por:**
[[AdminController]]. **Chama:** [[UserRepository]], [[WeaponRepository]],
[[SubmissionRepository]].

## Conexões

- Lê de três repositórios; não escreve nada.
- Exposto por [[AdminController]].
