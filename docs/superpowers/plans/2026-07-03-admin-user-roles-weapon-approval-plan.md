# Roles ADMIN/USER + Fila de Aprovação de Armas + Rate Limiting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diferenciar permissões ADMIN/USER no backend: ADMIN cria/edita/deleta armas direto e aprova/rejeita submissões; USER propõe criação/edição de arma via fila de aprovação; ADMIN tem um dashboard de contagens; e todos os endpoints tratam 429 (rate limit).

**Architecture:** Nova entidade `WeaponSubmission` (tabela própria) guarda o que o USER propôs; ao ser aprovada, o service publica/atualiza a `Weapon` real. `SecurityConfig` restringe `/api/v1/weapons` (POST/PUT/DELETE) e `/api/v1/admin/**` a `ROLE_ADMIN`; `@PreAuthorize` cobre as rotas de admin dentro de `/api/v1/weapon-submissions/**`. Um `OncePerRequestFilter` (`RateLimitFilter`, Bucket4j em memória) roda antes do `JwtAuthenticationFilter` e devolve 429 por IP.

**Tech Stack:** Spring Boot 4.1.0 (Java 21), Spring Data JPA + PostgreSQL/Flyway (H2 nos testes), Spring Security 6 (`@EnableMethodSecurity`), Lombok, Bucket4j 8.10.1, JUnit 5 + Mockito + AssertJ + MockMvc.

## Global Constraints

- Spec de referência: `docs/superpowers/specs/2026-07-03-admin-user-roles-weapon-approval-design.md`.
- Java 21, Maven (`./mvnw`), Spring Boot 4.1.0 — sem `@DataJpaTest`/`@AutoConfigureMockMvc` (removidos do `spring-boot-test-autoconfigure` nesta versão).
- Testes de repositório/service com Spring context: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE) + @Transactional`, rodando sobre o perfil H2 de teste (`src/test/resources/application.yml`, Flyway desabilitado, `ddl-auto=create-drop`).
- Testes de controller/segurança: `MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity()).build()`.
- Conventional Commits (`feat(scope):`, `fix(scope):`, `test(scope):`, `docs:`). Um commit por task. **Nunca commitar com testes falhando.**
- Não usar `spring-dotenv`. Não commitar diretamente na branch `main`.
- Nenhuma migração de dados é necessária para o fix do enum `Role` (não existem contas com role diferente de `USER` hoje, pois o registro público sempre usa `Role.USER`).
- Produção usa Flyway (`ddl-auto: validate`) — toda mudança de schema precisa de um arquivo `V{n}__*.sql` em `src/main/resources/db/migration`. A próxima versão livre é `V8` (main já tem V1–V7: V5/V6/V7 foram usadas pela feature de armadura).

---

### Task 1: Corrigir bug do enum `Role` — **OBSOLETA, PULAR** (ajuste pós-plano)

> `Role.java` já está correto na `main` atual (`public enum Role { USER, ADMIN }`) — o typo `AD,MIN` descrito abaixo não existe no código. Não criar `RoleTest`, não rodar nenhum step desta task. `Role.ADMIN` já está disponível para as tasks seguintes. Conteúdo original mantido abaixo só como referência histórica do spec.

**Files:**
- Modify: `src/main/java/com/terraria/calamity/domain/entity/Role.java`
- Test: `src/test/java/com/terraria/calamity/domain/entity/RoleTest.java`

**Interfaces:**
- Produces: `Role.ADMIN` (valor de enum válido, usado por todas as tasks seguintes via `hasRole("ADMIN")` / `Role.ADMIN`)

- [ ] **Step 1: Escrever o teste que falha**

```java
package com.terraria.calamity.domain.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RoleTest {

    @Test
    void role_hasExactlyUserAndAdminValues() {
        assertThat(Role.values()).containsExactly(Role.USER, Role.ADMIN);
    }

    @Test
    void role_adminIsParseableFromString() {
        assertThat(Role.valueOf("ADMIN")).isEqualTo(Role.ADMIN);
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=RoleTest`
Expected: FALHA de compilação — `Role.ADMIN` não existe (o enum atual só tem `USER`, `AD`, `MIN`).

- [ ] **Step 3: Corrigir o enum**

Conteúdo final de `src/main/java/com/terraria/calamity/domain/entity/Role.java`:

```java
package com.terraria.calamity.domain.entity;

public enum Role {
    USER,
    ADMIN
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=RoleTest`
Expected: PASS (2 testes verdes)

- [ ] **Step 5: Rodar a suíte completa para garantir que nada quebrou**

Run: `./mvnw test`
Expected: PASS (nenhum teste existente dependia dos valores antigos `AD`/`MIN`)

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/entity/Role.java src/test/java/com/terraria/calamity/domain/entity/RoleTest.java
git commit -m "fix(auth): corrige typo no enum Role (AD,MIN -> ADMIN)"
```

---

### Task 2: Enums de submissão + entidade `WeaponSubmission` + migração + repositório

**Files:**
- Create: `src/main/java/com/terraria/calamity/domain/entity/SubmissionType.java`
- Create: `src/main/java/com/terraria/calamity/domain/entity/SubmissionStatus.java`
- Create: `src/main/java/com/terraria/calamity/domain/entity/WeaponSubmission.java`
- Create: `src/main/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepository.java`
- Create: `src/main/resources/db/migration/V8__Create_weapon_submissions_table.sql`
- Test: `src/test/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepositoryTest.java`

**Interfaces:**
- Consumes: `BaseEntity` (`src/main/java/com/terraria/calamity/domain/entity/BaseEntity.java`), `User` (`domain/entity/User.java`), `Weapon`/`Weapon.WeaponClass` (`domain/entity/Weapon.java`), `Element` (`domain/entity/Element.java`)
- Produces:
  - `SubmissionType { CREATE, UPDATE }`
  - `SubmissionStatus { PENDING, APPROVED, REJECTED }`
  - `WeaponSubmission extends BaseEntity` com getters/setters Lombok (`@Data`) para: `type`, `status`, `submittedBy` (`User`), `targetWeapon` (`Weapon`, nullable), `rejectionReason`, `name`, `weaponClass`, `element`, `baseDamage`, `criticalChance`, `attacksPerTurn`, `range`, `rarity`, `price`, `quality`, `abilities`, `description`, `imageUrl`
  - `WeaponSubmissionRepository extends JpaRepository<WeaponSubmission, Long>` com:
    - `List<WeaponSubmission> findBySubmittedByOrderByCreatedAtDesc(User submittedBy)`
    - `List<WeaponSubmission> findByStatusOrderByCreatedAtAsc(SubmissionStatus status)`
    - `boolean existsByTargetWeaponIdAndStatus(Long targetWeaponId, SubmissionStatus status)`
    - `long countByStatus(SubmissionStatus status)`

- [ ] **Step 1: Escrever o teste de repositório que falha**

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class WeaponSubmissionRepositoryTest {

    @Autowired private WeaponSubmissionRepository submissionRepository;
    @Autowired private WeaponRepository weaponRepository;
    @Autowired private UserRepository userRepository;

    private User saveUser(String email) {
        return userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password("hashed")
                .role(Role.USER)
                .enabled(true)
                .build());
    }

    private Weapon saveWeapon(String name) {
        return weaponRepository.save(Weapon.builder()
                .name(name)
                .weaponClass(Weapon.WeaponClass.MELEE)
                .element(Element.FIRE)
                .baseDamage(10)
                .criticalChance(5)
                .attacksPerTurn(1.0)
                .range(10)
                .rarity(1)
                .price(100)
                .quality(1)
                .build());
    }

    @Test
    void existsByTargetWeaponIdAndStatus_returnsTrue_whenPendingSubmissionExists() {
        User author = saveUser("author@terraria.com");
        Weapon weapon = saveWeapon("Excalibur");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.UPDATE)
                .status(SubmissionStatus.PENDING)
                .submittedBy(author)
                .targetWeapon(weapon)
                .name("Excalibur Melhorada")
                .weaponClass(Weapon.WeaponClass.MELEE)
                .element(Element.HOLY)
                .baseDamage(20)
                .criticalChance(10)
                .attacksPerTurn(1.5)
                .range(15)
                .rarity(2)
                .price(200)
                .quality(2)
                .build());

        assertThat(submissionRepository.existsByTargetWeaponIdAndStatus(weapon.getId(), SubmissionStatus.PENDING)).isTrue();
        assertThat(submissionRepository.existsByTargetWeaponIdAndStatus(weapon.getId(), SubmissionStatus.APPROVED)).isFalse();
    }

    @Test
    void findBySubmittedByOrderByCreatedAtDesc_returnsOnlyOwnSubmissions() {
        User author = saveUser("owner@terraria.com");
        User other = saveUser("other@terraria.com");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author)
                .name("Arma do Owner").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(15).criticalChance(5).attacksPerTurn(1.2).range(20).rarity(1).price(150).quality(1)
                .build());

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(other)
                .name("Arma do Other").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(15).criticalChance(5).attacksPerTurn(1.2).range(20).rarity(1).price(150).quality(1)
                .build());

        var result = submissionRepository.findBySubmittedByOrderByCreatedAtDesc(author);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Arma do Owner");
    }

    @Test
    void countByStatus_countsOnlyMatchingStatus() {
        User author = saveUser("counter@terraria.com");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author)
                .name("Pendente").weaponClass(Weapon.WeaponClass.MAGE).element(Element.ARCANE)
                .baseDamage(30).criticalChance(8).attacksPerTurn(1.0).range(25).rarity(3).price(500).quality(3)
                .build());

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(author)
                .name("Aprovada").weaponClass(Weapon.WeaponClass.MAGE).element(Element.ARCANE)
                .baseDamage(30).criticalChance(8).attacksPerTurn(1.0).range(25).rarity(3).price(500).quality(3)
                .build());

        assertThat(submissionRepository.countByStatus(SubmissionStatus.PENDING)).isEqualTo(1);
        assertThat(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).isEqualTo(1);
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponSubmissionRepositoryTest`
Expected: FALHA de compilação — nenhuma das classes (`SubmissionType`, `SubmissionStatus`, `WeaponSubmission`, `WeaponSubmissionRepository`) existe ainda.

- [ ] **Step 3: Criar os enums**

`src/main/java/com/terraria/calamity/domain/entity/SubmissionType.java`:

```java
package com.terraria.calamity.domain.entity;

