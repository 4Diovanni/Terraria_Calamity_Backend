---
tags: [plan, backend, auth]
aliases: [Endpoint GET auth me]
up: "[[INDEX]]"
related:
  - "[[Auth]]"
status: ativo
---

# Backend: Endpoint GET /api/v1/auth/me Implementation Plan

> Ver também: [[Auth]]

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um endpoint `GET /api/v1/auth/me` que valida de verdade (assinatura + existência do usuário) o JWT enviado pelo frontend, permitindo que o cliente confirme a sessão com o backend em vez de confiar apenas na decodificação local do token.

**Architecture:** Novo endpoint autenticado no `AuthController` que devolve os dados do usuário logado (`username`, `email`, `role`) a partir do `Authentication` populado pelo `JwtAuthenticationFilter` já existente. A regra de segurança que hoje libera `/api/v1/auth/**` por inteiro é restringida para liberar apenas `POST /register` e `POST /login`, deixando `GET /me` cair na regra padrão `anyRequest().authenticated()` (401 automático do Spring Security se o token faltar/for inválido/expirado).

**Tech Stack:** Spring Boot 4.1.0, Spring Security (JWT stateless, `jjwt`), JUnit 5 + Mockito + MockMvc + AssertJ, H2 (perfil de teste).

## Global Constraints

- NUNCA commitar com testes falhando.
- Commits atômicos (Conventional Commits), um por task.
- Branch: `fix/backend-auth-me-endpoint`, criada a partir de `main` atualizada. NUNCA misturar frontend nesta branch.
- Seguir o padrão de teste de controller já estabelecido no repo: `@SpringBootTest` + `MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity()).build()` em `@BeforeEach` (ver `AuthControllerIntegrationTest.java`). NÃO usar `@AutoConfigureMockMvc` (não existe no Boot 4.x deste projeto).

---

### Task 1: DTO `UserResponse`

**Files:**
- Create: `src\main\java\com\terraria\calamity\domain\dto\UserResponse.java`

**Interfaces:**
- Produces: `record UserResponse(String username, String email, String role)` — usado pelo `AuthService.getCurrentUser` (Task 2) e serializado pelo `AuthController.me` (Task 3).

- [ ] **Step 1: Criar o record**

```java
package com.terraria.calamity.domain.dto;

public record UserResponse(
    String username,
    String email,
    String role
) {
}
```

- [ ] **Step 2: Compilar para garantir que não há erro de sintaxe**

