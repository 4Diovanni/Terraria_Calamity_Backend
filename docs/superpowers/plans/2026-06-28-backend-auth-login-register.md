# Backend Auth (Login + Register) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar autenticação básica (registro + login com e-mail/senha) ao backend Spring Boot, emitindo um JWT de acesso, com tabela `users` versionada via Flyway (aplicada no Supabase na inicialização).

**Architecture:** Camadas existentes (`api/controller`, `application/service`, `domain/{entity,dto,repository}`, `config`). Novo `AuthController` expõe `POST /api/v1/auth/register` e `POST /api/v1/auth/login`. `AuthService` orquestra registro (hash BCrypt + persistência) e login (via `AuthenticationManager`). `JwtService` gera/valida o token. `JwtAuthenticationFilter` lê o header `Authorization: Bearer` e popula o `SecurityContext`. `SecurityConfig` passa a ser stateless com JWT (substitui o HTTP Basic atual).

**Tech Stack:** Spring Boot 4.1.0, Java 21, Spring Security, Spring Data JPA, Flyway, PostgreSQL (Supabase), JJWT 0.12.6, BCrypt, Lombok. Testes: JUnit 5 + Mockito + Spring Boot Test + H2 (perfil de teste).

## Global Constraints

- Branch **somente backend**, criada a partir da `main` atualizada: `git checkout main && git pull origin main` antes de criar `feat/backend-auth-login-register`. NUNCA misturar frontend. NUNCA commitar na `main`.
- Conventional Commits; um commit por task; NUNCA commitar com testes falhando.
- Pacote raiz: `com.terraria.calamity`. Seguir o estilo das camadas existentes.
- Login é por **e-mail + senha**. Registro guarda `username`, `email`, `password`. Apenas **access token** (sem refresh) com expiração padrão de 24h (`86400000` ms).
- Novos usuários recebem `role = USER`. Enum de roles: `USER`, `ADMIN`.
- Senhas SEMPRE com hash BCrypt; nunca retornar o hash em nenhuma resposta.
- Próxima migration Flyway disponível: **V4** (existem V1, V2, V3).
- Endpoints de auth são públicos; todo o resto segue a política atual de segurança.
- Comando de teste (PowerShell, Windows): `.\mvnw.cmd test`. Para um teste específico use aspas: `.\mvnw.cmd test "-Dtest=NomeDaClasse"`. (Em bash/Linux seria `./mvnw test -Dtest=NomeDaClasse`.)

---

### Task 1: Dependências JWT + infraestrutura de testes (perfil H2)

Fundação: adiciona as dependências do JJWT, as propriedades de configuração do JWT e um perfil de teste em H2 para que toda a suíte rode sem um Postgres/Supabase vivo (o `.env` não existe em CI/execução isolada).

**Files:**
- Modify: `pom.xml` (bloco `<dependencies>`)
- Modify: `src/main/resources/application.yml` (adicionar bloco `jwt:`)
- Modify: `env.example` (documentar `JWT_SECRET`, `JWT_EXPIRATION`)
- Create: `src/test/resources/application.yml`

**Interfaces:**
- Produces: propriedades `jwt.secret` (String) e `jwt.expiration` (long, ms) disponíveis para injeção via `@Value`. Perfil de teste com H2 + `flyway.enabled=false` + `ddl-auto=create-drop`.

- [ ] **Step 1: Adicionar as dependências do JJWT no `pom.xml`**

Inserir dentro de `<dependencies>` (logo após o bloco SECURITY, antes de DATABASE & JPA). A `${jjwt.version}` já existe nas `<properties>` (0.12.6):

```xml
        <!-- ========================================== -->
        <!-- JWT (JJWT 0.12.6) -->
        <!-- ========================================== -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
```

- [ ] **Step 2: Adicionar o bloco `jwt:` no `src/main/resources/application.yml`**

Inserir no nível raiz do YAML (mesmo nível de `spring:` e `server:`), ao final do arquivo:

```yaml
jwt:
  secret: ${JWT_SECRET:dev-secret-change-me-terraria-calamity-rpg-min-32-chars}
  expiration: ${JWT_EXPIRATION:86400000}
```

