---
tags: [backend, auth, security]
aliases: [Autenticação, Auth]
up: "[[Backend-MOC]]"
related:
  - "[[Weapons]]"
  - "[[SECURITY_IMPLEMENTATION]]"
  - "[[Infra-MOC]]"
status: ativo
source:
  - src/main/java/com/terraria/calamity/api/controller/AuthController.java
  - src/main/java/com/terraria/calamity/application/service/AuthService.java
  - src/main/java/com/terraria/calamity/application/service/JwtService.java
  - src/main/java/com/terraria/calamity/application/service/CustomUserDetailsService.java
  - src/main/java/com/terraria/calamity/config/SecurityConfig.java
  - src/main/java/com/terraria/calamity/config/JwtAuthenticationFilter.java
  - src/main/java/com/terraria/calamity/config/RateLimitFilter.java
  - src/main/java/com/terraria/calamity/domain/entity/User.java
  - src/main/java/com/terraria/calamity/domain/entity/Role.java
---

# Auth — Autenticação e Segurança

Autenticação stateless via JWT (BCrypt para senhas, sem sessão de servidor).

## Arquivos

- `AuthController.java` — `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
  `GET /api/v1/auth/me` (protegido)
- `AuthService.java` — regra de negócio de registro/login, emite `AuthResponse` com JWT
- `JwtService.java` — geração/validação do token JWT
- `CustomUserDetailsService.java` — carrega `User` para o Spring Security
- `SecurityConfig.java` — filtro de segurança stateless; público: register/login e GETs
  de weapons/elements/armor + actuator; resto exige JWT
- `JwtAuthenticationFilter.java` — intercepta requests e valida o Bearer token
- `RateLimitFilter.java` — limita taxa de requisições
- `User.java`, `Role.java` — entidade de usuário e papéis (`ADMIN`, `USER`)

## Classes (notas de método)

- [[AuthController]] — rotas register/login/me
- [[AuthService]] — orquestra registro e login
- [[JwtService]] — geração/validação do JWT
- [[CustomUserDetailsService]] — adapta `User` para o Spring Security

Config/filtros de segurança (`SecurityConfig`, `JwtAuthenticationFilter`,
`RateLimitFilter`) têm nota própria na rodada 2.

## Conexões

- Protege escrita em [[Weapons]] (POST/PUT/DELETE exigem JWT).
- Detalhado em [[SECURITY_IMPLEMENTATION]].
- Persistência sustentada por [[Infra-MOC]].