public enum SubmissionType {
    CREATE,
    UPDATE
}
```

`src/main/java/com/terraria/calamity/domain/entity/SubmissionStatus.java`:

```java
package com.terraria.calamity.domain.entity;

public enum SubmissionStatus {
    PENDING,
    APPROVED,
    REJECTED
}
```

- [ ] **Step 4: Criar a entidade `WeaponSubmission`**

`src/main/java/com/terraria/calamity/domain/entity/WeaponSubmission.java`:

```java
package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Proposta de criação/edição de uma Weapon feita por um USER, aguardando
 * aprovação ou rejeição de um ADMIN. Mapeia para a tabela 'weapon_submissions'.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "weapon_submissions")
public class WeaponSubmission extends BaseEntity {

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_weapon_id")
    private Weapon targetWeapon;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Weapon.WeaponClass weaponClass;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Element element;

    @NotNull
    @Column(nullable = false)
    private Integer baseDamage;

    @Column(nullable = false)
    private Integer criticalChance;

    @NotNull
    @Column(nullable = false)
    private Double attacksPerTurn;

    @Column(nullable = false)
    private Integer range;

    @NotNull
    @Column(nullable = false)
    private Integer rarity;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Integer quality;

    @Column(columnDefinition = "TEXT")
    private String abilities;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;
}
```

- [ ] **Step 5: Criar o repositório**

`src/main/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepository.java`:

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeaponSubmissionRepository extends JpaRepository<WeaponSubmission, Long> {
    List<WeaponSubmission> findBySubmittedByOrderByCreatedAtDesc(User submittedBy);

    List<WeaponSubmission> findByStatusOrderByCreatedAtAsc(SubmissionStatus status);

    boolean existsByTargetWeaponIdAndStatus(Long targetWeaponId, SubmissionStatus status);

    long countByStatus(SubmissionStatus status);
}
```

- [ ] **Step 6: Criar a migração Flyway (schema de produção)**

`src/main/resources/db/migration/V8__Create_weapon_submissions_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS weapon_submissions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_by_id BIGINT NOT NULL REFERENCES users(id),
    target_weapon_id BIGINT REFERENCES weapons(id),
    rejection_reason TEXT,
    name VARCHAR(100) NOT NULL,
    weapon_class VARCHAR(50) NOT NULL,
    element VARCHAR(50) NOT NULL,
    base_damage INTEGER NOT NULL,
    critical_chance INTEGER NOT NULL,
    attacks_per_turn DOUBLE PRECISION NOT NULL,
    range INTEGER NOT NULL,
    rarity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    quality INTEGER NOT NULL,
    abilities TEXT,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weapon_submissions_status ON weapon_submissions(status);
CREATE INDEX idx_weapon_submissions_submitted_by ON weapon_submissions(submitted_by_id);
CREATE INDEX idx_weapon_submissions_target_weapon ON weapon_submissions(target_weapon_id);
```

(Os testes usam `ddl-auto=create-drop` com Flyway desligado — este arquivo só é lido em produção/dev reais, mas precisa existir para o `mvnw spring-boot:run` local não quebrar por schema desatualizado.)

- [ ] **Step 7: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponSubmissionRepositoryTest`
Expected: PASS (3 testes verdes)

- [ ] **Step 8: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/entity/SubmissionType.java src/main/java/com/terraria/calamity/domain/entity/SubmissionStatus.java src/main/java/com/terraria/calamity/domain/entity/WeaponSubmission.java src/main/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepository.java src/main/resources/db/migration/V8__Create_weapon_submissions_table.sql src/test/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepositoryTest.java
git commit -m "feat(weapons): adiciona entidade WeaponSubmission e repositorio da fila de aprovacao"
```

---

### Task 3: Exceções `ForbiddenActionException`/`InvalidSubmissionStateException` + handlers

**Files:**
- Create: `src/main/java/com/terraria/calamity/api/exception/ForbiddenActionException.java`
- Create: `src/main/java/com/terraria/calamity/api/exception/InvalidSubmissionStateException.java`
- Modify: `src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/terraria/calamity/api/exception/GlobalExceptionHandlerTest.java`

**Interfaces:**
- Produces:
  - `ForbiddenActionException(String message) extends RuntimeException` → mapeada para 403
  - `InvalidSubmissionStateException(String message) extends RuntimeException` → mapeada para 409
  - `GlobalExceptionHandler` ganha handler para `org.springframework.security.access.AccessDeniedException` → 403

- [ ] **Step 1: Escrever o teste que falha**

```java
package com.terraria.calamity.api.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAccessDenied_returns403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("status", 403);
    }

    @Test
    void handleForbiddenAction_returns403WithMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleForbiddenAction(new ForbiddenActionException("Only the author can cancel this submission"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("message", "Only the author can cancel this submission");
    }

    @Test
    void handleInvalidSubmissionState_returns409WithMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidSubmissionState(new InvalidSubmissionStateException("Only PENDING submissions can be approved"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Only PENDING submissions can be approved");
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=GlobalExceptionHandlerTest`
Expected: FALHA de compilação — `ForbiddenActionException`, `InvalidSubmissionStateException` e os métodos `handleAccessDenied`/`handleForbiddenAction`/`handleInvalidSubmissionState` não existem ainda.

- [ ] **Step 3: Criar as exceções**

`src/main/java/com/terraria/calamity/api/exception/ForbiddenActionException.java`:

```java
package com.terraria.calamity.api.exception;

/**
 * Lancada quando um usuario tenta uma acao que so o dono do recurso pode fazer
 * (ex.: cancelar a submissao de outro usuario). Mapeada para HTTP 403.
 */
public class ForbiddenActionException extends RuntimeException {
    public ForbiddenActionException(String message) {
        super(message);
    }
}
```

`src/main/java/com/terraria/calamity/api/exception/InvalidSubmissionStateException.java`:

```java
package com.terraria.calamity.api.exception;

/**
 * Lancada ao tentar aprovar/rejeitar/cancelar uma WeaponSubmission que nao
 * esta mais PENDING. Mapeada para HTTP 409.
 */
public class InvalidSubmissionStateException extends RuntimeException {
    public InvalidSubmissionStateException(String message) {
        super(message);
    }
}
```

