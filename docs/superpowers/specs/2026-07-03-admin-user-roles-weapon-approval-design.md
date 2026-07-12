---
tags: [spec, backend, admin, submissions]
aliases: [Roles ADMIN USER e Fila de Aprovação de Armas — Design]
up: "[[INDEX]]"
related:
  - "[[Admin]]"
  - "[[Submission]]"
  - "[[Weapons]]"
  - "[[2026-07-03-admin-user-roles-weapon-approval-plan]]"
status: ativo
---

# Roles ADMIN/USER + Fila de Aprovação de Armas + Rate Limiting — Design Spec

> Ver também: plano: [[2026-07-03-admin-user-roles-weapon-approval-plan]] · [[Admin]] · [[Submission]] · [[Weapons]]

**Data:** 2026-07-03
**Escopo:** Backend. Introduz roles de verdade (ADMIN/USER) com permissões diferenciadas, um fluxo
de submissão/aprovação para USER criar ou editar armas (tipo "code review" feito pelo ADMIN), um
dashboard administrativo, e rate limiting (429) em todos os endpoints. Primeira entidade coberta
pela fila: **Weapon**. Armaduras/inimigos/biomas/bosses repetem o mesmo padrão em ciclos futuros.

---

## 1. Objetivo

Diferenciar o que uma conta ADMIN e uma conta USER podem fazer:

- **ADMIN**: cria/edita/deleta armas diretamente (como já funciona hoje), aprova ou rejeita
  submissões de USER, e acessa um dashboard com contagens gerais (usuários, armas, submissões).
- **USER**: não edita o banco diretamente. Propõe criação ou edição de arma, que entra em uma fila
  de submissões `PENDING`. O ADMIN aprova (publica) ou rejeita (com motivo). O USER acompanha o
  status das próprias submissões e pode cancelar uma que ainda esteja pendente.

Além disso, todos os endpoints passam a ter tratamento de **429 Too Many Requests** (rate limiting).

---

## 2. Fora de escopo (decisões explícitas)

| Tema | Decisão |
|---|---|
| Criação de conta ADMIN | Sem endpoint de promoção. Só via seed/migration manual no banco. |
| Revisão do ADMIN | Aprova ou rejeita **como está** — não edita os dados da submissão antes de publicar. |
| Delete de arma | Exclusivo do ADMIN, direto (sem fila). USER não propõe remoção nesta versão. |
| Dashboard | Só conta o que existe hoje no backend (User, Weapon, WeaponSubmission). Sem campos para bioma/boss/inimigo, que ainda não existem como entidade backend. |
| Edição por qualquer USER | Qualquer USER autenticado pode propor edição em qualquer arma publicada (não só nas que criou). |
| Concorrência de edição | Bloqueada: uma arma só pode ter **uma** submissão `PENDING` por vez. |
| Rate limiting distribuído | Fora de escopo. Implementação em memória (single-instance), sem Redis — ver seção 7. |
| Outras entidades (armadura, boss, bioma, inimigo) | Fora de escopo. Este spec cobre só Weapon; o padrão se repete depois. |

---

## 3. Correção de bug pré-existente

`Role.java` tem um erro de digitação:

```java
public enum Role {
    USER,
    AD,MIN   // <- bug: dois valores (AD e MIN) em vez de ADMIN
}
```

Corrigir para:

```java
public enum Role {
    USER,
    ADMIN
}
```

Sem essa correção, `ROLE_ADMIN` nunca existe de verdade como authority, então nada do resto deste
spec funciona.

---

## 4. Modelo de dados

### 4.1 Nova entidade `WeaponSubmission`

Tabela `weapon_submissions`, estende `BaseEntity` (id + `createdAt`/`updatedAt` automáticos).

