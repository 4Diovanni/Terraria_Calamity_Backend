# Contribuições dentro do Perfil + Submissões Genéricas (Fase 1: Fundação) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover a UI de contribuição de `/contribuir` para uma aba "Contribuições" dentro de `/perfil`, e substituir a entidade `WeaponSubmission` (específica de arma) por uma entidade/tabela genérica `Submission` (`entityType` + `payload` JSON) que suporta futuras entidades sem nova tabela.

**Architecture:** Backend: nova entidade `Submission` armazena o payload proposto como JSON (`Map<String,Object>` via `@JdbcTypeCode(SqlTypes.JSON)`); `WeaponPayloadMapper` converte esse payload de/para o DTO tipado `WeaponSubmissionRequestDTO`/`WeaponSubmissionResponseDTO` (que não mudam de shape) usando `ObjectMapper.convertValue`; `SubmissionService`/`SubmissionController` substituem `WeaponSubmissionService`/`WeaponSubmissionController` no novo path `/api/v1/submissions?entityType=WEAPON`. Frontend: `ProfilePage` ganha abas "Perfil"/"Contribuições" (a segunda renderiza `UserContributeView`/`AdminContributeView` conforme role, replicando a lógica de `ContributePage` que é removida); `weaponSubmissionService.ts` é renomeado para `submissionService.ts`.

**Tech Stack:** Spring Boot 4.1 (Java, Hibernate 7, Flyway, PostgreSQL/H2), React + TypeScript + Vite (Vitest, Testing Library, axios-mock-adapter).

## Global Constraints

- Testes de frontend: rodar `npx vitest run` em `src/frontend` — todos devem passar antes de cada commit (contagem não é fixa).
- Testes de backend: rodar `mvn test` na raiz do projeto — todos devem passar antes de cada commit.
- NUNCA commitar com testes falhando (regra do projeto).
- Cada task deste plano gera seu próprio commit, usando Conventional Commits (`feat(scope):`, `refactor(scope):`, `test(scope):`).
- Sem migração de dados de `weapon_submissions` — a tabela atual só tem dados de teste (confirmado pelo usuário).
- Nenhuma outra entidade além de `WEAPON` é implementada nesta fase — só a estrutura (`EntityType`) que permite adicionar depois.
- Backend usa o workaround já validado no projeto para testes: `@SpringBootTest(webEnvironment = WebEnvironment.NONE) + @Transactional` sobre o perfil H2 para repositório/service; `MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity())` para controller/segurança (Spring Boot 4.x não tem `@DataJpaTest`/`@AutoConfigureMockMvc`).

---

## Task 1: Entidade `Submission` genérica + migration + repositório

**Files:**
- Create: `src/main/java/com/terraria/calamity/domain/entity/EntityType.java`
- Create: `src/main/java/com/terraria/calamity/domain/entity/Submission.java`
- Create: `src/main/resources/db/migration/V9__Create_submissions_table.sql`
- Create: `src/main/java/com/terraria/calamity/domain/repository/SubmissionRepository.java`
- Test: `src/test/java/com/terraria/calamity/domain/repository/SubmissionRepositoryTest.java`

**Interfaces:**
- Produces: `EntityType` enum (`WEAPON`); `Submission` entity (`entityType: EntityType`, `submissionType: SubmissionType`, `status: SubmissionStatus`, `submittedBy: User`, `targetEntityId: Long`, `payload: Map<String,Object>`, `rejectionReason: String`, mais `id`/`createdAt`/`updatedAt` de `BaseEntity`); `SubmissionRepository` com `findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(User, EntityType)`, `findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType, SubmissionStatus)`, `existsByTargetEntityIdAndEntityTypeAndStatus(Long, EntityType, SubmissionStatus)`, `existsByTargetEntityIdAndEntityType(Long, EntityType)`, `countByStatus(SubmissionStatus)`.
- Consumes: nada de tasks anteriores (primeira task). Reaproveita `BaseEntity`, `SubmissionType`, `SubmissionStatus`, `User` já existentes.

- [ ] **Step 1: Escrever o teste (falhando) do repositório**

Criar `src/test/java/com/terraria/calamity/domain/repository/SubmissionRepositoryTest.java`:

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class SubmissionRepositoryTest {

    @Autowired private SubmissionRepository submissionRepository;
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

    private Submission buildSubmission(User author, Long targetEntityId, SubmissionStatus status) {
        return Submission.builder()
                .entityType(EntityType.WEAPON)
                .submissionType(targetEntityId != null ? SubmissionType.UPDATE : SubmissionType.CREATE)
                .status(status)
                .submittedBy(author)
                .targetEntityId(targetEntityId)
                .payload(Map.of("name", "Terra Blade", "baseDamage", 50))
                .build();
    }

    @Test
    void existsByTargetEntityIdAndEntityTypeAndStatus_returnsTrue_whenPendingSubmissionExists() {
        User author = saveUser("author@terraria.com");
        submissionRepository.save(buildSubmission(author, 7L, SubmissionStatus.PENDING));

        assertThat(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.PENDING)).isTrue();
        assertThat(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.APPROVED)).isFalse();
    }

    @Test
    void existsByTargetEntityIdAndEntityType_returnsTrue_regardlessOfStatus() {
        User author = saveUser("author2@terraria.com");
        submissionRepository.save(buildSubmission(author, 8L, SubmissionStatus.APPROVED));

        assertThat(submissionRepository.existsByTargetEntityIdAndEntityType(8L, EntityType.WEAPON)).isTrue();
        assertThat(submissionRepository.existsByTargetEntityIdAndEntityType(999L, EntityType.WEAPON)).isFalse();
    }

    @Test
    void findBySubmittedByAndEntityTypeOrderByCreatedAtDesc_returnsOnlyOwnSubmissions() {
        User author = saveUser("owner@terraria.com");
        User other = saveUser("other@terraria.com");

        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.PENDING));
        submissionRepository.save(buildSubmission(other, null, SubmissionStatus.PENDING));

        var result = submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(author, EntityType.WEAPON);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSubmittedBy().getEmail()).isEqualTo("owner@terraria.com");
    }

    @Test
    void countByStatus_countsOnlyMatchingStatus() {
        User author = saveUser("counter@terraria.com");
        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.PENDING));
        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.APPROVED));

        assertThat(submissionRepository.countByStatus(SubmissionStatus.PENDING)).isEqualTo(1);
        assertThat(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).isEqualTo(1);
    }

    @Test
    void payload_roundTripsAsMap() {
        User author = saveUser("payload@terraria.com");
        Submission saved = submissionRepository.saveAndFlush(buildSubmission(author, null, SubmissionStatus.PENDING));

        Submission reloaded = submissionRepository.findById(saved.getId()).orElseThrow();

        assertThat(reloaded.getPayload()).containsEntry("name", "Terra Blade");
    }
}
```

- [ ] **Step 2: Rodar o teste e verificar que falha (classes não existem ainda)**

Run: `mvn test -Dtest=SubmissionRepositoryTest`
Expected: FAIL — compilation error (`Submission`, `EntityType`, `SubmissionRepository` não existem)

- [ ] **Step 3: Criar `EntityType`**

Criar `src/main/java/com/terraria/calamity/domain/entity/EntityType.java`:

```java
package com.terraria.calamity.domain.entity;