- [ ] **Step 4: Adicionar os handlers**

Conteúdo final de `src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java`:

```java
package com.terraria.calamity.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("message", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("message", "Access denied: insufficient permissions");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(ForbiddenActionException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenAction(ForbiddenActionException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(InvalidSubmissionStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidSubmissionState(InvalidSubmissionStateException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", "Validation failed");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        response.put("errors", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
```

- [ ] **Step 5: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=GlobalExceptionHandlerTest`
Expected: PASS (3 testes verdes)

- [ ] **Step 6: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/terraria/calamity/api/exception/ForbiddenActionException.java src/main/java/com/terraria/calamity/api/exception/InvalidSubmissionStateException.java src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java src/test/java/com/terraria/calamity/api/exception/GlobalExceptionHandlerTest.java
git commit -m "feat(errors): adiciona excecoes e handlers para 403/409 da fila de submissoes"
```

---

### Task 4: DTOs de submissão + `WeaponSubmissionMapper`

**Files:**
- Create: `src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionRequestDTO.java`
- Create: `src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionResponseDTO.java`
- Create: `src/main/java/com/terraria/calamity/domain/dto/RejectSubmissionRequestDTO.java`
- Create: `src/main/java/com/terraria/calamity/domain/dto/AdminDashboardResponseDTO.java`
- Create: `src/main/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapper.java`
- Test: `src/test/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapperTest.java`

**Interfaces:**
- Consumes: `WeaponSubmission` (Task 2), `Weapon`/`Weapon.WeaponClass`, `Element`, `User`, `SubmissionType`, `SubmissionStatus`
- Produces:
  - `record WeaponSubmissionRequestDTO(Long targetWeaponId, String name, Weapon.WeaponClass weaponClass, Element element, Integer baseDamage, Integer criticalChance, Double attacksPerTurn, Integer range, Integer rarity, Integer price, Integer quality, String abilities, String description, String imageUrl)`
  - `record WeaponSubmissionResponseDTO(Long id, SubmissionType type, SubmissionStatus status, String submittedByUsername, Long targetWeaponId, String name, Weapon.WeaponClass weaponClass, Element element, Integer baseDamage, Integer criticalChance, Double attacksPerTurn, Integer range, Integer rarity, Integer price, Integer quality, String abilities, String description, String imageUrl, String rejectionReason, LocalDateTime createdAt, LocalDateTime updatedAt)`
  - `record RejectSubmissionRequestDTO(String reason)` (`@NotBlank`)
  - `record AdminDashboardResponseDTO(long totalUsers, long totalAdmins, long totalWeapons, long pendingSubmissions, long approvedSubmissions, long rejectedSubmissions)`
  - `WeaponSubmissionMapper`:
    - `WeaponSubmission toEntity(WeaponSubmissionRequestDTO dto, User submittedBy, Weapon targetWeapon, SubmissionType type)`
    - `WeaponSubmissionResponseDTO toResponseDTO(WeaponSubmission submission)`
    - `Weapon toApprovedWeapon(WeaponSubmission submission)`
    - `void applyToExistingWeapon(WeaponSubmission submission, Weapon weapon)`

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapperTest.java`:

```java
package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeaponSubmissionMapperTest {

    private final WeaponSubmissionMapper mapper = new WeaponSubmissionMapper();

    private WeaponSubmissionRequestDTO sampleRequest(Long targetWeaponId) {
        return new WeaponSubmissionRequestDTO(
                targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "Uma espada lendária", "https://example.com/terrablade.png");
    }

    private User sampleUser() {
        return User.builder().username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
    }

    @Test
    void toEntity_copiesAllProposedFields() {
        WeaponSubmission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        assertThat(submission.getType()).isEqualTo(SubmissionType.CREATE);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(submission.getSubmittedBy().getUsername()).isEqualTo("calamitas");
        assertThat(submission.getTargetWeapon()).isNull();
        assertThat(submission.getName()).isEqualTo("Terra Blade");
        assertThat(submission.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(submission.getElement()).isEqualTo(Element.HOLY);
        assertThat(submission.getBaseDamage()).isEqualTo(50);
        assertThat(submission.getImageUrl()).isEqualTo("https://example.com/terrablade.png");
    }

    @Test
    void toApprovedWeapon_buildsWeaponFromSubmissionFields() {
        WeaponSubmission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        Weapon weapon = mapper.toApprovedWeapon(submission);

        assertThat(weapon.getName()).isEqualTo("Terra Blade");
        assertThat(weapon.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(weapon.getBaseDamage()).isEqualTo(50);
        assertThat(weapon.getRarity()).isEqualTo(5);
    }

    @Test
    void applyToExistingWeapon_overwritesTargetFields() {
        Weapon existing = Weapon.builder()
                .name("Old Name").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10)
                .rarity(1).price(100).quality(1).build();

        WeaponSubmission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), existing, SubmissionType.UPDATE);
        mapper.applyToExistingWeapon(submission, existing);

        assertThat(existing.getName()).isEqualTo("Terra Blade");
        assertThat(existing.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(existing.getBaseDamage()).isEqualTo(50);
    }

    @Test
    void toResponseDTO_mapsSubmittedByUsernameAndTargetWeaponId() {
        Weapon existing = Weapon.builder()
                .name("Old Name").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10)
                .rarity(1).price(100).quality(1).build();
        existing.setId(1L);

        WeaponSubmission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), existing, SubmissionType.UPDATE);
        submission.setId(10L);

        var responseDTO = mapper.toResponseDTO(submission);

        assertThat(responseDTO.id()).isEqualTo(10L);
        assertThat(responseDTO.submittedByUsername()).isEqualTo("calamitas");
        assertThat(responseDTO.targetWeaponId()).isEqualTo(1L);
        assertThat(responseDTO.type()).isEqualTo(SubmissionType.UPDATE);
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponSubmissionMapperTest`
Expected: FALHA de compilação — DTOs e `WeaponSubmissionMapper` não existem ainda.

- [ ] **Step 3: Criar os DTOs**

`src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionRequestDTO.java`:

```java
package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import jakarta.validation.constraints.*;

public record WeaponSubmissionRequestDTO(
    Long targetWeaponId,

    @NotBlank(message = "Name cannot be blank")
    String name,

    @NotNull(message = "Class cannot be null")
    Weapon.WeaponClass weaponClass,

    @NotNull(message = "Element cannot be null")
    Element element,

    @NotNull(message = "Base damage cannot be null")
    @Min(1)
    Integer baseDamage,

    @Min(1)
    @Max(20)
    Integer criticalChance,

    @NotNull(message = "Attack speed cannot be null")
    @Min(1)
    Double attacksPerTurn,

    @Min(0)
    Integer range,

    @NotNull(message = "Rarity cannot be null")
    @Min(-1)
    @Max(17)
    Integer rarity,

    @Min(0)
    Integer price,

    @Min(0)
    @Max(10)
    Integer quality,

    String abilities,
    String description,
    String imageUrl
) {}
```

`src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionResponseDTO.java`:

```java
package com.terraria.calamity.domain.dto;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.Weapon;

import java.time.LocalDateTime;