Run: `./mvnw compile -q`
Expected: build sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/terraria/calamity/domain/dto/UserResponse.java
git commit -m "feat(auth): adiciona DTO UserResponse para o endpoint /me"
```

---

### Task 2: `AuthService.getCurrentUser(String email)`

**Files:**
- Modify: `src\main\java\com\terraria\calamity\application\service\AuthService.java`
- Test: `src\test\java\com\terraria\calamity\application\service\AuthServiceTest.java`

**Interfaces:**
- Consumes: `UserRepository.findByEmail(String)` (já injetado no `AuthService`), `UserResponse` (Task 1).
- Produces: `AuthService.getCurrentUser(String email): UserResponse` — usado pelo `AuthController.me` (Task 3).

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final da classe `AuthServiceTest` (antes do `}` final), junto aos imports já existentes (`UserResponse` precisa ser importado):

```java
    @Test
    void getCurrentUser_returnsUserDataForValidEmail() {
        User user = User.builder()
                .username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser("calamitas@terraria.com");

        assertThat(response.username()).isEqualTo("calamitas");
        assertThat(response.email()).isEqualTo("calamitas@terraria.com");
        assertThat(response.role()).isEqualTo("USER");
    }

    @Test
    void getCurrentUser_throwsWhenUserNoLongerExists() {
        when(userRepository.findByEmail("ghost@terraria.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser("ghost@terraria.com"))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
    }
```

Adicionar o import no topo do arquivo, junto aos demais `com.terraria.calamity.domain.dto.*`:

```java
import com.terraria.calamity.domain.dto.UserResponse;
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `./mvnw test -Dtest=AuthServiceTest -q`
Expected: FAIL — `cannot find symbol: method getCurrentUser`.

- [ ] **Step 3: Implementar o método**

Em `AuthService.java`, adicionar após o método `login` (linha 70, antes do `}` final da classe):

```java
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        return new UserResponse(user.getUsername(), user.getEmail(), user.getRole().name());
    }
```

Adicionar o import correspondente no topo do arquivo:

```java
import com.terraria.calamity.domain.dto.UserResponse;
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `./mvnw test -Dtest=AuthServiceTest -q`
Expected: PASS (6 testes: os 4 já existentes + os 2 novos).

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/terraria/calamity/application/service/AuthService.java src/test/java/com/terraria/calamity/application/service/AuthServiceTest.java
git commit -m "feat(auth): adiciona AuthService.getCurrentUser para validar sessao"
```

---

### Task 3: Endpoint `GET /api/v1/auth/me` + ajuste de segurança

**Files:**
- Modify: `src\main\java\com\terraria\calamity\api\controller\AuthController.java`
- Modify: `src\main\java\com\terraria\calamity\config\SecurityConfig.java:105`
- Test: `src\test\java\com\terraria\calamity\api\controller\AuthControllerIntegrationTest.java`

**Interfaces:**
- Consumes: `AuthService.getCurrentUser(String)` (Task 2), `org.springframework.security.core.Authentication` (injetado pelo Spring MVC, populado pelo `JwtAuthenticationFilter` já existente).
- Produces: rota HTTP `GET /api/v1/auth/me` → 200 + `UserResponse` JSON, ou 401 (sem token / token inválido / token expirado / usuário não existe mais).

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `AuthControllerIntegrationTest` (antes do `}` final):

```java
    @Test
    void me_withValidToken_returnsCurrentUser() throws Exception {
        RegisterRequest register = new RegisterRequest("meuser", "meuser@terraria.com", "secret123");
        String body = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(body).get("token").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("meuser"))
                .andExpect(jsonPath("$.email").value("meuser@terraria.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void me_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withInvalidToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer garbage.invalid.token"))
                .andExpect(status().isUnauthorized());
    }
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `./mvnw test -Dtest=AuthControllerIntegrationTest -q`
Expected: FAIL — `me_withValidToken_returnsCurrentUser` e `me_withInvalidToken_returnsUnauthorized` recebem 200/permitAll em vez do esperado (a rota ainda não existe / `/api/v1/auth/**` ainda está toda liberada), gerando 404 ou comportamento divergente do esperado.

- [ ] **Step 3: Adicionar o endpoint no controller**

Em `AuthController.java`, adicionar o import e o método após `login` (linha 35, antes do `}` final da classe):

```java
import org.springframework.security.core.Authentication;
```

```java
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
```

E o import do DTO, junto aos demais `com.terraria.calamity.domain.dto.*`:

```java
import com.terraria.calamity.domain.dto.UserResponse;
```

- [ ] **Step 4: Restringir o `permitAll` de `/api/v1/auth/**` a apenas register/login**

Em `SecurityConfig.java`, substituir a linha 105:

```java
                .requestMatchers("/api/v1/auth/**").permitAll()
```

por:

```java
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
```

(`GET /api/v1/auth/me` passa a cair na regra `.anyRequest().authenticated()` já existente na linha 134 — sem token válido, o Spring Security responde 401 automaticamente, sem código extra no controller.)

- [ ] **Step 5: Rodar os testes para confirmar que passam**

Run: `./mvnw test -Dtest=AuthControllerIntegrationTest -q`
Expected: PASS (todos os testes da classe, incluindo os 3 novos).

- [ ] **Step 6: Rodar a suíte completa do backend para checar regressões**

Run: `./mvnw test -q`
Expected: PASS — nenhum teste existente quebrado (em especial `RateLimitFilterTest`, `WeaponAdminOnlySecurityIntegrationTest`, `ArmorControllerIntegrationTest`, que também batem em `/api/v1/auth/register` ou `/api/v1/auth/login`).

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/terraria/calamity/api/controller/AuthController.java src/main/java/com/terraria/calamity/config/SecurityConfig.java src/test/java/com/terraria/calamity/api/controller/AuthControllerIntegrationTest.java
git commit -m "feat(auth): adiciona endpoint GET /api/v1/auth/me e restringe permitAll de auth/**"
```

---

## Depois de mergeado

O frontend depende deste endpoint (`GET /api/v1/auth/me`) para o plano `2026-07-06-frontend-auth-session-validation.md`. Fazer merge desta branch em `main` antes de iniciar o plano do frontend, ou apontar o frontend para a URL do backend rodando localmente com esta branch.