public enum EntityType {
    WEAPON
}
```

- [ ] **Step 4: Criar a entidade `Submission`**

Criar `src/main/java/com/terraria/calamity/domain/entity/Submission.java`:

```java
package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * Proposta de criação/edição de uma entidade de jogo (hoje só Weapon) feita
 * por um USER, aguardando aprovação ou rejeição de um ADMIN. Mapeia para a
 * tabela 'submissions'. O shape do payload depende de entityType.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "submissions")
public class Submission extends BaseEntity {

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 20)
    private EntityType entityType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "submission_type", nullable = false, length = 20)
    private SubmissionType submissionType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User submittedBy;

    @Column(name = "target_entity_id")
    private Long targetEntityId;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private Map<String, Object> payload;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
}
```

- [ ] **Step 5: Criar a migration**

Criar `src/main/resources/db/migration/V9__Create_submissions_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL,
    submission_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_by_id BIGINT NOT NULL REFERENCES users(id),
    target_entity_id BIGINT,
    payload JSONB NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_entity_type_status ON submissions(entity_type, status);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by_id);
CREATE INDEX idx_submissions_target_entity ON submissions(entity_type, target_entity_id);
```

- [ ] **Step 6: Criar `SubmissionRepository`**

Criar `src/main/java/com/terraria/calamity/domain/repository/SubmissionRepository.java`:

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(User submittedBy, EntityType entityType);

    List<Submission> findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType entityType, SubmissionStatus status);

    boolean existsByTargetEntityIdAndEntityTypeAndStatus(Long targetEntityId, EntityType entityType, SubmissionStatus status);

    boolean existsByTargetEntityIdAndEntityType(Long targetEntityId, EntityType entityType);

    long countByStatus(SubmissionStatus status);
}
```

- [ ] **Step 7: Rodar o teste e verificar que passa**

Run: `mvn test -Dtest=SubmissionRepositoryTest`
Expected: PASS (5 testes)

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/entity/EntityType.java src/main/java/com/terraria/calamity/domain/entity/Submission.java src/main/resources/db/migration/V9__Create_submissions_table.sql src/main/java/com/terraria/calamity/domain/repository/SubmissionRepository.java src/test/java/com/terraria/calamity/domain/repository/SubmissionRepositoryTest.java
git commit -m "feat(submissions): adiciona entidade Submission generica com payload JSON"
```

---

## Task 2: `WeaponPayloadMapper`

**Files:**
- Create: `src/main/java/com/terraria/calamity/application/mapper/WeaponPayloadMapper.java`
- Test: `src/test/java/com/terraria/calamity/application/mapper/WeaponPayloadMapperTest.java`

**Interfaces:**
- Consumes: `Submission` (Task 1); `WeaponSubmissionRequestDTO`/`WeaponSubmissionResponseDTO` (já existentes, sem alteração de shape); `Weapon`, `User`, `EntityType`, `SubmissionType` (já existentes).
- Produces: `WeaponPayloadMapper` com `toEntity(WeaponSubmissionRequestDTO, User, Long targetEntityId, SubmissionType) -> Submission`, `toResponseDTO(Submission) -> WeaponSubmissionResponseDTO`, `toApprovedWeapon(Submission) -> Weapon`, `applyToExistingWeapon(Submission, Weapon) -> void`. Usadas pela `SubmissionService` (Task 3).

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/test/java/com/terraria/calamity/application/mapper/WeaponPayloadMapperTest.java`:

