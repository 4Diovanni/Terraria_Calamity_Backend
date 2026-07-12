---
tags: [backend, service, auth]
aliases: [JwtService]
up: "[[Auth]]"
related:
  - "[[AuthService]]"
  - "[[JwtAuthenticationFilter]]"
status: ativo
source: src/main/java/com/terraria/calamity/application/service/JwtService.java
---

# JwtService

Geração e validação de JWT de acesso (HS256). O **subject do token é o e-mail** do
usuário. A chave e a expiração vêm de `jwt.secret`/`jwt.expiration`; avisa em log se
estiver usando o secret padrão de desenvolvimento.

## Métodos

### `generateToken(email) -> String`
Monta o JWT assinado (subject=email, issuedAt, expiration). **Chamado por:**
[[AuthService]] (register/login).

### `extractEmail(token) -> String`
Lê o subject (e-mail) do token. **Chamado por:** [[JwtAuthenticationFilter]].

### `isValid(token) -> boolean`
Valida assinatura/expiração; false em qualquer exceção. **Chamado por:**
[[JwtAuthenticationFilter]].

### `parse(token) -> Claims` · privado
Faz o parse verificado dos claims; base de `extractEmail`/`isValid`.

## Conexões

- Usado por [[AuthService]] (emissão) e [[JwtAuthenticationFilter]] (validação por request).