public record WeaponSubmissionResponseDTO(
    Long id,
    SubmissionType type,
    SubmissionStatus status,
    String submittedByUsername,
    Long targetWeaponId,
    String name,
    Weapon.WeaponClass weaponClass,
    Element element,
    Integer baseDamage,
    Integer criticalChance,
    Double attacksPerTurn,
    Integer range,
    Integer rarity,
    Integer price,
    Integer quality,
    String abilities,
    String description,
    String imageUrl,
    String rejectionReason,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
```

`src/main/java/com/terraria/calamity/domain/dto/RejectSubmissionRequestDTO.java`:

```java
package com.terraria.calamity.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectSubmissionRequestDTO(
    @NotBlank(message = "Reason cannot be blank")
    String reason
) {}
```

`src/main/java/com/terraria/calamity/domain/dto/AdminDashboardResponseDTO.java`:

```java
package com.terraria.calamity.domain.dto;

public record AdminDashboardResponseDTO(
    long totalUsers,
    long totalAdmins,
    long totalWeapons,
    long pendingSubmissions,
    long approvedSubmissions,
    long rejectedSubmissions
) {}
```

- [ ] **Step 4: Criar o mapper**

`src/main/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapper.java`:

```java
package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import org.springframework.stereotype.Component;

@Component
public class WeaponSubmissionMapper {

    public WeaponSubmission toEntity(WeaponSubmissionRequestDTO dto, User submittedBy, Weapon targetWeapon, SubmissionType type) {
        return WeaponSubmission.builder()
            .type(type)
            .submittedBy(submittedBy)
            .targetWeapon(targetWeapon)
            .name(dto.name())
            .weaponClass(dto.weaponClass())
            .element(dto.element())
            .baseDamage(dto.baseDamage())
            .criticalChance(dto.criticalChance())
            .attacksPerTurn(dto.attacksPerTurn())
            .range(dto.range())
            .rarity(dto.rarity())
            .price(dto.price())
            .quality(dto.quality())
            .abilities(dto.abilities())
            .description(dto.description())
            .imageUrl(dto.imageUrl())
            .build();
    }

    public WeaponSubmissionResponseDTO toResponseDTO(WeaponSubmission submission) {
        return new WeaponSubmissionResponseDTO(
            submission.getId(),
            submission.getType(),
            submission.getStatus(),
            submission.getSubmittedBy().getUsername(),
            submission.getTargetWeapon() != null ? submission.getTargetWeapon().getId() : null,
            submission.getName(),
            submission.getWeaponClass(),
            submission.getElement(),
            submission.getBaseDamage(),
            submission.getCriticalChance(),
            submission.getAttacksPerTurn(),
            submission.getRange(),
            submission.getRarity(),
            submission.getPrice(),
            submission.getQuality(),
            submission.getAbilities(),
            submission.getDescription(),
            submission.getImageUrl(),
            submission.getRejectionReason(),
            submission.getCreatedAt(),
            submission.getUpdatedAt()
        );
    }

    public Weapon toApprovedWeapon(WeaponSubmission submission) {
        return Weapon.builder()
            .name(submission.getName())
            .weaponClass(submission.getWeaponClass())
            .element(submission.getElement())
            .baseDamage(submission.getBaseDamage())
            .criticalChance(submission.getCriticalChance())
            .attacksPerTurn(submission.getAttacksPerTurn())
            .range(submission.getRange())
            .rarity(submission.getRarity())
            .price(submission.getPrice())
            .quality(submission.getQuality())
            .abilities(submission.getAbilities())
            .description(submission.getDescription())
            .imageUrl(submission.getImageUrl())
            .build();
    }

    public void applyToExistingWeapon(WeaponSubmission submission, Weapon weapon) {
        weapon.setName(submission.getName());
        weapon.setWeaponClass(submission.getWeaponClass());
        weapon.setElement(submission.getElement());
        weapon.setBaseDamage(submission.getBaseDamage());
        weapon.setCriticalChance(submission.getCriticalChance());
        weapon.setAttacksPerTurn(submission.getAttacksPerTurn());
        weapon.setRange(submission.getRange());
        weapon.setRarity(submission.getRarity());
        weapon.setPrice(submission.getPrice());
        weapon.setQuality(submission.getQuality());
        weapon.setAbilities(submission.getAbilities());
        weapon.setDescription(submission.getDescription());
        weapon.setImageUrl(submission.getImageUrl());
    }
}
```

- [ ] **Step 5: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponSubmissionMapperTest`
Expected: PASS (4 testes verdes)

- [ ] **Step 6: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionRequestDTO.java src/main/java/com/terraria/calamity/domain/dto/WeaponSubmissionResponseDTO.java src/main/java/com/terraria/calamity/domain/dto/RejectSubmissionRequestDTO.java src/main/java/com/terraria/calamity/domain/dto/AdminDashboardResponseDTO.java src/main/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapper.java src/test/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapperTest.java
git commit -m "feat(weapons): adiciona DTOs e mapper da fila de submissoes"
```

---

### Task 5: `WeaponSubmissionService` — `create()` e `findMine()`

**Files:**
- Create: `src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java`
- Test: `src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java`

**Interfaces:**
- Consumes: `WeaponSubmissionRepository`, `WeaponRepository`, `UserRepository`, `WeaponSubmissionMapper` (todas de tasks anteriores), `DuplicateResourceException`
- Produces:
  - `WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail)`
  - `List<WeaponSubmissionResponseDTO> findMine(String submitterEmail)`

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeaponSubmissionServiceTest {

    @Mock private WeaponSubmissionRepository submissionRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private UserRepository userRepository;
    @Mock private WeaponSubmissionMapper mapper;

    @InjectMocks private WeaponSubmissionService service;

    private User submitter() {
        return User.builder().username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
    }

    private WeaponSubmissionRequestDTO createRequest(Long targetWeaponId) {
        return new WeaponSubmissionRequestDTO(targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
    }

    private WeaponSubmissionResponseDTO responseFor(SubmissionType type, Long targetWeaponId) {
        return new WeaponSubmissionResponseDTO(
                1L, type, SubmissionStatus.PENDING, "calamitas", targetWeaponId,
                "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY, 50, 8, 1.3, 65, 5, 8000, 6,
                "Slash", "desc", "img", null, null, null);
    }

    @Test
    void create_withoutTargetWeaponId_createsCreateTypeSubmission() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        WeaponSubmission builtEntity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(mapper.toEntity(any(), any(), any(), any())).thenReturn(builtEntity);
        when(submissionRepository.save(builtEntity)).thenReturn(builtEntity);
        when(mapper.toResponseDTO(builtEntity)).thenReturn(responseFor(SubmissionType.CREATE, null));

        WeaponSubmissionResponseDTO result = service.create(createRequest(null), "calamitas@terraria.com");

        assertThat(result.type()).isEqualTo(SubmissionType.CREATE);
        assertThat(result.submittedByUsername()).isEqualTo("calamitas");
    }

    @Test
    void create_withTargetWeaponId_throwsWhenPendingSubmissionAlreadyExists() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        Weapon target = Weapon.builder().name("Excalibur").weaponClass(Weapon.WeaponClass.MELEE).element(Element.HOLY)
                .baseDamage(40).criticalChance(5).attacksPerTurn(1.0).range(50).rarity(4).price(5000).quality(5).build();
        target.setId(7L);
        when(weaponRepository.findById(7L)).thenReturn(Optional.of(target));
        when(submissionRepository.existsByTargetWeaponIdAndStatus(7L, SubmissionStatus.PENDING)).thenReturn(true);

        assertThatThrownBy(() -> service.create(createRequest(7L), "calamitas@terraria.com"))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_withUnknownTargetWeaponId_throwsRuntimeException() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(createRequest(999L), "calamitas@terraria.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findMine_returnsOnlySubmitterSubmissions() {
        User author = submitter();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(author));
        WeaponSubmission entity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findBySubmittedByOrderByCreatedAtDesc(author)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        List<WeaponSubmissionResponseDTO> result = service.findMine("calamitas@terraria.com");

        assertThat(result).containsExactly(responseDTO);
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponSubmissionServiceTest`
Expected: FALHA de compilação — `WeaponSubmissionService` não existe ainda.

- [ ] **Step 3: Implementar o service**

`src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WeaponSubmissionService {

    private final WeaponSubmissionRepository submissionRepository;
    private final WeaponRepository weaponRepository;
    private final UserRepository userRepository;
    private final WeaponSubmissionMapper mapper;

    public WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        Weapon targetWeapon = null;
        SubmissionType type = SubmissionType.CREATE;

        if (dto.targetWeaponId() != null) {
            targetWeapon = weaponRepository.findById(dto.targetWeaponId())
                    .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + dto.targetWeaponId()));
            type = SubmissionType.UPDATE;

            if (submissionRepository.existsByTargetWeaponIdAndStatus(dto.targetWeaponId(), SubmissionStatus.PENDING)) {
                throw new DuplicateResourceException(
                        "There is already a pending submission for weapon ID: " + dto.targetWeaponId());
            }
        }

        WeaponSubmission submission = mapper.toEntity(dto, submitter, targetWeapon, type);
        WeaponSubmission saved = submissionRepository.save(submission);
        return mapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findMine(String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        return submissionRepository.findBySubmittedByOrderByCreatedAtDesc(submitter).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponSubmissionServiceTest`