```java
package com.terraria.calamity.application.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeaponPayloadMapperTest {

    private final WeaponPayloadMapper mapper = new WeaponPayloadMapper(new ObjectMapper());

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
    void toEntity_buildsSubmissionWithWeaponPayload() {
        Submission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        assertThat(submission.getEntityType()).isEqualTo(EntityType.WEAPON);
        assertThat(submission.getSubmissionType()).isEqualTo(SubmissionType.CREATE);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(submission.getSubmittedBy().getUsername()).isEqualTo("calamitas");
        assertThat(submission.getTargetEntityId()).isNull();
        assertThat(submission.getPayload()).containsEntry("name", "Terra Blade");
        assertThat(submission.getPayload()).containsEntry("baseDamage", 50);
        assertThat(submission.getPayload()).doesNotContainKey("targetWeaponId");
    }

    @Test
    void toResponseDTO_mapsPayloadBackToFlatFields() {
        Submission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), 1L, SubmissionType.UPDATE);
        submission.setId(10L);

        var responseDTO = mapper.toResponseDTO(submission);

        assertThat(responseDTO.id()).isEqualTo(10L);
        assertThat(responseDTO.type()).isEqualTo(SubmissionType.UPDATE);
        assertThat(responseDTO.submittedByUsername()).isEqualTo("calamitas");
        assertThat(responseDTO.targetWeaponId()).isEqualTo(1L);
        assertThat(responseDTO.name()).isEqualTo("Terra Blade");
        assertThat(responseDTO.baseDamage()).isEqualTo(50);
        assertThat(responseDTO.imageUrl()).isEqualTo("https://example.com/terrablade.png");
    }

    @Test
    void toApprovedWeapon_buildsWeaponFromPayload() {
        Submission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

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

        Submission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), 1L, SubmissionType.UPDATE);
        mapper.applyToExistingWeapon(submission, existing);

        assertThat(existing.getName()).isEqualTo("Terra Blade");
        assertThat(existing.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(existing.getBaseDamage()).isEqualTo(50);
    }
}
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `mvn test -Dtest=WeaponPayloadMapperTest`
Expected: FAIL — compilation error (`WeaponPayloadMapper` não existe)

- [ ] **Step 3: Implementar `WeaponPayloadMapper`**

Criar `src/main/java/com/terraria/calamity/application/mapper/WeaponPayloadMapper.java`:

```java
package com.terraria.calamity.application.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WeaponPayloadMapper {

    private final ObjectMapper objectMapper;

    public Submission toEntity(WeaponSubmissionRequestDTO dto, User submittedBy, Long targetEntityId, SubmissionType type) {
        Map<String, Object> payload = objectMapper.convertValue(dto, new TypeReference<Map<String, Object>>() {});
        payload.remove("targetWeaponId");

        return Submission.builder()
            .entityType(EntityType.WEAPON)
            .submissionType(type)
            .submittedBy(submittedBy)
            .targetEntityId(targetEntityId)
            .payload(payload)
            .build();
    }

    public WeaponSubmissionResponseDTO toResponseDTO(Submission submission) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        return new WeaponSubmissionResponseDTO(
            submission.getId(),
            submission.getSubmissionType(),
            submission.getStatus(),
            submission.getSubmittedBy().getUsername(),
            submission.getTargetEntityId(),
            payload.name(),
            payload.weaponClass(),
            payload.element(),
            payload.baseDamage(),
            payload.criticalChance(),
            payload.attacksPerTurn(),
            payload.range(),
            payload.rarity(),
            payload.price(),
            payload.quality(),
            payload.abilities(),
            payload.description(),
            payload.imageUrl(),
            submission.getRejectionReason(),
            submission.getCreatedAt(),
            submission.getUpdatedAt()
        );
    }

    public Weapon toApprovedWeapon(Submission submission) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        return Weapon.builder()
            .name(payload.name())
            .weaponClass(payload.weaponClass())
            .element(payload.element())
            .baseDamage(payload.baseDamage())
            .criticalChance(payload.criticalChance())
            .attacksPerTurn(payload.attacksPerTurn())
            .range(payload.range())
            .rarity(payload.rarity())
            .price(payload.price())
            .quality(payload.quality())
            .abilities(payload.abilities())
            .description(payload.description())
            .imageUrl(payload.imageUrl())
            .build();
    }

    public void applyToExistingWeapon(Submission submission, Weapon weapon) {
        WeaponSubmissionRequestDTO payload = toPayloadDTO(submission);
        weapon.setName(payload.name());
        weapon.setWeaponClass(payload.weaponClass());
        weapon.setElement(payload.element());
        weapon.setBaseDamage(payload.baseDamage());
        weapon.setCriticalChance(payload.criticalChance());
        weapon.setAttacksPerTurn(payload.attacksPerTurn());
        weapon.setRange(payload.range());
        weapon.setRarity(payload.rarity());
        weapon.setPrice(payload.price());
        weapon.setQuality(payload.quality());
        weapon.setAbilities(payload.abilities());
        weapon.setDescription(payload.description());
        weapon.setImageUrl(payload.imageUrl());
    }

    private WeaponSubmissionRequestDTO toPayloadDTO(Submission submission) {
        return objectMapper.convertValue(submission.getPayload(), WeaponSubmissionRequestDTO.class);
    }
}
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `mvn test -Dtest=WeaponPayloadMapperTest`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/mapper/WeaponPayloadMapper.java src/test/java/com/terraria/calamity/application/mapper/WeaponPayloadMapperTest.java
git commit -m "feat(submissions): adiciona WeaponPayloadMapper para converter payload generico <-> DTOs de arma"
```

---

## Task 3: `SubmissionService`

**Files:**
- Create: `src/main/java/com/terraria/calamity/application/service/SubmissionService.java`
- Test: `src/test/java/com/terraria/calamity/application/service/SubmissionServiceTest.java`

**Interfaces:**
- Consumes: `SubmissionRepository` (Task 1), `WeaponPayloadMapper` (Task 2), `WeaponRepository`, `UserRepository` (já existentes), exceções já existentes (`DuplicateResourceException`, `ForbiddenActionException`, `InvalidSubmissionStateException`).
- Produces: `SubmissionService` com `create(WeaponSubmissionRequestDTO, String submitterEmail) -> WeaponSubmissionResponseDTO`, `findMine(String submitterEmail) -> List<WeaponSubmissionResponseDTO>`, `findByStatus(SubmissionStatus) -> List<WeaponSubmissionResponseDTO>`, `findById(Long) -> WeaponSubmissionResponseDTO`, `cancel(Long, String requesterEmail) -> void`, `approve(Long) -> WeaponSubmissionResponseDTO`, `reject(Long, String reason) -> WeaponSubmissionResponseDTO`. Usado por `SubmissionController` (Task 4).

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/test/java/com/terraria/calamity/application/service/SubmissionServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponPayloadMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
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
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private UserRepository userRepository;
    @Mock private WeaponPayloadMapper mapper;

    @InjectMocks private SubmissionService service;

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
        Submission builtEntity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
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
        when(weaponRepository.existsById(7L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.PENDING)).thenReturn(true);

        assertThatThrownBy(() -> service.create(createRequest(7L), "calamitas@terraria.com"))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_withUnknownTargetWeaponId_throwsRuntimeException() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.create(createRequest(999L), "calamitas@terraria.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findMine_returnsOnlySubmitterSubmissions() {
        User author = submitter();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(author));
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(author, EntityType.WEAPON)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        List<WeaponSubmissionResponseDTO> result = service.findMine("calamitas@terraria.com");

        assertThat(result).containsExactly(responseDTO);
    }

    @Test
    void approve_createType_savesNewWeaponAndMarksApproved() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
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
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.UPDATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).targetEntityId(7L).build();
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
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.approve(5L)).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void reject_setsStatusAndReason() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
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
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.REJECTED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.reject(5L, "motivo")).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void cancel_deletesWhenAuthorAndPending() {
        User author = submitter();
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        service.cancel(5L, "calamitas@terraria.com");

        verify(submissionRepository).delete(submission);
    }

    @Test
    void cancel_throwsForbiddenWhenNotAuthor() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "stranger@terraria.com"))
                .isInstanceOf(ForbiddenActionException.class);
    }

    @Test
    void cancel_throwsInvalidStateWhenNotPending() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "calamitas@terraria.com"))
                .isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void findByStatus_mapsAllMatchingSubmissions() {
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType.WEAPON, SubmissionStatus.PENDING)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        assertThat(service.findByStatus(SubmissionStatus.PENDING)).containsExactly(responseDTO);
    }

    @Test
    void findById_returnsMappedSubmission() {
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
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

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `mvn test -Dtest=SubmissionServiceTest`
Expected: FAIL — compilation error (`SubmissionService` não existe)

- [ ] **Step 3: Implementar `SubmissionService`**

Criar `src/main/java/com/terraria/calamity/application/service/SubmissionService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponPayloadMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.SubmissionType;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final WeaponRepository weaponRepository;
    private final UserRepository userRepository;
    private final WeaponPayloadMapper weaponPayloadMapper;

    public WeaponSubmissionResponseDTO create(WeaponSubmissionRequestDTO dto, String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        Long targetEntityId = dto.targetWeaponId();
        SubmissionType type = SubmissionType.CREATE;

        if (targetEntityId != null) {
            if (!weaponRepository.existsById(targetEntityId)) {
                throw new RuntimeException("Weapon not found with ID: " + targetEntityId);
            }
            type = SubmissionType.UPDATE;

            if (submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(
                    targetEntityId, EntityType.WEAPON, SubmissionStatus.PENDING)) {
                throw new DuplicateResourceException(
                        "There is already a pending submission for weapon ID: " + targetEntityId);
            }
        }

        Submission submission = weaponPayloadMapper.toEntity(dto, submitter, targetEntityId, type);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findMine(String submitterEmail) {
        User submitter = userRepository.findByEmail(submitterEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + submitterEmail));

        return submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(submitter, EntityType.WEAPON).stream()
                .map(weaponPayloadMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WeaponSubmissionResponseDTO> findByStatus(SubmissionStatus status) {
        return submissionRepository.findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType.WEAPON, status).stream()
                .map(weaponPayloadMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public WeaponSubmissionResponseDTO findById(Long id) {
        return weaponPayloadMapper.toResponseDTO(getSubmissionOrThrow(id));
    }

    public void cancel(Long id, String requesterEmail) {
        Submission submission = getSubmissionOrThrow(id);

        if (!submission.getSubmittedBy().getEmail().equals(requesterEmail)) {
            throw new ForbiddenActionException("Only the author can cancel this submission");
        }
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be canceled");
        }
        submissionRepository.delete(submission);
    }

    public WeaponSubmissionResponseDTO approve(Long id) {
        Submission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be approved");
        }

        if (submission.getSubmissionType() == SubmissionType.CREATE) {
            weaponRepository.save(weaponPayloadMapper.toApprovedWeapon(submission));
        } else {
            Weapon target = weaponRepository.findById(submission.getTargetEntityId())
                    .orElseThrow(() -> new RuntimeException(
                            "Weapon not found with ID: " + submission.getTargetEntityId()));
            weaponPayloadMapper.applyToExistingWeapon(submission, target);
            weaponRepository.save(target);
        }

        submission.setStatus(SubmissionStatus.APPROVED);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    public WeaponSubmissionResponseDTO reject(Long id, String reason) {
        Submission submission = getSubmissionOrThrow(id);
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Only PENDING submissions can be rejected");
        }
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setRejectionReason(reason);
        Submission saved = submissionRepository.save(submission);
        return weaponPayloadMapper.toResponseDTO(saved);
    }

    private Submission getSubmissionOrThrow(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
    }
}
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `mvn test -Dtest=SubmissionServiceTest`
Expected: PASS (14 testes)

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/service/SubmissionService.java src/test/java/com/terraria/calamity/application/service/SubmissionServiceTest.java
git commit -m "feat(submissions): adiciona SubmissionService generico sobre Submission"
```

---

## Task 4: `SubmissionController` + rota no `SecurityConfig`

**Files:**
- Create: `src/main/java/com/terraria/calamity/api/controller/SubmissionController.java`
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java:132`
- Test: `src/test/java/com/terraria/calamity/api/controller/SubmissionControllerIntegrationTest.java`
- Test: `src/test/java/com/terraria/calamity/api/controller/SubmissionAdminControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `SubmissionService` (Task 3), `WeaponSubmissionRequestDTO`/`WeaponSubmissionResponseDTO`/`RejectSubmissionRequestDTO` (já existentes), `EntityType`, `SubmissionStatus`.
- Produces: endpoints `/api/v1/submissions` (`POST`, `GET`, `GET /mine`, `GET /{id}`, `DELETE /{id}`, `POST /{id}/approve`, `POST /{id}/reject`), todos exigindo `entityType=WEAPON` como query param onde aplicável (retorna 400 se ausente/inválido).

- [ ] **Step 1: Escrever os testes de integração (falhando)**

Criar `src/test/java/com/terraria/calamity/api/controller/SubmissionControllerIntegrationTest.java`:

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
class SubmissionControllerIntegrationTest {

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

        mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
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
        mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
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
    void create_withUnsupportedEntityType_isBadRequest() throws Exception {
        String token = tokenFor("submitter-bad@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/submissions").param("entityType", "ARMOR")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findMine_returnsOnlyOwnSubmissions() throws Exception {
        String tokenA = tokenFor("mineA@terraria.com", Role.USER);
        String tokenB = tokenFor("mineB@terraria.com", Role.USER);

        mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/submissions/mine").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/v1/submissions/mine").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void cancel_byNonAuthor_isForbidden() throws Exception {
        String authorToken = tokenFor("author2@terraria.com", Role.USER);
        String otherToken = tokenFor("stranger2@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/submissions/" + submissionId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void cancel_byAuthor_returnsNoContent() throws Exception {
        String authorToken = tokenFor("author3@terraria.com", Role.USER);

        String responseBody = mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + authorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSubmissionJson(null)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long submissionId = objectMapper.readTree(responseBody).get("id").asLong();

        mockMvc.perform(delete("/api/v1/submissions/" + submissionId)
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isNoContent());
    }
}
```