```java
@Entity
@Table(name = "weapon_submissions")
public class WeaponSubmission extends BaseEntity {
    @Enumerated(EnumType.STRING)
    private SubmissionType type;        // CREATE | UPDATE

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;    // PENDING | APPROVED | REJECTED (default PENDING)

    @ManyToOne
    private User submittedBy;           // autor da submissão

    @ManyToOne
    private Weapon targetWeapon;        // null se CREATE; obrigatório se UPDATE

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;     // preenchido só quando REJECTED

    // Dados propostos da arma (mesmos campos de CreateWeaponDTO)
    private String name;
    private Weapon.WeaponClass weaponClass;
    private Element element;
    private Integer baseDamage;
    private Integer criticalChance;
    private Double attacksPerTurn;
    private Integer range;
    private Integer rarity;
    private Integer price;
    private Integer quality;
    private String abilities;
    private String description;
    private String imageUrl;
}
```

Novos enums: `SubmissionType { CREATE, UPDATE }` e `SubmissionStatus { PENDING, APPROVED, REJECTED }`.

**Ao aprovar:** se `CREATE`, os campos propostos viram uma `Weapon` nova; se `UPDATE`, sobrescrevem
os campos de `targetWeapon`. A submissão permanece salva (não é deletada) como histórico, com status
`APPROVED`.

### 4.2 Novos DTOs

- `WeaponSubmissionRequestDTO` — mesmos campos de `CreateWeaponDTO` + `targetWeaponId` opcional
  (`Long`). Presente → `UPDATE`; ausente → `CREATE`.
- `WeaponSubmissionResponseDTO` — id, type, status, `submittedByUsername`, `targetWeaponId`
  (nullable), os campos propostos da arma, `rejectionReason` (nullable), `createdAt`, `updatedAt`.
- `RejectSubmissionRequestDTO` — `{ reason: String }` (`@NotBlank`, obrigatório).
- `AdminDashboardResponseDTO` — `totalUsers`, `totalAdmins`, `totalWeapons`, `pendingSubmissions`,
  `approvedSubmissions`, `rejectedSubmissions`.

---

## 5. Endpoints e regras de acesso

### 5.1 Armas — passam a ser ADMIN-only (direto, sem fila)

| Método | Endpoint | Role | Mudança |
|---|---|---|---|
| `POST` | `/api/v1/weapons` | `ADMIN` | Era `authenticated()`; agora exige `ROLE_ADMIN` |
| `PUT` | `/api/v1/weapons/{id}` | `ADMIN` | idem |
| `DELETE` | `/api/v1/weapons/{id}` | `ADMIN` | idem |

Os `GET`s continuam públicos, sem mudança.

### 5.2 Fila de submissões — `/api/v1/weapon-submissions`

| Método | Endpoint | Role | Descrição |
|---|---|---|---|
| `POST` | `/api/v1/weapon-submissions` | autenticado | Cria submissão (`CREATE` ou `UPDATE` conforme `targetWeaponId`) |
| `GET` | `/api/v1/weapon-submissions/mine` | autenticado | Lista as próprias submissões (todos os status) |
| `DELETE` | `/api/v1/weapon-submissions/{id}` | autor da submissão | Cancela, só se `PENDING` |
| `GET` | `/api/v1/weapon-submissions` | `ADMIN` | Lista submissões; filtro `?status=PENDING` (default) |
| `GET` | `/api/v1/weapon-submissions/{id}` | `ADMIN` | Detalhe de uma submissão |
| `POST` | `/api/v1/weapon-submissions/{id}/approve` | `ADMIN` | Aprova: publica/atualiza a `Weapon` |
| `POST` | `/api/v1/weapon-submissions/{id}/reject` | `ADMIN` | Rejeita; body `{ reason }` |

### 5.3 Dashboard administrativo

| Método | Endpoint | Role |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | `ADMIN` |

### 5.4 Como a role é aplicada

- `SecurityConfig` cobre as regras grossas: `/api/v1/weapon-submissions/**` exige `authenticated()`;
  `/api/v1/admin/**` exige `hasRole('ADMIN')` (regra de nível de path).
- `@PreAuthorize("hasRole('ADMIN')")` nos métodos do controller cobre as regras finas dentro de
  `/api/v1/weapon-submissions/**` (listar tudo, detalhe, approve, reject) — já é possível porque
  `@EnableMethodSecurity(prePostEnabled = true)` já está habilitado em `SecurityConfig`.
