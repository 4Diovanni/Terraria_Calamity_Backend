---
tags: [backend, repository, auth]
aliases: [UserRepository]
up: "[[Auth]]"
related:
  - "[[AuthService]]"
  - "[[CustomUserDetailsService]]"
  - "[[AdminDashboardService]]"
status: ativo
source: src/main/java/com/terraria/calamity/domain/repository/UserRepository.java
---

# UserRepository

`JpaRepository<User, Long>`. Acesso a dados de usuário.

## Métodos (query methods)

### `findByEmail(email) -> Optional<User>`
Base de login e carga de sessão. **Chamado por:** [[AuthService]],
[[CustomUserDetailsService]].

### `existsByEmail(email) / existsByUsername(username) -> boolean`
Validação de unicidade no registro. **Chamado por:** [[AuthService]]`.register`.

### `countByRole(role) -> long`
Contagem de admins/usuários. **Chamado por:** [[AdminDashboardService]].

## Conexões

- Usado por [[AuthService]], [[CustomUserDetailsService]] e [[AdminDashboardService]].