Criar `src/test/java/com/terraria/calamity/api/controller/SubmissionAdminControllerIntegrationTest.java`:

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
class SubmissionAdminControllerIntegrationTest {

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
        String body = mockMvc.perform(post("/api/v1/submissions").param("entityType", "WEAPON")
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

        mockMvc.perform(get("/api/v1/submissions").param("entityType", "WEAPON")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void approve_createSubmission_publishesWeaponAndMarksApproved() throws Exception {
        String authorToken = tokenFor("author-approve@terraria.com", Role.USER);
        String adminToken = tokenFor("admin-approve@terraria.com", Role.ADMIN);
        long weaponCountBefore = weaponRepository.count();

        Long submissionId = createPendingSubmission(authorToken);

        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/approve")
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

        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/reject")
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

        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/submissions/" + submissionId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }
}
```

- [ ] **Step 2: Rodar os testes e verificar que falham**

Run: `mvn test -Dtest=SubmissionControllerIntegrationTest,SubmissionAdminControllerIntegrationTest`
Expected: FAIL — compilation error (`SubmissionController` não existe) e, mesmo se compilasse, 404 (rota não registrada)

- [ ] **Step 3: Implementar `SubmissionController`**

Criar `src/main/java/com/terraria/calamity/api/controller/SubmissionController.java`:

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.SubmissionService;
import com.terraria.calamity.domain.dto.RejectSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.EntityType;
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
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<WeaponSubmissionResponseDTO> create(
            @RequestParam String entityType,
            @Valid @RequestBody WeaponSubmissionRequestDTO requestDTO,
            Authentication authentication) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
        WeaponSubmissionResponseDTO created = submissionService.create(requestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<WeaponSubmissionResponseDTO>> findMine(
            @RequestParam String entityType,
            Authentication authentication) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
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
            @RequestParam String entityType,
            @RequestParam(defaultValue = "PENDING") String status) {
        if (!isSupportedWeaponType(entityType)) {
            return ResponseEntity.badRequest().build();
        }
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

    private boolean isSupportedWeaponType(String entityType) {
        try {
            return EntityType.valueOf(entityType.toUpperCase()) == EntityType.WEAPON;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
```

- [ ] **Step 4: Registrar a nova rota no `SecurityConfig` (mantendo a antiga por ora)**

Em `src/main/java/com/terraria/calamity/config/SecurityConfig.java:132`, adicionar a nova rota junto da antiga (a antiga só é removida na Task 5, quando `WeaponSubmissionController` deixa de existir):

```java
                // ========== FILA DE SUBMISSÕES — QUALQUER AUTENTICADO ==========
                // (regras finas de ADMIN dentro deste path via @PreAuthorize nos métodos)
                .requestMatchers("/api/v1/weapon-submissions/**").authenticated()
                .requestMatchers("/api/v1/submissions/**").authenticated()
```

- [ ] **Step 5: Rodar os testes e verificar que passam**

Run: `mvn test -Dtest=SubmissionControllerIntegrationTest,SubmissionAdminControllerIntegrationTest`
Expected: PASS (9 testes)

- [ ] **Step 6: Rodar a suíte completa do backend**

Run: `mvn test`
Expected: PASS (todos os testes, incluindo os antigos de `WeaponSubmission*` que ainda coexistem)

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/terraria/calamity/api/controller/SubmissionController.java src/main/java/com/terraria/calamity/config/SecurityConfig.java src/test/java/com/terraria/calamity/api/controller/SubmissionControllerIntegrationTest.java src/test/java/com/terraria/calamity/api/controller/SubmissionAdminControllerIntegrationTest.java
git commit -m "feat(submissions): adiciona SubmissionController em /api/v1/submissions com entityType=WEAPON"
```

---

## Task 5: Cutover — remover `WeaponSubmission` legado e rewire `WeaponService`/`AdminDashboardService`

**Files:**
- Modify: `src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java`
- Modify: `src/main/java/com/terraria/calamity/application/service/WeaponService.java`
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java:132`
- Modify: `src/test/java/com/terraria/calamity/application/service/AdminDashboardServiceTest.java`
- Modify: `src/test/java/com/terraria/calamity/application/service/WeaponServiceTest.java`
- Create: `src/main/resources/db/migration/V10__Drop_weapon_submissions_table.sql`
- Delete: `src/main/java/com/terraria/calamity/domain/entity/WeaponSubmission.java`
- Delete: `src/main/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepository.java`
- Delete: `src/main/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapper.java`
- Delete: `src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java`
- Delete: `src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java`
- Delete: `src/test/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepositoryTest.java`
- Delete: `src/test/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapperTest.java`
- Delete: `src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java`
- Delete: `src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionControllerIntegrationTest.java`
- Delete: `src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionAdminControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `SubmissionRepository`, `EntityType` (Task 1) — passam a ser as únicas dependências de `AdminDashboardService`/`WeaponService` para contagem/checagem de submissões.
- Produces: nenhuma interface nova; encerra a coexistência entre a pilha antiga (`WeaponSubmission*`) e a nova (`Submission`/`SubmissionService`/`SubmissionController`).

- [ ] **Step 1: Atualizar `AdminDashboardService` para usar `SubmissionRepository`**

Editar `src/main/java/com/terraria/calamity/application/service/AdminDashboardService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final WeaponRepository weaponRepository;
    private final SubmissionRepository submissionRepository;

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

Editar `src/test/java/com/terraria/calamity/application/service/AdminDashboardServiceTest.java` — trocar `import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;` por `import com.terraria.calamity.domain.repository.SubmissionRepository;`, e `@Mock private WeaponSubmissionRepository submissionRepository;` por `@Mock private SubmissionRepository submissionRepository;`.

- [ ] **Step 2: Atualizar `WeaponService` para usar `SubmissionRepository`**

Editar `src/main/java/com/terraria/calamity/application/service/WeaponService.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.controller.WeaponController;
import com.terraria.calamity.api.exception.ResourceInUseException;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.application.mapper.WeaponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WeaponService {
    private final WeaponRepository weaponRepository;
    private final WeaponMapper weaponMapper;
    private final SubmissionRepository submissionRepository;

    public WeaponResponseDTO create(WeaponController.WeaponRequestDTO requestDTO) {
        Weapon weapon = weaponMapper.toEntity(requestDTO);
        Weapon saved = weaponRepository.save(weapon);
        return weaponMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public WeaponResponseDTO findById(Long id) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));
        return weaponMapper.toResponseDTO(weapon);
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findAll() {
        return weaponRepository.findAll().stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByClass(Weapon.WeaponClass weaponClass) {
        return weaponRepository.findByWeaponClass(weaponClass).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByElement(Element element) {
        return weaponRepository.findByElement(element).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> findByRarity(Integer rarity) {
        return weaponRepository.findByRarity(rarity).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeaponResponseDTO> searchByName(String name) {
        return weaponRepository.findByNameContainingIgnoreCase(name).stream()
            .map(weaponMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public WeaponResponseDTO update(Long id, WeaponController.WeaponRequestDTO requestDTO) {
        Weapon weapon = weaponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Weapon not found with ID: " + id));

        Weapon updatedWeapon = weaponMapper.toEntity(requestDTO);

        weapon.setName(updatedWeapon.getName());
        weapon.setWeaponClass(updatedWeapon.getWeaponClass());
        weapon.setElement(updatedWeapon.getElement());
        weapon.setBaseDamage(updatedWeapon.getBaseDamage());
        weapon.setCriticalChance(updatedWeapon.getCriticalChance());
        weapon.setAttacksPerTurn(updatedWeapon.getAttacksPerTurn());
        weapon.setRange(updatedWeapon.getRange());
        weapon.setRarity(updatedWeapon.getRarity());
        weapon.setPrice(updatedWeapon.getPrice());
        weapon.setQuality(updatedWeapon.getQuality());
        weapon.setAbilities(updatedWeapon.getAbilities());
        weapon.setDescription(updatedWeapon.getDescription());
        weapon.setImageUrl(updatedWeapon.getImageUrl());

        Weapon saved = weaponRepository.save(weapon);
        return weaponMapper.toResponseDTO(saved);
    }

    public void delete(Long id) {
        if (!weaponRepository.existsById(id)) {
            throw new RuntimeException("Weapon not found with ID: " + id);
        }
        if (submissionRepository.existsByTargetEntityIdAndEntityType(id, EntityType.WEAPON)) {
            throw new ResourceInUseException(
                    "Não é possível deletar: esta arma possui submissões associadas");
        }
        weaponRepository.deleteById(id);
    }
}
```

Editar `src/test/java/com/terraria/calamity/application/service/WeaponServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.ResourceInUseException;
import com.terraria.calamity.application.mapper.WeaponMapper;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeaponServiceTest {

    @Mock private WeaponRepository weaponRepository;
    @Mock private WeaponMapper weaponMapper;
    @Mock private SubmissionRepository submissionRepository;

    @InjectMocks private WeaponService service;

    @Test
    void delete_withAssociatedSubmission_throwsResourceInUseAndDoesNotDelete() {
        when(weaponRepository.existsById(7L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityType(7L, EntityType.WEAPON)).thenReturn(true);

        assertThatThrownBy(() -> service.delete(7L))
                .isInstanceOf(ResourceInUseException.class)
                .hasMessageContaining("submiss");

        verify(weaponRepository, never()).deleteById(7L);
    }

    @Test
    void delete_withoutAssociatedSubmission_deletesNormally() {
        when(weaponRepository.existsById(9L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityType(9L, EntityType.WEAPON)).thenReturn(false);

        service.delete(9L);

        verify(weaponRepository).deleteById(9L);
    }
}
```

- [ ] **Step 3: Remover a rota antiga do `SecurityConfig`**

Em `src/main/java/com/terraria/calamity/config/SecurityConfig.java:132`, remover a linha da rota antiga:

```java
                // ========== FILA DE SUBMISSÕES — QUALQUER AUTENTICADO ==========
                // (regras finas de ADMIN dentro deste path via @PreAuthorize nos métodos)
                .requestMatchers("/api/v1/submissions/**").authenticated()
```

- [ ] **Step 4: Deletar os arquivos legados**

```bash
rm src/main/java/com/terraria/calamity/domain/entity/WeaponSubmission.java
rm src/main/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepository.java
rm src/main/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapper.java
rm src/main/java/com/terraria/calamity/application/service/WeaponSubmissionService.java
rm src/main/java/com/terraria/calamity/api/controller/WeaponSubmissionController.java
rm src/test/java/com/terraria/calamity/domain/repository/WeaponSubmissionRepositoryTest.java
rm src/test/java/com/terraria/calamity/application/mapper/WeaponSubmissionMapperTest.java
rm src/test/java/com/terraria/calamity/application/service/WeaponSubmissionServiceTest.java
rm src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionControllerIntegrationTest.java
rm src/test/java/com/terraria/calamity/api/controller/WeaponSubmissionAdminControllerIntegrationTest.java
```

- [ ] **Step 5: Criar a migration que dropa a tabela antiga**

Criar `src/main/resources/db/migration/V10__Drop_weapon_submissions_table.sql`:

```sql
DROP TABLE IF EXISTS weapon_submissions;
```

- [ ] **Step 6: Rodar a suíte completa do backend**

Run: `mvn test`
Expected: PASS (todos os testes; nenhuma referência a `WeaponSubmission*` restante)

- [ ] **Step 7: Confirmar que não sobrou nenhuma referência a `WeaponSubmission`**

Run: `grep -rn "WeaponSubmission" src/main src/test`
Expected: nenhum resultado

- [ ] **Step 8: Commit**

```bash
git add -A src/main src/test
git commit -m "refactor(submissions): remove entidade WeaponSubmission legada, cutover completo para Submission"
```

---

## Task 6: Frontend — renomear `weaponSubmissionService` para `submissionService`

**Files:**
- Create: `src/frontend/src/services/submissionService.ts`
- Create: `src/frontend/src/services/submissionService.test.ts`
- Delete: `src/frontend/src/services/weaponSubmissionService.ts`
- Delete: `src/frontend/src/services/weaponSubmissionService.test.ts`
- Modify: `src/frontend/src/components/pages/UserContributeView.tsx`
- Modify: `src/frontend/src/components/pages/AdminContributeView.tsx`
- Modify: `src/frontend/src/components/pages/WeaponDetailPage.tsx`

**Interfaces:**
- Consumes: backend `/api/v1/submissions?entityType=WEAPON` (Task 4/5); tipos `WeaponSubmission`/`WeaponSubmissionRequest`/`SubmissionStatus` (já existentes, sem alteração de shape).
- Produces: `submissionService` com `create(entityType: 'WEAPON', data)`, `getMine(entityType: 'WEAPON')`, `cancel(id)`, `getAll(entityType: 'WEAPON', status?)`, `getById(id)`, `approve(id)`, `reject(id, reason)`. Consumido por `UserContributeView`, `AdminContributeView`, `WeaponDetailPage` (mesma task) e `ProfilePage` indiretamente (Task 7).

- [ ] **Step 1: Escrever o teste (falhando) do novo serviço**

Criar `src/frontend/src/services/submissionService.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { submissionService } from './submissionService';
import { WeaponSubmission, WeaponSubmissionRequest } from '../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../types/weapon';

const BASE_URL = '/api/v1/submissions';

const sampleSubmission: WeaponSubmission = {
  id: '1',
  type: 'CREATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: null,
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: '',
  description: 'desc',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const requestData: WeaponSubmissionRequest = {
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: '',
  description: 'desc',
  imageUrl: '',
};

describe('submissionService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('creates a submission with entityType=WEAPON', async () => {
    mock.onPost(BASE_URL).reply(201, sampleSubmission);
    const result = await submissionService.create('WEAPON', requestData);
    expect(result.id).toBe('1');
  });

  it('creates an update submission with targetWeaponId', async () => {
    mock.onPost(BASE_URL).reply(201, { ...sampleSubmission, type: 'UPDATE', targetWeaponId: '42' });
    const result = await submissionService.create('WEAPON', { ...requestData, targetWeaponId: '42' });
    expect(result.type).toBe('UPDATE');
    expect(result.targetWeaponId).toBe('42');
  });

  it('lists my submissions with entityType=WEAPON', async () => {
    mock.onGet(`${BASE_URL}/mine`, { params: { entityType: 'WEAPON' } }).reply(200, [sampleSubmission]);
    const result = await submissionService.getMine('WEAPON');
    expect(result).toHaveLength(1);
  });

  it('cancels a submission', async () => {
    mock.onDelete(`${BASE_URL}/1`).reply(204);
    await expect(submissionService.cancel('1')).resolves.toBeUndefined();
  });

  it('lists submissions filtered by entityType and status, defaulting to PENDING', async () => {
    mock.onGet(BASE_URL, { params: { entityType: 'WEAPON', status: 'PENDING' } }).reply(200, [sampleSubmission]);
    const result = await submissionService.getAll('WEAPON');
    expect(result).toHaveLength(1);
  });

  it('gets a submission by id', async () => {
    mock.onGet(`${BASE_URL}/1`).reply(200, sampleSubmission);
    const result = await submissionService.getById('1');
    expect(result.id).toBe('1');
  });

  it('approves a submission', async () => {
    mock.onPost(`${BASE_URL}/1/approve`).reply(200, { ...sampleSubmission, status: 'APPROVED' });
    const result = await submissionService.approve('1');
    expect(result.status).toBe('APPROVED');
  });

  it('rejects a submission with a reason', async () => {
    mock.onPost(`${BASE_URL}/1/reject`).reply(200, {
      ...sampleSubmission,
      status: 'REJECTED',
      rejectionReason: 'Dano incompatível',
    });
    const result = await submissionService.reject('1', 'Dano incompatível');
    expect(result.status).toBe('REJECTED');
    expect(result.rejectionReason).toBe('Dano incompatível');
  });
});
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run submissionService.test.ts`
Expected: FAIL — módulo `./submissionService` não existe

- [ ] **Step 3: Criar `submissionService.ts`**

Criar `src/frontend/src/services/submissionService.ts`:

```ts
import apiClient from './apiClient';
import { WeaponSubmission, WeaponSubmissionRequest, SubmissionStatus } from '../types/weaponSubmission';

const BASE_URL = '/api/v1/submissions';

export const submissionService = {
  async create(entityType: 'WEAPON', data: WeaponSubmissionRequest): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(BASE_URL, data, { params: { entityType } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao criar submissão:', error);
      throw error;
    }
  },

  async getMine(entityType: 'WEAPON'): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(`${BASE_URL}/mine`, { params: { entityType } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao buscar minhas submissões:', error);
      throw error;
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao cancelar submissão ${id}:`, error);
      throw error;
    }
  },

  async getAll(entityType: 'WEAPON', status: SubmissionStatus = 'PENDING'): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(BASE_URL, { params: { entityType, status } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao listar submissões:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.get<WeaponSubmission>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao buscar submissão ${id}:`, error);
      throw error;
    }
  },

  async approve(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao aprovar submissão ${id}:`, error);
      throw error;
    }
  },

  async reject(id: string, reason: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao rejeitar submissão ${id}:`, error);
      throw error;
    }
  },
};
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run submissionService.test.ts`
Expected: PASS (8 testes)

- [ ] **Step 5: Atualizar `UserContributeView.tsx` para usar o novo serviço**

Em `src/frontend/src/components/pages/UserContributeView.tsx:4`, trocar:

```ts
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
```

por:

```ts
import { submissionService } from '../../services/submissionService';
```

E trocar as três chamadas (`weaponSubmissionService.getMine()` → `submissionService.getMine('WEAPON')`; `weaponSubmissionService.create(data)` → `submissionService.create('WEAPON', data)`; `weaponSubmissionService.cancel(id)` → `submissionService.cancel(id)`):

```ts
      const data = await submissionService.getMine('WEAPON');
```
```ts
    await submissionService.create('WEAPON', data);
```
```ts
      await submissionService.cancel(id);
```

- [ ] **Step 6: Atualizar `AdminContributeView.tsx` para usar o novo serviço**

Em `src/frontend/src/components/pages/AdminContributeView.tsx:3`, trocar:

```ts
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
```

por:

```ts
import { submissionService } from '../../services/submissionService';
```

E trocar as três chamadas (`weaponSubmissionService.getAll(statusFilter)` → `submissionService.getAll('WEAPON', statusFilter)`; `weaponSubmissionService.approve(id)` → `submissionService.approve(id)`; `weaponSubmissionService.reject(id, rejectionReason)` → `submissionService.reject(id, rejectionReason)`):

```ts
        submissionService.getAll('WEAPON', statusFilter),
```
```ts
      await submissionService.approve(id);
```
```ts
      await submissionService.reject(id, rejectionReason);
```

- [ ] **Step 7: Atualizar `WeaponDetailPage.tsx` para usar o novo serviço**

Em `src/frontend/src/components/pages/WeaponDetailPage.tsx:4`, trocar:

```ts
import { weaponSubmissionService } from '../../services/weaponSubmissionService';
```

por:

```ts
import { submissionService } from '../../services/submissionService';
```

E trocar a chamada em `handleSuggestEdit`:

```ts
    await submissionService.create('WEAPON', { ...data, targetWeaponId: weapon.id });
```

- [ ] **Step 8: Deletar o serviço antigo**

```bash
rm src/frontend/src/services/weaponSubmissionService.ts
rm src/frontend/src/services/weaponSubmissionService.test.ts
```

- [ ] **Step 9: Rodar a suíte completa do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (todos os testes)

- [ ] **Step 10: Commit**

```bash
git add src/frontend/src/services/submissionService.ts src/frontend/src/services/submissionService.test.ts src/frontend/src/components/pages/UserContributeView.tsx src/frontend/src/components/pages/AdminContributeView.tsx src/frontend/src/components/pages/WeaponDetailPage.tsx
git add -u src/frontend/src/services
git commit -m "refactor(frontend): renomeia weaponSubmissionService para submissionService com entityType"
```

---

## Task 7: Frontend — abas no Perfil + remoção de `ContributePage`

**Files:**
- Modify: `src/frontend/src/components/pages/ProfilePage.tsx`
- Modify: `src/frontend/src/components/pages/ProfilePage.test.tsx`
- Modify: `src/frontend/src/components/common/Header.tsx`
- Modify: `src/frontend/src/components/common/Header.test.tsx`
- Modify: `src/frontend/src/App.tsx`
- Delete: `src/frontend/src/components/pages/ContributePage.tsx`
- Delete: `src/frontend/src/components/pages/ContributePage.test.tsx`

**Interfaces:**
- Consumes: `UserContributeView`, `AdminContributeView` (sem alteração de props, Task 6 já atualizou seus serviços internos); `useAuth()` (já existente).
- Produces: `ProfilePage` com abas "Perfil"/"Contribuições"; nenhuma rota `/contribuir`; `Header` sem link "Contribuir".

- [ ] **Step 1: Escrever os testes (falhando) das novas abas em `ProfilePage.test.tsx`**

Em `src/frontend/src/components/pages/ProfilePage.test.tsx`, adicionar os mocks de serviço e os novos testes (mantendo os 6 testes já existentes intactos, pois continuam passando por baixo da aba "Perfil", que é a aba inicial):

Adicionar após os imports (linha 17):

```tsx
vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/submissionService', () => ({
  submissionService: { getAll: vi.fn(), getMine: vi.fn() },
}));

import { adminService } from '../../services/adminService';
```

No `describe('ProfilePage', ...)`, o `beforeEach` existente é:

```tsx
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authBase);
  });
```

Adicionar a configuração do `adminService` dentro desse mesmo `beforeEach` (não criar um segundo bloco):

```tsx
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authBase);
    vi.mocked(adminService.getDashboard).mockResolvedValue({
      totalUsers: 0,
      totalAdmins: 0,
      totalWeapons: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
    });
  });
```

E os novos testes, ao final do `describe`, antes do `});` de fechamento:

```tsx
  it('renderiza a aba Contribuições com UserContributeView para usuário comum', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Contribuições' }));
    expect(screen.getByRole('button', { name: 'Nova Proposta' })).toBeInTheDocument();
  });

  it('renderiza a aba Contribuições com AdminContributeView para admin', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Contribuições' }));
    expect(screen.getByRole('button', { name: 'Pendentes' })).toBeInTheDocument();
  });

  it('mantém a aba Perfil como conteúdo inicial', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Arcanjo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova Proposta' })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar o teste e verificar que falha**

Run: `cd src/frontend && npx vitest run ProfilePage.test.tsx`
Expected: FAIL — os botões "Contribuições"/"Nova Proposta"/"Pendentes" não existem ainda em `ProfilePage`

- [ ] **Step 3: Implementar as abas em `ProfilePage.tsx`**

Substituir o conteúdo de `src/frontend/src/components/pages/ProfilePage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserContributeView } from './UserContributeView';
import { AdminContributeView } from './AdminContributeView';