- A checagem "só o autor cancela" é feita no **service** (compara `submittedBy` com o usuário
  autenticado), pois depende de carregar a entidade primeiro — não dá para expressar só com
  `@PreAuthorize`.
- **Usuário atual:** o controller lê `Authentication.getName()` (e-mail, é o que o JWT já popula
  hoje) e repassa para o service, que busca o `User` via `UserRepository.findByEmail`.

---

## 6. Fluxo completo

```
                POST /weapon-submissions
                         │
                         ▼
                     PENDING ──────────────┐
                    /        \             │
   POST /{id}/approve      POST /{id}/reject   DELETE /{id}
        │                       │           (só o autor,
        ▼                       ▼            só se PENDING)
    APPROVED                REJECTED             │
  (Weapon criada/           (rejectionReason      ▼
   atualizada)               obrigatório)      removida
```

1. **USER envia** `POST /weapon-submissions`. Validações: DTO (`@Valid`); se `targetWeaponId`
   presente, a `Weapon` precisa existir (404 se não) e não pode haver outra submissão `PENDING`
   para o mesmo `targetWeaponId` (409).
2. **ADMIN lista pendentes** via `GET /weapon-submissions?status=PENDING`.
3. **ADMIN aprova** (`POST /{id}/approve`): submissão precisa estar `PENDING` (409 se não); publica
   ou atualiza a `Weapon`; submissão vira `APPROVED` (mantida como histórico).
4. **ADMIN rejeita** (`POST /{id}/reject`): submissão precisa estar `PENDING` (409 se não); vira
   `REJECTED` com o motivo salvo.
5. **USER cancela** (`DELETE /{id}`): só o autor (403 se não for), só se `PENDING` (409 se não).
6. **USER consulta histórico** via `GET /weapon-submissions/mine`.

---

## 7. Rate limiting (429 em todos os endpoints)

**Abordagem:** filtro global (`RateLimitFilter extends OncePerRequestFilter`), registrado no
`SecurityConfig` antes do `JwtAuthenticationFilter` — rejeita cedo, antes de gastar tempo validando
JWT ou tocando no banco.

- **Biblioteca:** `bucket4j-core`, em memória (`ConcurrentHashMap<chave, Bucket>`). Sem Redis —
  adequado porque a aplicação roda como instância única.
- **Chave:** IP do cliente (header `X-Forwarded-For` se presente, senão `request.getRemoteAddr()`).
  Limite por IP, não por usuário — mais simples e cobre tanto rotas públicas quanto autenticadas.
- **Limites (token bucket, refill por minuto):**
  - `/api/v1/auth/**` (login/register): **5 requisições/minuto** por IP — proteção contra
    brute-force.
  - Todas as demais rotas `/api/v1/**`: **60 requisições/minuto** por IP.
- **Resposta ao exceder:** `429 Too Many Requests`, header `Retry-After` (segundos até o próximo
  token), corpo JSON no mesmo formato usado pelo `GlobalExceptionHandler`:

  ```json
  { "status": 429, "message": "Muitas requisições. Tente novamente em instantes." }
  ```

  **Importante:** por ser um `Filter` (executa antes do `DispatcherServlet`), esse corpo é escrito
  diretamente pelo filtro — não passa pelo `@RestControllerAdvice`, que só intercepta exceções
  lançadas durante o processamento do Spring MVC. O formato é mantido igual por consistência, mas a
  implementação é separada.

---

## 8. Tratamento de erros

Reaproveita o padrão existente no `GlobalExceptionHandler`, com 2 exceções novas:

| Situação | Status | Mecanismo |
|---|---|---|
| Corpo inválido (`@Valid` falhou) | 400 | `MethodArgumentNotValidException` (já existe) |
| Sem token / token inválido | 401 | Spring Security (já existe via filtro) |
| Role errada em endpoint `@PreAuthorize`/`SecurityConfig` | 403 | **Novo:** handler para `AccessDeniedException` (hoje inexistente — não havia `@PreAuthorize` no projeto antes) |
| Cancelar submissão de outro usuário | 403 | **Nova exceção** `ForbiddenActionException` |
| Submissão ou arma-alvo não encontrada | 404 | `RuntimeException` genérica (mesmo padrão de `WeaponService.findById`) |
| Já existe submissão `PENDING` para a mesma arma | 409 | Reaproveita `DuplicateResourceException` (já mapeada para 409) |
| Aprovar/rejeitar/cancelar submissão que não está `PENDING` | 409 | **Nova exceção** `InvalidSubmissionStateException` |
| Rate limit excedido | 429 | `RateLimitFilter` escreve a resposta diretamente (não passa pelo `GlobalExceptionHandler` — ver seção 7) |

---

## 9. Testes

Seguindo a regra do projeto de testes automatizados verificarem correção de código (não qualidade
visual — não se aplica aqui, é backend):

| Área | Cenários |
|---|---|
| `WeaponSubmissionService` (unit) | Criar `CREATE`/`UPDATE`; bloquear segunda submissão `PENDING` para a mesma arma (409); aprovar `CREATE` cria `Weapon`; aprovar `UPDATE` sobrescreve `Weapon` existente; aprovar/rejeitar/cancelar fora do estado `PENDING` (409); cancelar por não-autor (403) |
| `SecurityConfig` (integração) | `POST/PUT/DELETE /weapons` bloqueado para `ROLE_USER` (403) e permitido para `ROLE_ADMIN`; `/weapon-submissions` endpoints de admin bloqueados para `ROLE_USER` |
| `RateLimitFilter` (unit) | Dentro do limite → passa; excedido → 429 com `Retry-After`; IPs diferentes têm buckets independentes |
| `GlobalExceptionHandler` (unit) | Novo handler de `AccessDeniedException` retorna 403 no formato padrão |
| Role enum | Confirma `Role.ADMIN` existe e `CustomUserDetailsService` gera `ROLE_ADMIN` corretamente após a correção do typo |

**Nota de infraestrutura de teste:** este Spring Boot 4.x não tem `@DataJpaTest` nem
`@AutoConfigureMockMvc` (removidos do `spring-boot-test-autoconfigure`). Seguir o workaround já
validado no projeto: `@SpringBootTest(webEnvironment = WebEnvironment.NONE) + @Transactional` sobre
o perfil H2 de teste para repositório/service, e `MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity())`
para os testes de controller/segurança.

---

## 10. Arquivos

**Novos**
- `domain/entity/WeaponSubmission.java`
- `domain/entity/SubmissionType.java`, `domain/entity/SubmissionStatus.java`
- `domain/repository/WeaponSubmissionRepository.java`
- `domain/dto/WeaponSubmissionRequestDTO.java`, `WeaponSubmissionResponseDTO.java`, `RejectSubmissionRequestDTO.java`, `AdminDashboardResponseDTO.java`
- `application/service/WeaponSubmissionService.java`
- `application/service/AdminDashboardService.java`
- `application/mapper/WeaponSubmissionMapper.java`
- `api/controller/WeaponSubmissionController.java`, `AdminController.java`
- `api/exception/ForbiddenActionException.java`, `InvalidSubmissionStateException.java`
- `config/RateLimitFilter.java`

**Modificados**
- `domain/entity/Role.java` — corrige typo `AD,MIN` → `ADMIN`
- `config/SecurityConfig.java` — `/weapons` POST/PUT/DELETE → `hasRole('ADMIN')`; `/admin/**` → `hasRole('ADMIN')`; registra `RateLimitFilter`
- `api/exception/GlobalExceptionHandler.java` — handlers para `AccessDeniedException`, `ForbiddenActionException`, `InvalidSubmissionStateException`
- `pom.xml` (ou `build.gradle`) — dependência `bucket4j-core`

---

## 11. Fora de escopo (repetido para clareza)

Armadura/inimigo/boss/bioma na fila de submissões (padrão se repete depois, entidade por entidade);
endpoint de promoção de USER para ADMIN; edição pelo ADMIN dos dados de uma submissão antes de
aprovar; fila de remoção (delete) para USER; rate limiting distribuído (Redis) ou por usuário
autenticado.