- [ ] **Step 3: Documentar as variáveis em `env.example`**

Adicionar ao final de `env.example`:

```env

# JWT (autenticação)
# Em produção, defina um segredo forte com no mínimo 32 caracteres.
JWT_SECRET=dev-secret-change-me-terraria-calamity-rpg-min-32-chars
JWT_EXPIRATION=86400000
```

- [ ] **Step 4: Criar o perfil de teste H2 em `src/test/resources/application.yml`**

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:calamity_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
    show-sql: false
  flyway:
    enabled: false

jwt:
  secret: test-secret-key-for-terraria-calamity-rpg-1234567890
  expiration: 86400000

logging:
  level:
    root: WARN
    com.terraria: INFO
```

- [ ] **Step 5: Rodar a suíte para garantir que tudo compila e o contexto sobe em H2**

Run: `.\mvnw.cmd test`
Expected: BUILD SUCCESS. O teste existente `TerrariaCalamityApplicationTests.contextLoads` agora sobe sobre H2 (sem depender do `.env`).

- [ ] **Step 6: Commit**

```bash
git add pom.xml src/main/resources/application.yml env.example src/test/resources/application.yml
git commit -m "chore(backend): add jjwt deps, jwt config and H2 test profile"
```

---

### Task 2: Tabela `users` — Role, User, UserRepository e migration V4

**Files:**
- Create: `src/main/java/com/terraria/calamity/domain/entity/Role.java`
- Create: `src/main/java/com/terraria/calamity/domain/entity/User.java`
- Create: `src/main/java/com/terraria/calamity/domain/repository/UserRepository.java`
- Create: `src/main/resources/db/migration/V4__Create_users_table.sql`
- Test: `src/test/java/com/terraria/calamity/domain/repository/UserRepositoryTest.java`

**Interfaces:**
- Produces:
  - `enum Role { USER, ADMIN }`
  - `User` (extends `BaseEntity`) com `String username`, `String email`, `String password`, `Role role`, `Boolean enabled`; builder Lombok com defaults `role=USER`, `enabled=true`.
  - `UserRepository extends JpaRepository<User, Long>` com `Optional<User> findByEmail(String)`, `boolean existsByEmail(String)`, `boolean existsByUsername(String)`.

- [ ] **Step 1: Escrever o teste de repositório que falha**

Create `src/test/java/com/terraria/calamity/domain/repository/UserRepositoryTest.java`:

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void existsAndFind_returnTrue_whenUserSaved() {
        userRepository.save(User.builder()
                .username("calamitas")
                .email("calamitas@terraria.com")
                .password("hashed")
                .role(Role.USER)
                .enabled(true)
                .build());

        assertThat(userRepository.existsByEmail("calamitas@terraria.com")).isTrue();
        assertThat(userRepository.existsByUsername("calamitas")).isTrue();
        assertThat(userRepository.findByEmail("calamitas@terraria.com")).isPresent();
        assertThat(userRepository.existsByEmail("ghost@terraria.com")).isFalse();
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `.\mvnw.cmd test "-Dtest=UserRepositoryTest"`
Expected: FAIL na compilação (`Role`, `User`, `UserRepository` ainda não existem).

- [ ] **Step 3: Criar o enum `Role`**

```java
package com.terraria.calamity.domain.entity;

public enum Role {
    USER,
    ADMIN
}
```

- [ ] **Step 4: Criar a entidade `User`**

```java
package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entity que representa um usuário autenticável da aplicação.
 * Mapeia para a tabela 'users'. Estende {@link BaseEntity} (id + auditoria).
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;
}
```

- [ ] **Step 5: Criar o `UserRepository`**

```java
package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
```

- [ ] **Step 6: Criar a migration `V4__Create_users_table.sql`**

Create `src/main/resources/db/migration/V4__Create_users_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

- [ ] **Step 7: Rodar o teste e confirmar que passa**