const ROLE_LABEL: Record<string, string> = {
  USER: 'USUÁRIO',
  ADMIN: 'ADMINISTRADOR',
};

type Tab = 'profile' | 'contributions';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <p className="text-xs font-display uppercase tracking-[0.2em] text-calamity-text-secondary mb-3">
        Perfil do aventureiro
      </p>
      <div className="border-b border-calamity-border mb-8" />

      <div className="flex gap-4 border-b-2 border-calamity-border mb-8">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'profile'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setTab('contributions')}
          className={`pb-3 px-2 font-display uppercase text-sm tracking-wider border-b-2 -mb-0.5 ${
            tab === 'contributions'
              ? 'text-calamity-accent-gold border-calamity-accent-gold'
              : 'text-calamity-text-secondary border-transparent'
          }`}
        >
          Contribuições
        </button>
      </div>

      {tab === 'profile' && (
        <div className="max-w-lg">
          <div className="border-l-2 border-calamity-accent-gold pl-6 mb-8">
            <h1 className="text-2xl font-display text-calamity-text-primary mb-6">
              {user?.username}
            </h1>
            <dl className="flex flex-col gap-4">
              <div className="flex gap-6 items-baseline">
                <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                  Entidade
                </dt>
                <dd className="text-sm font-display text-calamity-text-primary">
                  {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
                </dd>
              </div>
              <div className="flex gap-6 items-baseline">
                <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary w-20 shrink-0">
                  Contato
                </dt>
                <dd className="text-sm text-calamity-text-secondary break-all">
                  {user?.email}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-b border-calamity-border mb-8" />

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary border border-calamity-border hover:border-calamity-primary px-4 py-2 transition-colors duration-300"
          >
            Encerrar sessão
          </button>
        </div>
      )}

      {tab === 'contributions' && (
        <div>{user?.role === 'ADMIN' ? <AdminContributeView /> : <UserContributeView />}</div>
      )}
    </main>
  );
};
```

- [ ] **Step 4: Rodar o teste e verificar que passa**

Run: `cd src/frontend && npx vitest run ProfilePage.test.tsx`
Expected: PASS (9 testes: 6 originais + 3 novos)

- [ ] **Step 5: Remover o link "Contribuir" do `Header.tsx`**

Em `src/frontend/src/components/common/Header.tsx`, remover o bloco desktop (linhas 100-105):

```tsx
              <Link
                to="/contribuir"
                className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
              >
                Contribuir
              </Link>
