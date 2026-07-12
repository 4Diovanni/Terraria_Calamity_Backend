---
tags: [backend, config, security]
aliases: [RateLimitFilter]
up: "[[Auth]]"
related:
  - "[[JwtAuthenticationFilter]]"
  - "[[SecurityConfig]]"
status: ativo
source: src/main/java/com/terraria/calamity/config/RateLimitFilter.java
---

# RateLimitFilter

`OncePerRequestFilter` de rate limiting por IP via Bucket4j em memória
(single-instance). Roda **antes** do [[JwtAuthenticationFilter]] para rejeitar cedo,
sem validar token nem tocar no banco.

## Limites

- 5/min em `POST /api/v1/auth/register` e `/login`
- 60/min nas demais `/api/v1/**`

## Métodos

### `doFilterInternal(request, response, chain) -> void`
Resolve o IP, escolhe o bucket (auth vs default), tenta consumir 1 token; se ok segue,
senão responde **429** com `Retry-After` e corpo JSON.

### `newBucket(capacityPerMinute) -> Bucket`
Cria um bucket Bucket4j com refill greedy por minuto.

### `resolveClientIp(request) -> String`
Usa `getRemoteAddr()` — **ignora `X-Forwarded-For` de propósito** (é forjável pelo
cliente e permitiria girar de IP pra furar o limite).

### `isStrictAuthRoute(method, uri) -> boolean`
True para os POST de register/login (limite estrito).

## Conexões

- Primeiro filtro da cadeia definida em [[SecurityConfig]].