Run: `.\mvnw.cmd test "-Dtest=UserRepositoryTest"`
Expected: PASS (schema gerado pelo Hibernate em H2 a partir das entidades).

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/entity/Role.java src/main/java/com/terraria/calamity/domain/entity/User.java src/main/java/com/terraria/calamity/domain/repository/UserRepository.java src/main/resources/db/migration/V4__Create_users_table.sql src/test/java/com/terraria/calamity/domain/repository/UserRepositoryTest.java
git commit -m "feat(backend): add User entity, Role enum, repository and users migration"
```

---

### Task 3: JwtService (geração e validação do token)

**Files:**
- Create: `src/main/java/com/terraria/calamity/application/service/JwtService.java`
- Test: `src/test/java/com/terraria/calamity/application/service/JwtServiceTest.java`

**Interfaces:**
- Consumes: propriedades `jwt.secret`, `jwt.expiration` (Task 1).
- Produces: `JwtService` com construtor `JwtService(String secret, long expirationMs)` e métodos:
  - `String generateToken(String email)`
  - `String extractEmail(String token)`
  - `boolean isValid(String token)`

- [ ] **Step 1: Escrever o teste unitário que falha**

Create `src/test/java/com/terraria/calamity/application/service/JwtServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-key-for-terraria-calamity-rpg-1234567890", 86400000L);

    @Test
    void generateToken_thenExtractEmail_returnsSameEmail() {
        String token = jwtService.generateToken("player@terraria.com");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractEmail(token)).isEqualTo("player@terraria.com");
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void isValid_returnsFalse_forTamperedToken() {
        String token = jwtService.generateToken("player@terraria.com");

        assertThat(jwtService.isValid(token + "tampered")).isFalse();
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `.\mvnw.cmd test "-Dtest=JwtServiceTest"`
Expected: FAIL na compilação (`JwtService` não existe).

- [ ] **Step 3: Implementar o `JwtService`**

```java
package com.terraria.calamity.application.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Geração e validação de JWT de acesso (HS256).
 * O subject do token é o e-mail do usuário.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `.\mvnw.cmd test "-Dtest=JwtServiceTest"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/service/JwtService.java src/test/java/com/terraria/calamity/application/service/JwtServiceTest.java
git commit -m "feat(backend): add JwtService for access token generation and validation"
```

---

### Task 4: DTOs de auth, CustomUserDetailsService e AuthService

**Files:**
- Create: `src/main/java/com/terraria/calamity/domain/dto/RegisterRequest.java`
- Create: `src/main/java/com/terraria/calamity/domain/dto/LoginRequest.java`
- Create: `src/main/java/com/terraria/calamity/domain/dto/AuthResponse.java`
- Create: `src/main/java/com/terraria/calamity/api/exception/DuplicateResourceException.java`
- Create: `src/main/java/com/terraria/calamity/application/service/CustomUserDetailsService.java`
- Create: `src/main/java/com/terraria/calamity/application/service/AuthService.java`
- Test: `src/test/java/com/terraria/calamity/application/service/AuthServiceTest.java`

**Interfaces:**
- Consumes: `UserRepository`, `Role`, `User` (Task 2); `JwtService` (Task 3); `PasswordEncoder` e `AuthenticationManager` (beans existentes em `SecurityConfig`).
- Produces:
  - `record RegisterRequest(String username, String email, String password)`
  - `record LoginRequest(String email, String password)`
  - `record AuthResponse(String token, String type, String username, String email, String role)` com factory `AuthResponse.bearer(token, username, email, role)`.
  - `DuplicateResourceException extends RuntimeException`
  - `CustomUserDetailsService implements UserDetailsService` (carrega por e-mail)
  - `AuthService` com `AuthResponse register(RegisterRequest)` e `AuthResponse login(LoginRequest)`.

- [ ] **Step 1: Criar os DTOs**

`RegisterRequest.java`:

```java
package com.terraria.calamity.domain.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    String password
) {}
```

`LoginRequest.java`:

```java
package com.terraria.calamity.domain.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Password cannot be blank")
    String password
) {}
```

`AuthResponse.java`:

```java
package com.terraria.calamity.domain.dto;