```

E o bloco equivalente no drawer mobile (linhas 138-144, incluindo o `<>`/`</>` que sobra só com o link de username — trocar por fragmento sem o Link "Contribuir"):

```tsx
            {!isLoading && (user ? (
              <Link
                to="/perfil"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-display text-calamity-text-secondary hover:text-calamity-text-primary transition-colors duration-300"
              >
                {user.username}
              </Link>
            ) : (
```

- [ ] **Step 6: Atualizar `Header.test.tsx`**

Em `src/frontend/src/components/common/Header.test.tsx`, remover os dois testes que não se aplicam mais (linhas 140-157):

```tsx
  it('does not show "Contribuir" tab when logged out', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: 'Contribuir' })).not.toBeInTheDocument();
  });

  it('shows "Contribuir" tab linking to /contribuir when logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Contribuir' })).toHaveAttribute('href', '/contribuir');
  });
```

- [ ] **Step 7: Remover a rota `/contribuir` do `App.tsx`**

Em `src/frontend/src/App.tsx:20`, remover o import:

```tsx
import { ContributePage } from './components/pages/ContributePage';
```

E remover a rota (linhas 57-64):

```tsx
                  <Route
                    path="contribuir"
                    element={
                      <ProtectedRoute>
                        <ContributePage />
                      </ProtectedRoute>
                    }
                  />