Expected: PASS (4 testes verdes)

- [ ] **Step 5: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java
git commit -m "feat(weapons): adiciona create/findMine ao WeaponSubmissionService"
```

---

### Task 6: `WeaponSubmissionService` — `approve()`/`reject()`/`cancel()`/`findByStatus()`/`findById()`

**Files:**
- Modify: `src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java`
- Modify: `src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java`

**Interfaces:**
- Consumes: `ForbiddenActionException`, `InvalidSubmissionStateException` (Task 3)
- Produces:
  - `List<WeaponSubmissionResponseDTO> findByStatus(SubmissionStatus status)`
  - `WeaponSubmissionResponseDTO findById(Long id)`
  - `void cancel(Long id, String requesterEmail)`
  - `WeaponSubmissionResponseDTO approve(Long id)`
  - `WeaponSubmissionResponseDTO reject(Long id, String reason)`

- [ ] **Step 1: Adicionar os testes que falham**

Adicionar estes métodos à classe `WeaponSubmissionServiceTest` (arquivo completo final):

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeaponSubmissionServiceTest {

    @Mock private WeaponSubmissionRepository submissionRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private UserRepository userRepository;
    @Mock private WeaponSubmissionMapper mapper;

    @InjectMocks private WeaponSubmissionService service;

    private User submitter() {
        return User.builder().username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
    }

    private WeaponSubmissionRequestDTO createRequest(Long targetWeaponId) {
        return new WeaponSubmissionRequestDTO(targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
    }

    private WeaponSubmissionResponseDTO responseFor(SubmissionType type, Long targetWeaponId) {
        return new WeaponSubmissionResponseDTO(
                1L, type, SubmissionStatus.PENDING, "calamitas", targetWeaponId,
                "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY, 50, 8, 1.3, 65, 5, 8000, 6,
                "Slash", "desc", "img", null, null, null);
    }

    @Test
    void create_withoutTargetWeaponId_createsCreateTypeSubmission() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        WeaponSubmission builtEntity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(mapper.toEntity(any(), any(), any(), any())).thenReturn(builtEntity);
        when(submissionRepository.save(builtEntity)).thenReturn(builtEntity);
        when(mapper.toResponseDTO(builtEntity)).thenReturn(responseFor(SubmissionType.CREATE, null));

        WeaponSubmissionResponseDTO result = service.create(createRequest(null), "calamitas@terraria.com");

        assertThat(result.type()).isEqualTo(SubmissionType.CREATE);
        assertThat(result.submittedByUsername()).isEqualTo("calamitas");
    }

    @Test
    void create_withTargetWeaponId_throwsWhenPendingSubmissionAlreadyExists() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        Weapon target = Weapon.builder().name("Excalibur").weaponClass(Weapon.WeaponClass.MELEE).element(Element.HOLY)
                .baseDamage(40).criticalChance(5).attacksPerTurn(1.0).range(50).rarity(4).price(5000).quality(5).build();
        target.setId(7L);
        when(weaponRepository.findById(7L)).thenReturn(Optional.of(target));
        when(submissionRepository.existsByTargetWeaponIdAndStatus(7L, SubmissionStatus.PENDING)).thenReturn(true);

        assertThatThrownBy(() -> service.create(createRequest(7L), "calamitas@terraria.com"))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_withUnknownTargetWeaponId_throwsRuntimeException() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(createRequest(999L), "calamitas@terraria.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findMine_returnsOnlySubmitterSubmissions() {
        User author = submitter();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(author));
        WeaponSubmission entity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findBySubmittedByOrderByCreatedAtDesc(author)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        List<WeaponSubmissionResponseDTO> result = service.findMine("calamitas@terraria.com");

        assertThat(result).containsExactly(responseDTO);
    }

    @Test
    void approve_createType_savesNewWeaponAndMarksApproved() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        Weapon newWeapon = Weapon.builder().name("Terra Blade").weaponClass(Weapon.WeaponClass.MELEE).element(Element.HOLY)
                .baseDamage(50).criticalChance(8).attacksPerTurn(1.3).range(65).rarity(5).price(8000).quality(6).build();
        when(mapper.toApprovedWeapon(submission)).thenReturn(newWeapon);
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.CREATE, null));

        service.approve(5L);

        verify(weaponRepository).save(newWeapon);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.APPROVED);
    }

    @Test
    void approve_updateType_appliesChangesToExistingWeaponAndMarksApproved() {
        Weapon target = Weapon.builder().name("Old").weaponClass(Weapon.WeaponClass.MELEE).element(Element.FIRE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10).rarity(1).price(100).quality(1).build();
        target.setId(7L);
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.UPDATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).targetWeapon(target).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        when(weaponRepository.findById(7L)).thenReturn(Optional.of(target));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.UPDATE, 7L));

        service.approve(5L);

        verify(mapper).applyToExistingWeapon(submission, target);
        verify(weaponRepository).save(target);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.APPROVED);
    }

    @Test
    void approve_throwsWhenNotPending() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.approve(5L)).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void reject_setsStatusAndReason() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.CREATE, null));

        service.reject(5L, "Dano muito alto");

        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.REJECTED);
        assertThat(submission.getRejectionReason()).isEqualTo("Dano muito alto");
    }

    @Test
    void reject_throwsWhenNotPending() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.REJECTED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.reject(5L, "motivo")).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void cancel_deletesWhenAuthorAndPending() {
        User author = submitter();
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        service.cancel(5L, "calamitas@terraria.com");

        verify(submissionRepository).delete(submission);
    }

    @Test
    void cancel_throwsForbiddenWhenNotAuthor() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "stranger@terraria.com"))
                .isInstanceOf(ForbiddenActionException.class);
    }

    @Test
    void cancel_throwsInvalidStateWhenNotPending() {
        WeaponSubmission submission = WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "calamitas@terraria.com"))
                .isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void findByStatus_mapsAllMatchingSubmissions() {
        WeaponSubmission entity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findByStatusOrderByCreatedAtAsc(SubmissionStatus.PENDING)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        assertThat(service.findByStatus(SubmissionStatus.PENDING)).containsExactly(responseDTO);
    }

    @Test
    void findById_returnsMappedSubmission() {
        WeaponSubmission entity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        entity.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        assertThat(service.findById(5L)).isEqualTo(responseDTO);
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(submissionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(404L)).isInstanceOf(RuntimeException.class);
    }
}
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `./mvnw test -Dtest=WeaponSubmissionServiceTest`
Expected: FALHA de compilação — `approve`, `reject`, `cancel`, `findByStatus`, `findById` não existem no service ainda.

- [ ] **Step 3: Implementar os métodos restantes**

Conteúdo final de `src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WeaponSubmissionService {

    private final WeaponSubmissionRepository submissionRepository;
    private final WeaponRepository weaponRepository;
    private final UserRepository userRepository;
    private final WeaponSubmissionMapper mapper;

    public WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        Weapon targetWeapon = null;
        SubmissionType type = SubmissionType.CREATE;

        if (dto.targetWeaponId() != null) {
            targetWeapon = weaponRepository.findById(dto.targetWeaponId())
                    .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + dto.targetWeaponId()));
            type = SubmissionType.UPDATE;

            if (submissionRepository.existsByTargetWeaponIdAndStatus(dto.targetWeaponId(), SubmissionStatus.PENDING)) {
                throw new DuplicateResourceException(
                        "There is already a pending submission for weapon ID: " + dto.targetWeaponId());
            }
        }

        WeaponSubmission submission = mapper.toEntity(dto, submitter, targetWeapon, type);
        WeaponSubmission saved = submissionRepository.save(submission);
        return mapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findMine(String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        return submissionRepository.findBySubmittedByOrderByCreatedAtDesc(submitter).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findByStatus(SubmissionStatus status) {
        return submissionRepository.findByStatusOrderByCreatedAtAsc(status).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public WeaponSubmissionResponseDTO findById(Long id) {
        return mapper.toResponseDTO(getSubmissionOrThrow(id));
    }

    public void cancel(Long id, String requesterEmail) {
        WeaponSubmission submission = getSubmissionOrThrow(id);

        if (!submission.getSubmittedBy().getEmail().equals(requesterEmail)) {
            throw new ForbiddenActionException("Only the author can cancel this submission");
        }
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be canceled");
        }
        submissionRepository.delete(submission);
    }

    public WeaponSubmissionResponseDTO approve(Long id) {
        WeaponSubmission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be approved");
        }

        if (submission.getType() == SubmissionType.CREATE) {
            weaponRepository.save(mapper.toApprovedWeapon(submission));
        } else {
            Weapon target = weaponRepository.findById(submission.getTargetWeapon().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Weapon not found with ID: " + submission.getTargetWeapon().getId()));
            mapper.applyToExistingWeapon(submission, target);
            weaponRepository.save(target);
        }

        submission.setStatus(SubmissionStatus.APPROVED);
        WeaponSubmission saved = submissionRepository.save(submission);
        return mapper.toResponseDTO(saved);
    }

    public WeaponSubmissionResponseDTO reject(Long id, String reason) {
        WeaponSubmission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be rejected");
        }
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setRejectionReason(reason);
        WeaponSubmission saved = submissionRepository.save(submission);
        return mapper.toResponseDTO(saved);
    }

    private WeaponSubmission getSubmissionOrThrow(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
    }
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `./mvnw test -Dtest=WeaponSubmissionServiceTest`
Expected: PASS (15 testes verdes)