public record AuthResponse(
    String token,
    String type,
    String username,
    String email,
    String role
) {
    public static AuthResponse bearer(String token, String username, String email, String role) {
        return new AuthResponse(token, "Bearer", username, email, role);
    }
}
```

- [ ] **Step 2: Criar a exceção `DuplicateResourceException`**

```java
package com.terraria.calamity.api.exception;

/**
 * Lançada quando um recurso único (ex.: e-mail ou username já cadastrado)
 * viola a restrição de unicidade. Mapeada para HTTP 409 no GlobalExceptionHandler.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
```

- [ ] **Step 3: Criar o `CustomUserDetailsService`**

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Carrega o usuário pelo e-mail (usado como "username" pelo Spring Security)
 * e o adapta para UserDetails com a authority ROLE_<role>.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(!user.getEnabled())
                .build();
    }
}
```

- [ ] **Step 4: Escrever o teste do `AuthService` que falha**

Create `src/test/java/com/terraria/calamity/application/service/AuthServiceTest.java`:

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.domain.dto.AuthResponse;
import com.terraria.calamity.domain.dto.RegisterRequest;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService authService;

    @Test
    void register_savesUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("calamitas", "calamitas@terraria.com", "secret123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken("calamitas@terraria.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.type()).isEqualTo("Bearer");
        assertThat(response.username()).isEqualTo("calamitas");
        assertThat(response.email()).isEqualTo("calamitas@terraria.com");
        assertThat(response.role()).isEqualTo("USER");
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("calamitas", "calamitas@terraria.com", "secret123");
        when(userRepository.existsByEmail("calamitas@terraria.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }
}
```

- [ ] **Step 5: Rodar o teste e confirmar que falha**

Run: `.\mvnw.cmd test "-Dtest=AuthServiceTest"`
Expected: FAIL na compilação (`AuthService` não existe).

- [ ] **Step 6: Implementar o `AuthService`**

```java
package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.domain.dto.AuthResponse;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra registro e login.
 * - register: valida unicidade, faz hash BCrypt, persiste e emite o JWT.
 * - login: autentica via AuthenticationManager e emite o JWT.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already taken: " + request.username());
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getEmail());

        return AuthResponse.bearer(token, saved.getUsername(), saved.getEmail(), saved.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.bearer(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
```

- [ ] **Step 7: Rodar o teste e confirmar que passa**

Run: `.\mvnw.cmd test "-Dtest=AuthServiceTest"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/dto/RegisterRequest.java src/main/java/com/terraria/calamity/domain/dto/LoginRequest.java src/main/java/com/terraria/calamity/domain/dto/AuthResponse.java src/main/java/com/terraria/calamity/api/exception/DuplicateResourceException.java src/main/java/com/terraria/calamity/application/service/CustomUserDetailsService.java src/main/java/com/terraria/calamity/application/service/AuthService.java src/test/java/com/terraria/calamity/application/service/AuthServiceTest.java
git commit -m "feat(backend): add auth DTOs, user details service and AuthService"
```

---

### Task 5: Filtro JWT, SecurityConfig stateless, handlers de erro e AuthController

Task de integração: liga tudo. Substitui o HTTP Basic por JWT stateless, libera os endpoints de auth, adiciona o filtro e os handlers de erro, e expõe o `AuthController`. Deliverable validado por um teste de integração ponta-a-ponta em H2.

**Files:**
- Create: `src/main/java/com/terraria/calamity/config/JwtAuthenticationFilter.java`
- Modify: `src/main/java/com/terraria/calamity/config/SecurityConfig.java`
- Modify: `src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java`
- Create: `src/main/java/com/terraria/calamity/api/controller/AuthController.java`
- Test: `src/test/java/com/terraria/calamity/api/controller/AuthControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `JwtService`, `CustomUserDetailsService`, `AuthService` (Tasks 3–4); `PasswordEncoder`, `AuthenticationManager` (beans existentes).
- Produces: endpoints `POST /api/v1/auth/register` (201) e `POST /api/v1/auth/login` (200) retornando `AuthResponse`; respostas de erro 400 (validação), 409 (duplicado), 401 (credenciais inválidas).

- [ ] **Step 1: Escrever o teste de integração que falha**

Create `src/test/java/com/terraria/calamity/api/controller/AuthControllerIntegrationTest.java`:

```java
package com.terraria.calamity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void register_thenLogin_succeeds() throws Exception {
        RegisterRequest register = new RegisterRequest("provid", "provid@terraria.com", "secret123");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("provid"))
                .andExpect(jsonPath("$.role").value("USER"));

        LoginRequest login = new LoginRequest("provid@terraria.com", "secret123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void register_duplicateEmail_returnsConflict() throws Exception {
        RegisterRequest first = new RegisterRequest("dup1", "dup@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        RegisterRequest second = new RegisterRequest("dup2", "dup@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_wrongPassword_returnsUnauthorized() throws Exception {
        RegisterRequest register = new RegisterRequest("wrongpw", "wrongpw@terraria.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("wrongpw@terraria.com", "wrongpass");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_invalidEmail_returnsBadRequest() throws Exception {
        RegisterRequest bad = new RegisterRequest("baduser", "not-an-email", "secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `.\mvnw.cmd test "-Dtest=AuthControllerIntegrationTest"`
Expected: FAIL na compilação (`AuthController` não existe) / endpoints inexistentes.

- [ ] **Step 3: Criar o `JwtAuthenticationFilter`**

```java
package com.terraria.calamity.config;

import com.terraria.calamity.application.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Lê o header Authorization: Bearer <token>, valida o JWT e popula o
 * SecurityContext. Requisições sem token (ex.: /api/v1/auth/**) seguem o fluxo
 * normalmente e são liberadas pela configuração de segurança.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtService.isValid(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String email = jwtService.extractEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
```

- [ ] **Step 4: Atualizar o `SecurityConfig` (JWT stateless, sem HTTP Basic)**

Substituir o conteúdo de `src/main/java/com/terraria/calamity/config/SecurityConfig.java` por:

```java
package com.terraria.calamity.config;

import com.terraria.calamity.application.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuração de Segurança — autenticação stateless via JWT.
 * Endpoints públicos: /api/v1/auth/**, GETs de weapons/elements, actuator.
 * Demais endpoints exigem um JWT válido (Authorization: Bearer <token>).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8000"
        ));
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://terraria-calamity-backend*.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // API REST stateless com JWT → CSRF desabilitado
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // ========== AUTENTICAÇÃO (público) ==========
                .requestMatchers("/api/v1/auth/**").permitAll()

                // ========== ENDPOINTS PÚBLICOS (GET) ==========
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/weapons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/elements**").permitAll()

                // Health checks e actuator
                .requestMatchers("/actuator/**").permitAll()

                // ========== ENDPOINTS PROTEGIDOS ==========
                .requestMatchers(HttpMethod.POST, "/api/v1/weapons").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/weapons/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/weapons/**").authenticated()

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

- [ ] **Step 5: Adicionar handlers de 409 e 401 no `GlobalExceptionHandler`**

Editar `src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java`. Adicionar os imports e os dois novos métodos **antes** do handler genérico de `RuntimeException` (handlers mais específicos têm precedência, mas mantenha a ordem por clareza).

Adicionar aos imports:

```java
import com.terraria.calamity.api.exception.DuplicateResourceException;
import org.springframework.security.authentication.BadCredentialsException;
```

> Observação: `DuplicateResourceException` está no mesmo pacote (`com.terraria.calamity.api.exception`), então o import dela é dispensável — mantenha apenas o import de `BadCredentialsException`.

Adicionar os métodos dentro da classe:

```java
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
```

- [ ] **Step 6: Criar o `AuthController`**

```java
package com.terraria.calamity.api.controller;

import com.terraria.calamity.application.service.AuthService;
import com.terraria.calamity.domain.dto.AuthResponse;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de autenticação.
 * POST /api/v1/auth/register → 201 Created + AuthResponse (com JWT)
 * POST /api/v1/auth/login    → 200 OK + AuthResponse (com JWT)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
```

- [ ] **Step 7: Rodar o teste de integração e confirmar que passa**

Run: `.\mvnw.cmd test "-Dtest=AuthControllerIntegrationTest"`
Expected: PASS (register→login, duplicado→409, senha errada→401, email inválido→400).

- [ ] **Step 8: Rodar a suíte completa**

Run: `.\mvnw.cmd test`
Expected: BUILD SUCCESS — todos os testes (existentes + novos) passam.

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/terraria/calamity/config/JwtAuthenticationFilter.java src/main/java/com/terraria/calamity/config/SecurityConfig.java src/main/java/com/terraria/calamity/api/exception/GlobalExceptionHandler.java src/main/java/com/terraria/calamity/api/controller/AuthController.java src/test/java/com/terraria/calamity/api/controller/AuthControllerIntegrationTest.java
git commit -m "feat(backend): add JWT filter, stateless security and auth endpoints"
```

---

### Task 6: Documentação (README) e validação manual no Supabase

**Files:**
- Modify: `README.md` (marcar roadmap, adicionar tabela de endpoints de auth)

**Interfaces:**
- Consumes: endpoints da Task 5.

- [ ] **Step 1: Atualizar o roadmap e adicionar a seção de endpoints de auth no `README.md`**

Trocar a linha do roadmap:

```markdown
- [ ] Login/Register com JWT completo
```

por:

```markdown
- [x] Login/Register básico com JWT (e-mail + senha)
```

E adicionar, logo após a seção "Endpoints — Weapons", a nova seção:

```markdown
## Endpoints — Auth

| Método | Rota                      | Acesso  | Descrição                                   |
|--------|---------------------------|---------|---------------------------------------------|
| POST   | `/api/v1/auth/register`   | Público | Cria usuário (username, email, senha) → JWT |
| POST   | `/api/v1/auth/login`      | Público | Autentica por email + senha → JWT           |

Respostas retornam `{ token, type: "Bearer", username, email, role }`.
Use o token em chamadas protegidas via header `Authorization: Bearer <token>`.

Variáveis de ambiente: `JWT_SECRET` (mín. 32 caracteres em produção) e `JWT_EXPIRATION` (ms, padrão 86400000 = 24h).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document auth endpoints and update roadmap"
```

- [ ] **Step 3: Validação manual contra o Supabase (feita pelo usuário)**

Subir a aplicação com o `.env` apontando para o Supabase e `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`:

```bash
./mvnw spring-boot:run
```

Confirmar que a migration `V4` foi aplicada (tabela `users` criada no Supabase) e testar:

```bash
# Registro
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"calamitas","email":"calamitas@terraria.com","password":"secret123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"calamitas@terraria.com","password":"secret123"}'
```

Esperado: `201` no registro e `200` no login, ambos com um `token` JWT. Verificar no painel do Supabase que o usuário foi gravado com a senha **hasheada** (BCrypt, começa com `$2`).

---

## Notas de revisão (self-review)

- **Cobertura do spec:** registro ✅ (Task 4/5), login por e-mail+senha ✅ (Task 4/5), JWT access-only ✅ (Task 3), roles USER/ADMIN ✅ (Task 2), tabela no Supabase via Flyway V4 ✅ (Task 2), sem Google/OAuth ✅. Sem refresh token (conforme decidido). A **tela de login (frontend)** é intencionalmente um plano/branch separado (CLAUDE.md: nunca misturar frontend e backend).
- **Consistência de tipos:** `generateToken/extractEmail/isValid` (JwtService), `register/login` + `AuthResponse.bearer(...)` (AuthService) e `existsByEmail/existsByUsername/findByEmail` (UserRepository) são usados com as mesmas assinaturas em todas as tasks.
- **Segurança:** CSRF é desabilitado por ser API REST stateless com JWT — mudança deliberada vs. a config atual (HTTP Basic + CSRF). Senhas nunca retornam nas respostas (`AuthResponse` não expõe `password`).
- **Testes sem banco vivo:** o perfil H2 (Task 1) permite rodar `.\mvnw.cmd test` sem `.env`/Supabase; produção continua em PostgreSQL via Flyway.