```

- [ ] **Step 8: Deletar `ContributePage.tsx` e seu teste**

```bash
rm src/frontend/src/components/pages/ContributePage.tsx
rm src/frontend/src/components/pages/ContributePage.test.tsx
```

- [ ] **Step 9: Rodar a suíte completa do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (todos os testes)

- [ ] **Step 10: Commit**

```bash
git add src/frontend/src/components/pages/ProfilePage.tsx src/frontend/src/components/pages/ProfilePage.test.tsx src/frontend/src/components/common/Header.tsx src/frontend/src/components/common/Header.test.tsx src/frontend/src/App.tsx
git add -u src/frontend/src/components/pages
git commit -m "feat(frontend): move contribuicoes para aba dentro do Perfil, remove rota /contribuir"
```

---

## Task 8: Verificação final ponta a ponta

**Files:** nenhum arquivo novo — só validação.

**Interfaces:** nenhuma.

- [ ] **Step 1: Rodar a suíte completa do backend**

Run: `mvn test`
Expected: PASS (todos os testes)

- [ ] **Step 2: Rodar a suíte completa do frontend**

Run: `cd src/frontend && npx vitest run`
Expected: PASS (todos os testes)

- [ ] **Step 3: Confirmar que não sobrou nenhuma referência a `weapon-submissions`/`ContributePage`/`/contribuir`**

Run: `grep -rn "weapon-submissions\|ContributePage\|/contribuir" src/main src/frontend/src`
Expected: nenhum resultado

- [ ] **Step 4: Subir o backend localmente e validar manualmente**

Run: `mvn spring-boot:run`

No browser, com o frontend rodando (`cd src/frontend && npm run dev`):
- Logar como USER, ir em `/perfil`, abrir aba "Contribuições", criar uma proposta de arma nova, ver em "Minhas Propostas".
- Ir em uma página de detalhe de arma (`/weapons/:id`), clicar "Sugerir Edição", confirmar que o Drawer local ainda funciona (sem navegar).
- Logar como ADMIN, ir em `/perfil` → "Contribuições", ver os cards de dashboard e a fila de submissões, aprovar/rejeitar uma proposta.
- Confirmar que `/contribuir` retorna 404 (rota removida) e que o Header não mostra mais o link "Contribuir".

Este passo é manual — parar aqui e deixar o usuário validar visualmente (mobile 375px, desktop 1280px, dark/light mode), conforme a prática do projeto.