- [ ] **Step 5: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java
git commit -m "feat(weapons): adiciona approve/reject/cancel ao WeaponSubmissionService"
```

---

### Task 7: `WeaponSubmissionController` — endpoints do autor (create, mine, cancel)

**Files:**
- Create: `src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java`
- Test: `src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `WeaponSubmissionService` (Task 5/6), `WeaponSubmissionRequestDTO`/`WeaponSubmissionResponseDTO` (Task 4)
- Produces:
  - `POST /api/v1/weapon-submissions` (201, autenticado)
  - `GET /api/v1/weapon-submissions/mine` (200, autenticado)
  - `DELETE /api/v1/weapon-submissions/{id}` (204, autor)

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionControllerIntegrationTest.java`:

```java
package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WeaponSubmissionControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private WeaponRepository weaponRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String tokenFor(String email, Role role) {
        userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password(passwordEncoder.encode("secret123"))
                .role(role)
                .enabled(true)
                .build());
        return jwtService.generateToken(email);
    }

    private String createSubmissionJson(Long targetWeaponId) throws Exception {
        WeaponSubmissionRequestDTO dto = new WeaponSubmissionRequestDTO(
                targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
        return objectMapper.writeValueAsString(dto);
    }

    @Test
    void create_asAuthenticatedUser_returnsCreatedWithPendingStatus() throws Exception {
        String token = tokenFor("submitter1@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.type").value("CREATE"))
                .andExpect(jsonPath("$.submittedByUsername").value("submitter1"));
    }

    @Test
    void create_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status != 401 && status != 403) {
                        throw new AssertionError("Expected 401 or 403, got " + status);
                    }
                });
    }

    @Test
    void findMine_returnsOnlyOwnSubmissions() throws Exception {
        String tokenA = tokenFor("mineA@terraria.com", Role.USER);
        String tokenB = tokenFor("mineB@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/weapon-submissions/mine")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/v1/weapon-submissions/mine")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void cancel_byNonAuthor_isForbidden() throws Exception {
        String authorToken = tokenFor("author2@terraria.com", Role.USER);
        String otherToken = tokenFor("stranger2@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/weapon-submissions/" + submissionId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void cancel_byAuthor_returnsNoContent() throws Exception {
        String authorToken = tokenFor("author3@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/weapon-submissions/" + submissionId)
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isNoContent());
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponSubmissionControllerIntegrationTest`
Expected: FALHA — `WeaponSubmissionController` não existe ainda (404 em todas as rotas, ou erro de compilação se o teste referenciar a classe diretamente).

- [ ] **Step 3: Implementar o controller**

`src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java`:

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.WeaponSubmissionService;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/weapon-submissions")
@RequiredArgsConstructor
public class WeaponSubmissionController {

    private final WeaponSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<WeaponSubmissionResponseDTO> create(
            @Valid @RequestBody WeaponSubmissionRequestDTO requestDTO,
            Authentication authentication) {
        WeaponSubmissionResponseDTO created = submissionService.create(requestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findMine(Authentication authentication) {
        return ResponseEntity.ok(submissionService.findMine(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        submissionService.cancel(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponSubmissionControllerIntegrationTest`
Expected: PASS (5 testes verdes)

- [ ] **Step 5: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionControllerIntegrationTest.java
git commit -m "feat(weapons): adiciona endpoints de criar/listar/cancelar submissao"
```

---

### Task 8: `WeaponSubmissionController` — endpoints de ADMIN (list, detail, approve, reject)

**Files:**
- Modify: `src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java`
- Create: `src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionAdminControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `RejectSubmissionRequestDTO` (Task 4), `@PreAuthorize` (já habilitado via `@EnableMethodSecurity(prePostEnabled = true)` em `SecurityConfig`)
- Produces:
  - `GET /api/v1/weapon-submissions?status=PENDING` (200, ADMIN)
  - `GET /api/v1/weapon-submissions/{id}` (200, ADMIN)
  - `POST /api/v1/weapon-submissions/{id}/approve` (200, ADMIN)
  - `POST /api/v1/weapon-submissions/{id}/reject` (200, ADMIN)

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionAdminControllerIntegrationTest.java`:

```java
package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WeaponSubmissionAdminControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private WeaponRepository weaponRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String tokenFor(String email, Role role) {
        userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password(passwordEncoder.encode("secret123"))
                .role(role)
                .enabled(true)
                .build());
        return jwtService.generateToken(email);
    }

    private Long createPendingSubmission(String authorToken) throws Exception {
        WeaponSubmissionRequestDTO dto = new WeaponSubmissionRequestDTO(
                null, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
        String body = mockMvc.perform(post("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void listPending_asUser_isForbidden() throws Exception {
        String userToken = tokenFor("listuser@terraria.com", Role.USER);

        mockMvc.perform(get("/api/v1/weapon-submissions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void approve_createSubmission_publishesWeaponAndMarksApproved() throws Exception {
        String authorToken = tokenFor("author-approve@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-approve@terraria.com", Role.ADMIN);
        long weaponCountBefore = weaponRepository.count();

        Long submissionId = createPendingSubmission(authorToken);

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        Assertions.assertThat(weaponRepository.count()).isEqualTo(weaponCountBefore + 1);
    }

    @Test
    void reject_setsStatusAndReason() throws Exception {
        String authorToken = tokenFor("author-reject@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-reject@terraria.com", Role.ADMIN);

        Long submissionId = createPendingSubmission(authorToken);

        RejectSubmissionRequestDTO rejectDTO = new RejectSubmissionRequestDTO("Dano muito alto para a raridade");

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Dano muito alto para a raridade"));
    }

    @Test
    void approve_twice_returnsConflict() throws Exception {
        String authorToken = tokenFor("author-double@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-double@terraria.com", Role.ADMIN);

        Long submissionId = createPendingSubmission(authorToken);

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/weapon-submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponSubmissionAdminControllerIntegrationTest`
Expected: FALHA — rotas de admin ainda não existem no controller (404 em `/approve`/`/reject`, e a listagem sem `@PreAuthorize` retornaria 200 em vez de 403 para `listPending_asUser_isForbidden`).

- [ ] **Step 3: Adicionar os endpoints de ADMIN**

Conteúdo final de `src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java`:

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.WeaponSubmissionService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/weapon-submissions")
@RequiredArgsConstructor
public class WeaponSubmissionController {

    private final WeaponSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<WeaponSubmissionResponseDTO> create(
            @Valid @RequestBody WeaponSubmissionRequestDTO requestDTO,
            Authentication authentication) {
        WeaponSubmissionResponseDTO created = submissionService.create(requestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findMine(Authentication authentication) {
        return ResponseEntity.ok(submissionService.findMine(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        submissionService.cancel(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findByStatus(
            @RequestParam(defaultValue = "PENDING") String status) {
        SubmissionStatus statusEnum;
        try {
            statusEnum = SubmissionStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(submissionService.findByStatus(statusEnum));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<WeaponSubmissionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<WeaponSubmissionResponseDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<WeaponSubmissionResponseDTO> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectSubmissionRequestDTO requestDTO) {
        return ResponseEntity.ok(submissionService.reject(id, requestDTO.reason()));
    }
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponSubmissionAdminControllerIntegrationTest`
Expected: PASS (4 testes verdes)

- [ ] **Step 5: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionAdminControllerIntegrationTest.java
git commit -m "feat(weapons): adiciona endpoints de admin (listar/detalhar/aprovar/rejeitar) na fila"
```

---

### Task 9: `SecurityConfig` — armas ADMIN-only

**Files:**
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java`
- Test: `src/test/java/com/terraria/calamity/config/WeaponAdminOnlySecurityIntegrationTest.java`

**Interfaces:**
- Consumes: `JwtService`, `UserRepository`, `Role.ADMIN` (Task 1)

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/config/WeaponAdminOnlySecurityIntegrationTest.java`:

```java
package com.terraria.calamity.config;

import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WeaponAdminOnlySecurityIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String tokenFor(String email, Role role) {
        userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password(passwordEncoder.encode("secret123"))
                .role(role)
                .enabled(true)
                .build());
        return jwtService.generateToken(email);
    }

    @Test
    void createWeapon_asUser_isForbidden() throws Exception {
        String token = tokenFor("plainuser@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/weapons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createWeapon_asAdmin_isNotForbidden() throws Exception {
        String token = tokenFor("boss@terraria.com", Role.ADMIN);

        mockMvc.perform(post("/api/v1/weapons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=WeaponAdminOnlySecurityIntegrationTest`
Expected: FALHA em `createWeapon_asUser_isForbidden` — hoje `POST /api/v1/weapons` só exige `authenticated()`, então USER consegue passar (403 esperado, mas não ocorre).

- [ ] **Step 3: Atualizar as regras de acesso**

No arquivo `src/main/java/com/terraria/calamity/config/SecurityConfig.java`, substituir o bloco `.authorizeHttpRequests(...)` (dentro de `securityFilterChain`) por:

```java
            .authorizeHttpRequests(authz -> authz
                // ========== AUTENTICAÇÃO (público) ==========
                .requestMatchers("/api/v1/auth/**").permitAll()

                // ========== ENDPOINTS PÚBLICOS (GET) ==========
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/elements**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor/**").permitAll()

                // Health checks e actuator
                .requestMatchers("/actuator/**").permitAll()

                // ========== ARMAS — SOMENTE ADMIN (direto, sem fila) ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/weapons").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/weapons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/weapons/**").hasRole("ADMIN")

                // ========== ARMADURAS (fora do escopo desta spec — preservado como estava) ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/armor").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/armor/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/armor/**").authenticated()

                // ========== FILA DE SUBMISSÕES — QUALQUER AUTENTICADO ==========
                // (regras finas de ADMIN dentro deste path via @PreAuthorize nos métodos)
                .requestMatchers("/api/v1/weapon-submissions/**").authenticated()

                .anyRequest().authenticated()
            )
```

> **Nota (ajuste pós-plano):** o bloco acima preserva as 5 linhas de `/api/v1/armor` que já existem em `SecurityConfig.java` hoje (feature de armadura mesclada na `main` depois deste plano ter sido escrito). O plano original não conhecia essas rotas — confira o `SecurityConfig.java` atual antes de colar este bloco, para não tornar os GETs de armor privados por acidente.

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=WeaponAdminOnlySecurityIntegrationTest`
Expected: PASS (2 testes verdes)

- [ ] **Step 5: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS (inclui `AuthControllerIntegrationTest`, que usa contas `USER` em rotas que não são de armas — não afetado)

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/terraria/calamity/config/SecurityConfig.java src/test/java/com/terraria/calamity/config/WeaponAdminOnlySecurityIntegrationTest.java
git commit -m "feat(security): restringe create/update/delete de armas a ROLE_ADMIN"
```

---

### Task 10: Dashboard administrativo

**Files:**
- Modify: `src/main/java/com/terraria/calamity/domain/repository/UserRepository.java`
- Create: `src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java`
- Create: `src/main/java/com/terraria/calamity/api/controller/AdminController.java`
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java`
- Test: `src/test/java/com/terraria/calamity/application/service/AdminDashboardServiceTest.java`
- Test: `src/test/java/com/terraria/calamity/api/controller/AdminControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `UserRepository`, `WeaponRepository`, `WeaponSubmissionRepository`, `AdminDashboardResponseDTO` (Task 4)
- Produces:
  - `UserRepository.countByRole(Role role): long`
  - `AdminDashboardService.getDashboard(): AdminDashboardResponseDTO`
  - `GET /api/v1/admin/dashboard` (200, ADMIN)

- [ ] **Step 1: Escrever os testes que falham**

`src/test/java/com/terraria/calamity/application/service/AdminDashboardServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private WeaponSubmissionRepository submissionRepository;

    @InjectMocks private AdminDashboardService service;

    @Test
    void getDashboard_aggregatesAllCounts() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(2L);
        when(weaponRepository.count()).thenReturn(50L);
        when(submissionRepository.countByStatus(SubmissionStatus.PENDING)).thenReturn(3L);
        when(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).thenReturn(7L);
        when(submissionRepository.countByStatus(SubmissionStatus.REJECTED)).thenReturn(1L);

        AdminDashboardResponseDTO dashboard = service.getDashboard();

        assertThat(dashboard.totalUsers()).isEqualTo(10L);
        assertThat(dashboard.totalAdmins()).isEqualTo(2L);
        assertThat(dashboard.totalWeapons()).isEqualTo(50L);
        assertThat(dashboard.pendingSubmissions()).isEqualTo(3L);
        assertThat(dashboard.approvedSubmissions()).isEqualTo(7L);
        assertThat(dashboard.rejectedSubmissions()).isEqualTo(1L);
    }
}
```

`src/test/java/com/terraria/calamity/api/controller/AdminControllerIntegrationTest.java`:

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.JwtService;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminControllerIntegrationTest {

    @Autowired private WebApplicationContext wac;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    private String tokenFor(String email, Role role) {
        userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password(passwordEncoder.encode("secret123"))
                .role(role)
                .enabled(true)
                .build());
        return jwtService.generateToken(email);
    }

    @Test
    void getDashboard_asUser_isForbidden() throws Exception {
        String token = tokenFor("dashuser@terraria.com", Role.USER);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getDashboard_asAdmin_returnsCounts() throws Exception {
        String token = tokenFor("dashadmin@terraria.com", Role.ADMIN);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.totalAdmins").isNumber())
                .andExpect(jsonPath("$.totalWeapons").isNumber());
    }
}
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `./mvnw test -Dtest=AdminDashboardServiceTest,AdminControllerIntegrationTest`
Expected: FALHA de compilação — `AdminDashboardService`, `AdminController` e `UserRepository.countByRole` não existem ainda.

- [ ] **Step 3: Adicionar `countByRole` ao `UserRepository`**

Conteúdo final de `src/main/java/com/terraria/calamity/domain/repository/UserRepository.java`:

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    long countByRole(Role role);
}
```

- [ ] **Step 4: Criar o `AdminDashboardService`**

`src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final WeaponRepository weaponRepository;
    private final WeaponSubmissionRepository submissionRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponseDTO getDashboard() {
        return new AdminDashboardResponseDTO(
                userRepository.count(),
                userRepository.countByRole(Role.ADMIN),
                weaponRepository.count(),
                submissionRepository.countByStatus(SubmissionStatus.PENDING),
                submissionRepository.countByStatus(SubmissionStatus.APPROVED),
                submissionRepository.countByStatus(SubmissionStatus.REJECTED)
        );
    }
}
```

- [ ] **Step 5: Criar o `AdminController`**

`src/main/java/com/terraria/calamity/api/controller/AdminController.java`:

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.AdminDashboardService;
import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminDashboardService dashboardService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponseDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}
```

- [ ] **Step 6: Adicionar a regra `/api/v1/admin/**` no `SecurityConfig`**

No bloco `.authorizeHttpRequests(...)`, adicionar a linha abaixo logo antes de `.anyRequest().authenticated()`:

```java
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
```

- [ ] **Step 7: Rodar os testes para confirmar que passam**

Run: `./mvnw test -Dtest=AdminDashboardServiceTest,AdminControllerIntegrationTest`
Expected: PASS (3 testes verdes)

- [ ] **Step 8: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/repository/UserRepository.java src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java src/main/java/com/terraria/calamity/api/controller/AdminController.java src/main/java/com/terraria/calamity/config/SecurityConfig.java src/test/java/com/terraria/calamity/application/service/AdminDashboardServiceTest.java src/test/java/com/terraria/calamity/api/controller/AdminControllerIntegrationTest.java
git commit -m "feat(admin): adiciona dashboard administrativo com contagens gerais"
```

---

### Task 11: `RateLimitFilter` (429 em todos os endpoints)

**Files:**
- Modify: `pom.xml`
- Create: `src/main/java/com/terraria/calamity/config/RateLimitFilter.java`
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java`
- Test: `src/test/java/com/terraria/calamity/config/RateLimitFilterTest.java`

**Interfaces:**
- Produces: `RateLimitFilter extends OncePerRequestFilter` — 5 req/min por IP em `/api/v1/auth/**`, 60 req/min por IP nas demais rotas `/api/v1/**`; responde 429 com header `Retry-After` e corpo JSON quando excedido.

- [ ] **Step 1: Escrever o teste que falha**

`src/test/java/com/terraria/calamity/config/RateLimitFilterTest.java`:

```java
package com.terraria.calamity.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {

    @Test
    void withinLimit_passesRequestThrough() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/weapons");
        request.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void exceedingAuthLimit_returns429WithRetryAfter() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr("10.0.0.2");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertThat(response.getStatus()).isEqualTo(200);
        }

        MockHttpServletRequest sixthRequest = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        sixthRequest.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse sixthResponse = new MockHttpServletResponse();
        filter.doFilter(sixthRequest, sixthResponse, chain);

        assertThat(sixthResponse.getStatus()).isEqualTo(429);
        assertThat(sixthResponse.getHeader("Retry-After")).isNotNull();
        assertThat(sixthResponse.getContentAsString()).contains("Muitas requisições");
    }

    @Test
    void differentIps_haveIndependentBuckets() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr("10.0.0.3");
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }

        MockHttpServletRequest otherIpRequest = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        otherIpRequest.setRemoteAddr("10.0.0.4");
        MockHttpServletResponse otherIpResponse = new MockHttpServletResponse();
        filter.doFilter(otherIpRequest, otherIpResponse, chain);

        assertThat(otherIpResponse.getStatus()).isEqualTo(200);
    }
}
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `./mvnw test -Dtest=RateLimitFilterTest`
Expected: FALHA de compilação — `RateLimitFilter` não existe ainda, e a dependência `bucket4j-core` ainda não foi adicionada.

- [ ] **Step 3: Adicionar a dependência Bucket4j**

Em `pom.xml`, adicionar dentro de `<dependencies>` (logo após o bloco `LOMBOK`):

```xml
        <!-- ========================================== -->
        <!-- RATE LIMITING (Bucket4j) -->
        <!-- ========================================== -->
        <dependency>
            <groupId>com.bucket4j</groupId>
            <artifactId>bucket4j-core</artifactId>
            <version>8.10.1</version>
        </dependency>
```

- [ ] **Step 4: Implementar o `RateLimitFilter`**

`src/main/java/com/terraria/calamity/config/RateLimitFilter.java`:

```java
package com.terraria.calamity.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Limita requisições por IP: 5/min em /api/v1/auth/**, 60/min nas demais rotas
 * /api/v1/**. Em memória (single-instance) via Bucket4j. Roda antes do
 * JwtAuthenticationFilter para rejeitar cedo, sem validar token ou tocar no banco.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_CAPACITY_PER_MINUTE = 5;
    private static final int DEFAULT_CAPACITY_PER_MINUTE = 60;

    private final ConcurrentHashMap<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> defaultBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = resolveClientIp(request);
        boolean isAuthRoute = request.getRequestURI().startsWith("/api/v1/auth/");

        Bucket bucket = isAuthRoute
                ? authBuckets.computeIfAbsent(clientIp, ip -> newBucket(AUTH_CAPACITY_PER_MINUTE))
                : defaultBuckets.computeIfAbsent(clientIp, ip -> newBucket(DEFAULT_CAPACITY_PER_MINUTE));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            filterChain.doFilter(request, response);
            return;
        }

        long waitSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()) + 1;
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":429,\"message\":\"Muitas requisições. Tente novamente em instantes.\"}");
    }

    private Bucket newBucket(int capacityPerMinute) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacityPerMinute)
                .refillGreedy(capacityPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

- [ ] **Step 5: Registrar o filtro no `SecurityConfig`**

Em `src/main/java/com/terraria/calamity/config/SecurityConfig.java`:

1. Adicionar, junto ao bean `jwtFilterRegistration` já existente, o bean equivalente para o novo filtro (evita registro duplicado como filtro de servlet genérico, igual já é feito para o `JwtAuthenticationFilter`):

```java
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(
            RateLimitFilter filter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
```

2. Alterar a assinatura de `securityFilterChain` para receber o novo filtro e registrá-lo antes do `JwtAuthenticationFilter`:

```java
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RateLimitFilter rateLimitFilter,
            AuthenticationProvider authenticationProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/elements**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/armor/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/weapons").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/weapons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/weapons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/armor").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/armor/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/armor/**").authenticated()
                .requestMatchers("/api/v1/weapon-submissions/**").authenticated()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
```

- [ ] **Step 6: Rodar o teste para confirmar que passa**

Run: `./mvnw test -Dtest=RateLimitFilterTest`
Expected: PASS (3 testes verdes)

- [ ] **Step 7: Rodar a suíte completa**

Run: `./mvnw test`
Expected: PASS (os testes de integração existentes fazem poucas requisições por IP em cada método, bem abaixo de 60/min ou 5/min — não devem esbarrar no rate limit)

- [ ] **Step 8: Commit**

```bash
git add pom.xml src/main/java/com/terraria/calamity/config/RateLimitFilter.java src/main/java/com/terraria/calamity/config/SecurityConfig.java src/test/java/com/terraria/calamity/config/RateLimitFilterTest.java
git commit -m "feat(security): adiciona rate limiting (429) por IP em todos os endpoints"
```

---

## Self-Review

**1. Cobertura da spec:**
- Correção do bug do enum `Role` → Task 1 (obsoleta/pulada — ver ajuste pós-plano no início da Task 1; `main` atual já tem `Role.ADMIN` correto).
- Entidade `WeaponSubmission` + migração + repositório → Task 2.
- Exceções e handlers 403/409 (incluindo `AccessDeniedException`) → Task 3.
- DTOs + `WeaponSubmissionMapper` → Task 4.
- `create`/`findMine` → Task 5. `approve`/`reject`/`cancel`/`findByStatus`/`findById` → Task 6.
- Endpoints do autor (create/mine/cancel) → Task 7. Endpoints de ADMIN (list/detail/approve/reject) → Task 8.
- Armas ADMIN-only via `SecurityConfig` → Task 9.
- Dashboard administrativo → Task 10.
- Rate limiting (429) global → Task 11.
- Todos os itens de "Fora de escopo" da spec (endpoint de promoção, edição pelo ADMIN antes de aprovar, fila de delete para USER, Redis) foram deliberadamente omitidos, consistentes com a spec.

**2. Placeholders:** nenhum "TBD"/"TODO" — todos os steps têm código completo e comandos exatos.

**3. Consistência de tipos:** `WeaponSubmissionResponseDTO` tem os mesmos 21 campos, na mesma ordem, em `WeaponSubmissionMapper.toResponseDTO` (Task 4) e em todos os construtores usados nos testes (Tasks 4, 5, 6). Assinaturas do `WeaponSubmissionService` usadas pelo controller (Tasks 7/8) batem com as definidas nas Tasks 5/6. `RateLimitFilter` (Task 11) não depende de nenhum bean externo, então pode ser instanciado direto em teste (`new RateLimitFilter()`).

---

## Ordem de execução

Tasks 1 → 11, nesta ordem (cada uma depende de arquivos criados pela anterior). Após a Task 9, a suíte `AuthControllerIntegrationTest` continua válida (não usa rotas de armas). Recomenda-se rodar `./mvnw test` completo ao final de cada task, não só o teste novo.
