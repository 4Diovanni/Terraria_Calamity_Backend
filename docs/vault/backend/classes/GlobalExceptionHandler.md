---
tags: [backend, exception]
aliases: [GlobalExceptionHandler]
up: "[[Backend-MOC]]"
related:
  - "[[AuthService]]"
  - "[[SubmissionService]]"
  - "[[WeaponService]]"
status: ativo
source: src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java
---

# GlobalExceptionHandler

`@RestControllerAdvice` que traduz exceções de domínio em respostas HTTP com corpo
JSON `{status, message}` uniforme. Ponto central de mapeamento exceção → status.

## Métodos (handlers)

### `handleDuplicate(DuplicateResourceException) -> 409`
E-mail/username já usados (de [[AuthService]]) ou proposta pendente duplicada
(de [[SubmissionService]]).

### `handleBadCredentials(BadCredentialsException) -> 401`
Login inválido (de [[AuthService]]).

### `handleAccessDenied(AccessDeniedException) -> 403`
Permissão insuficiente (falha de `@PreAuthorize`).

### `handleForbiddenAction(ForbiddenActionException) -> 403`
Ação proibida (ex.: cancelar proposta de outro autor, de [[SubmissionService]]).

### `handleInvalidSubmissionState(InvalidSubmissionStateException) -> 409`
Transição de estado inválida na submissão (de [[SubmissionService]]).

### `handleResourceInUse(ResourceInUseException) -> 409`
Recurso em uso (ex.: deletar arma com submissão, de [[WeaponService]]).

### `handleValidationExceptions(MethodArgumentNotValidException) -> 400`
Falha de `@Valid`; devolve mapa `campo → mensagem`.

### `handleRuntimeException(RuntimeException) -> 404`
Fallback: qualquer `RuntimeException` (usada para "not found" em todos os services)
vira 404.

## Conexões

- Captura exceções lançadas por [[AuthService]], [[SubmissionService]],
  [[WeaponService]], [[ArmorService]] e pelo Spring Security.
