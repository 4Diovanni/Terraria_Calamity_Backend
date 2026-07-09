# Contribuições dentro do Perfil + Submissões Genéricas (Fase 1: Fundação) — Design Spec

**Data:** 2026-07-08
**Escopo:** Backend + Frontend. Fase 1 de um redesign maior do fluxo de contribuições. Move a UI de
contribuição de `/contribuir` para dentro da aba "Contribuições" da página `/perfil`, e generaliza o
backend de submissões (hoje `WeaponSubmission`, específico de arma) para uma tabela genérica
`submissions` capaz de suportar outras entidades no futuro (armadura, inimigo, boss, bioma).

Esta é a **fundação**. Uma Fase 2 futura (spec separada) cobre: visualização de diff estilo GitHub
(verde/vermelho, +/-) nas submissões, preview ao vivo da página ao criar/editar, e redesign visual do
dashboard administrativo como aba própria dentro do Perfil.

---

## 1. Objetivo

- Remover o link "Contribuir" do `Header` e a rota `/contribuir` — todo o fluxo de contribuição passa
  a viver dentro de `/perfil`, numa aba "Contribuições" ao lado da aba "Perfil".
- Dentro dessa aba, o conteúdo continua diferenciado por role: usuário comum vê
  `UserContributeView` (nova proposta + minhas propostas); admin vê `AdminContributeView` (stats +
  fila de submissões) — exatamente como hoje, só que relocado.
- Generalizar o backend: substituir a entidade/tabela `WeaponSubmission` por uma entidade/tabela
  genérica `Submission` com `entityType` + `payload` (JSON), preparando o terreno para outras
  entidades contribuíveis sem precisar de nova tabela a cada uma. **Só `WEAPON` é implementado nesta
  fase** — nenhum outro valor de `entityType` é adicionado como placeholder.

---

## 2. Fora de escopo (decisões explícitas)

| Tema | Decisão |
|---|---|
| Diff estilo GitHub (verde/vermelho, +/-) | Fase 2. Fora desta spec. |
| Preview ao vivo da página ao criar/editar | Fase 2. Fora desta spec. |
| Redesign visual do dashboard admin / aba "Dashboard" separada | Fase 2. Nesta fase o dashboard continua embutido em `AdminContributeView`, só que dentro da aba Contribuições do Perfil. |
| Outras entidades contribuíveis (armadura, inimigo, boss, bioma) | Só a estrutura genérica é criada; nenhuma entidade nova além de Weapon é implementada. |
| Migração de dados de `weapon_submissions` | Dados atuais são só de teste (confirmado pelo usuário) — a tabela antiga é dropada e a nova é criada do zero, sem migração de linhas. |
| Mudança visual em `UserContributeView`/`AdminContributeView`/`WeaponForm` | Nenhuma. Só mudam de local (de `/contribuir` para dentro de `/perfil`). |
| Rota `/contribuir` como redirect | Não. A rota é removida por completo, não mantida como redirect. |

---

## 3. Backend — modelo de dados

### 3.1 Nova entidade `Submission` (substitui `WeaponSubmission`)

Tabela `submissions`, estende `BaseEntity` (id + `createdAt`/`updatedAt` automáticos).

```java
@Entity
@Table(name = "submissions")
public class Submission extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntityType entityType;      // WEAPON (único valor por enquanto)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionType submissionType;  // CREATE | UPDATE (enum já existente, reaproveitado)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;  // enum já existente, reaproveitado

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @Column(name = "target_entity_id")
    private Long targetEntityId;        // null se CREATE; obrigatório se UPDATE

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> payload;  // campos propostos da entidade (shape depende de entityType)

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
}
```

Novo enum: `EntityType { WEAPON }`. `SubmissionType` e `SubmissionStatus` já existem e são
reaproveitados sem alteração.

`payload` usa o suporte nativo a JSON do Hibernate 7 (`@JdbcTypeCode(SqlTypes.JSON)`, disponível a
partir do Hibernate 6 — já incluso no Spring Boot 4.1, sem dependência nova). Para `entityType=WEAPON`,
o shape do `payload` é o mesmo conjunto de campos que `WeaponSubmissionRequestDTO` já expõe hoje
(name, weaponClass, element, baseDamage, criticalChance, attacksPerTurn, range, rarity, price,
quality, abilities, description, imageUrl).

### 3.2 Migration

Dropar `weapon_submissions` e criar `submissions` (com a coluna `payload jsonb`). Sem migração de
dados — confirmado que a tabela atual só tem dados de teste.

### 3.3 DTOs

- `SubmissionRequestDTO` — `entityType` (vem como query param no endpoint, não no body),
  `targetEntityId` (opcional; presente → `UPDATE`, ausente → `CREATE`), `payload` (`Map<String,
  Object>` ou, preferencialmente, um DTO tipado por entidade — ver 3.4).
- `SubmissionResponseDTO` — id, entityType, submissionType, status, `submittedByUsername`,
  targetEntityId (nullable), payload, rejectionReason (nullable), createdAt, updatedAt.
- `RejectSubmissionRequestDTO` — reaproveitado sem mudança (`{ reason: String }`, `@NotBlank`).
- `AdminDashboardResponseDTO` — reaproveitado sem mudança.

### 3.4 Validação de payload — por que não é "solta"

Para manter a validação forte que existe hoje (campos obrigatórios de arma, ranges de rarity/quality
etc.), o endpoint `POST /api/v1/submissions?entityType=WEAPON` continua recebendo o body no shape
tipado de `WeaponSubmissionRequestDTO` (com `@Valid`), não um `Map` genérico solto no request. O
controller/service converte esse DTO tipado para o `payload` (Map) antes de persistir. Ou seja: a
generalização é no **armazenamento** (uma tabela, um tipo de coluna), não na **validação de entrada**
— cada `entityType` continua tendo seu próprio DTO de request e suas próprias regras `@Valid`,
resolvidos por um mapeamento `entityType → DTO class` no controller (hoje só um branch: `WEAPON`).

---

## 4. Backend — camada de aplicação e endpoints

### 4.1 Serviço genérico + mapper por entidade

- `SubmissionService` — genérico, cuida do ciclo de vida comum: criar, listar minhas, cancelar,
  listar todas por status, aprovar, rejeitar. Reaproveita a lógica de `WeaponSubmissionService` de
  hoje, sem acoplamento a `Weapon`.
- `WeaponPayloadMapper` (renomeado de `WeaponSubmissionMapper`) — sabe converter
  `WeaponSubmissionRequestDTO` ↔ `payload` (Map) ↔ campos de `Weapon`, e aplicar a submissão aprovada
  na tabela `weapons`. Ao aprovar, `SubmissionService` despacha para o mapper certo com base em
  `entityType` (hoje só há o branch `WEAPON`; um `entityType` sem mapper registrado é erro de
  configuração, não caso de uso válido — não precisa de tratamento de erro em runtime além do 400
  descrito em 4.3).

### 4.2 Endpoints

Trocam de `/api/v1/weapon-submissions` para `/api/v1/submissions`, com `entityType` como **query
param**. Restante do contrato mantido:

| Método | Endpoint | Role | Descrição |
|---|---|---|---|
| `POST` | `/api/v1/submissions?entityType=WEAPON` | autenticado | Cria submissão (`CREATE` ou `UPDATE` conforme `targetEntityId`) |
| `GET` | `/api/v1/submissions/mine?entityType=WEAPON` | autenticado | Lista as próprias submissões |
| `DELETE` | `/api/v1/submissions/{id}` | autor da submissão | Cancela, só se `PENDING` |
| `GET` | `/api/v1/submissions?entityType=WEAPON&status=PENDING` | `ADMIN` | Lista submissões (status default `PENDING`) |
| `GET` | `/api/v1/submissions/{id}` | `ADMIN` | Detalhe de uma submissão |
| `POST` | `/api/v1/submissions/{id}/approve` | `ADMIN` | Aprova: publica/atualiza a entidade alvo |
| `POST` | `/api/v1/submissions/{id}/reject` | `ADMIN` | Rejeita; body `{ reason }` |
| `GET` | `/api/v1/admin/dashboard` | `ADMIN` | Reaproveitado sem mudança |

`@PreAuthorize("hasRole('ADMIN')")` continua nos endpoints administrativos, mesmo padrão de hoje.
`entityType` inválido/não suportado (fora dos valores do enum `EntityType`) → `400 Bad Request`,
validado antes de qualquer lógica de negócio.

---

## 5. Frontend — navegação e componentes

### 5.1 `ProfilePage.tsx` ganha abas

Passa a ter duas abas (reaproveitando o padrão de abas já usado em `UserContributeView.tsx` hoje):

- **"Perfil"** — o conteúdo atual (username, role, contato, botão de logout), sem mudança de
  conteúdo. Como esse conteúdo é centralizado e estreito (`max-w-lg`) enquanto a aba de Contribuições
  precisa de layout largo (grid de stats, formulários, listas), o container interno de cada aba tem
  sua própria largura — a página não fica mais presa a `max-w-lg` globalmente.
- **"Contribuições"** — renderiza `UserContributeView` ou `AdminContributeView` conforme
  `user.role`, replicando a lógica que `ContributePage.tsx` tem hoje (linha 14:
  `user?.role === 'ADMIN' ? <AdminContributeView /> : <UserContributeView />`). `ContributePage.tsx`
  é removido; essa lógica migra para dentro da aba.

### 5.2 `Header.tsx`

Remove o link "Contribuir" (desktop e drawer mobile). Mantém o link com `user.username` → `/perfil`.

### 5.3 `App.tsx`

Remove a rota `/contribuir`.

### 5.4 `WeaponDetailPage.tsx` — botão "Sugerir Edição"

Passa a navegar para `/perfil` passando o alvo da edição via `state` do React Router:

```ts
navigate('/perfil', { state: { openContributeTab: true, editWeaponId: weapon.id } });
```

`ProfilePage` lê esse `state` no mount: se presente, seleciona a aba "Contribuições" e repassa
`editWeaponId` para `UserContributeView`, que abre o formulário de UPDATE pré-preenchido — mesmo
mecanismo de pré-preenchimento que existe hoje (busca via `weaponService.getWeaponById`), só mudando
de onde é disparado.

### 5.5 Camada de serviço e tipos

- `weaponSubmissionService.ts` → renomeado/generalizado para `submissionService.ts`. Funções passam a
  aceitar `entityType` como parâmetro (hoje sempre `'WEAPON'`, passado pelos componentes que já sabem
  que só lidam com armas).
- `weaponSubmission.ts` (tipos) — `WeaponSubmission` ganha o campo `entityType: 'WEAPON'` (union de um
  único valor por enquanto). Resto dos campos mantido.

Nenhuma mudança visual em `UserContributeView`, `AdminContributeView`, `WeaponForm`,
`SubmissionStatusBadge` — só passam a viver dentro de uma aba do Perfil.

---

## 6. Fluxo completo (exemplo: sugerir edição de arma)

```
WeaponDetailPage                ProfilePage                    Backend
  "Sugerir Edição"                 │                              │
       │  navigate(/perfil,        │                              │
       │  state: editWeaponId) ───►│                              │
       │                           │ abre aba "Contribuições"     │
       │                           │ pré-preenche form UPDATE     │
       │                           │  (busca arma atual)          │
       │                           │──── submit ─────────────────►│ POST /submissions?entityType=WEAPON
       │                           │                              │ valida payload (WeaponPayloadMapper)
       │                           │                              │ persiste status=PENDING
       │                           │                              │
   Admin abre /perfil ──► aba "Contribuições" (AdminContributeView)│
       │                           │──── GET /submissions?entityType=WEAPON&status=PENDING ─►│
       │                           │◄──────────────────────────────────────────────────────  │
       │  aprova ─────────────────►│──── POST /{id}/approve ─────►│ aplica payload em Weapon
       │                           │                              │ status=APPROVED
```

1. Usuário comum clica "Sugerir Edição" → navega para `/perfil` com `state`.
2. `ProfilePage` abre a aba Contribuições com o formulário de UPDATE pré-preenchido.
3. Submissão vai para `POST /api/v1/submissions?entityType=WEAPON`, validada via
   `WeaponSubmissionRequestDTO` (`@Valid`), persistida com `status=PENDING`.
4. Admin acessa `/perfil` → aba Contribuições → `AdminContributeView` lista via
   `GET /api/v1/submissions?entityType=WEAPON&status=PENDING`.
5. Ao aprovar, `SubmissionService` despacha para `WeaponPayloadMapper`, que aplica o payload na
   tabela `weapons` e marca a submissão como `APPROVED` (mantida como histórico).

---

## 7. Tratamento de erros

| Situação | Status | Observação |
|---|---|---|
| Payload inválido (campos obrigatórios de arma faltando) | 400 | Mesmo comportamento atual de `WeaponSubmissionRequestDTO` + `@Valid` |
| `entityType` desconhecido/não suportado | 400 | Novo: validado no `SubmissionController`/`SubmissionService` antes de qualquer lógica |
| Navegação para `/perfil` sem estar logado | redirect `/login` | `ProtectedRoute` já cobre, sem mudança |
| `targetEntityId` apontando para arma inexistente | 404 | Mesmo tratamento de hoje |
| Já existe submissão `PENDING` para a mesma arma | 409 | Reaproveita `DuplicateResourceException`, sem mudança |
| Aprovar/rejeitar/cancelar submissão fora de `PENDING` | 409 | Reaproveita `InvalidSubmissionStateException`, sem mudança |
| Cancelar submissão de outro usuário | 403 | Reaproveita `ForbiddenActionException`, sem mudança |

---

## 8. Testes

| Área | Cenários |
|---|---|
| Backend — `SubmissionService` (unit) | Mesmos cenários de `WeaponSubmissionService` hoje (criar CREATE/UPDATE, bloquear PENDING duplicado, aprovar cria/atualiza Weapon via mapper, transições de estado inválidas, cancelar por não-autor), adaptados para a entidade genérica |
| Backend — `SubmissionController` (integração) | Branch `entityType=WEAPON` funcionando ponta a ponta; `entityType` inválido → 400; regras de role mantidas (403 para USER em endpoints admin) |
| Backend — `WeaponPayloadMapper` (unit) | Conversão DTO ↔ payload (Map) ↔ campos de `Weapon` nos dois sentidos |
| Frontend — `ProfilePage.test.tsx` | Renderiza as duas abas; troca de aba; lê `state` de navegação (`openContributeTab` + `editWeaponId`) e abre a aba/form corretos |
| Frontend — `Header.test.tsx` | Não espera mais o link "Contribuir" |
| Frontend — `UserContributeView`/`AdminContributeView`/`submissionService` | Testes existentes migram de nome/local; lógica coberta é a mesma |

Rodar `npx vitest run` em `src/frontend` — todos os testes devem passar (contagem não é fixa, só
confirmar que passam, conforme prática já estabelecida no projeto).

**Nota de infraestrutura de teste backend:** Spring Boot 4.x não tem `@DataJpaTest` nem
`@AutoConfigureMockMvc`. Seguir o workaround já validado no projeto: `@SpringBootTest(webEnvironment
= WebEnvironment.NONE) + @Transactional` sobre o perfil H2 de teste para repositório/service, e
`MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity())` para os testes de
controller/segurança.

---

## 9. Arquivos

**Backend — novos**
- `domain/entity/Submission.java`
- `domain/entity/EntityType.java`
- `domain/repository/SubmissionRepository.java`
- `domain/dto/SubmissionResponseDTO.java`
- `application/service/SubmissionService.java`
- `api/controller/SubmissionController.java`

**Backend — renomeados/adaptados**
- `domain/entity/WeaponSubmission.java` → removido (substituído por `Submission` + `payload`)
- `application/mapper/WeaponSubmissionMapper.java` → `WeaponPayloadMapper.java`
- `domain/dto/WeaponSubmissionRequestDTO.java` → mantido como shape de entrada tipado para
  `entityType=WEAPON` (ver 3.4)
- `api/controller/WeaponSubmissionController.java` → removido (substituído por
  `SubmissionController`)
- `domain/repository/WeaponSubmissionRepository.java` → removido (substituído por
  `SubmissionRepository`)
- `domain/dto/WeaponSubmissionResponseDTO.java` → removido (substituído por
  `SubmissionResponseDTO`)

**Backend — modificados**
- Migration nova: dropar `weapon_submissions`, criar `submissions` (com coluna `payload jsonb`)

**Frontend — novos/renomeados**
- `services/submissionService.ts` (renomeado de `weaponSubmissionService.ts`)

**Frontend — modificados**
- `components/pages/ProfilePage.tsx` — ganha abas ("Perfil" / "Contribuições")
- `components/common/Header.tsx` — remove link "Contribuir"
- `App.tsx` — remove rota `/contribuir`
- `components/pages/WeaponDetailPage.tsx` — botão "Sugerir Edição" navega para `/perfil` com `state`
- `types/weaponSubmission.ts` — adiciona campo `entityType`

**Frontend — removidos**
- `components/pages/ContributePage.tsx` (+ `ContributePage.test.tsx`) — lógica migra para
  `ProfilePage.tsx`

---

## 10. Fora de escopo (repetido para clareza)

Diff estilo GitHub, preview ao vivo de criação/edição, aba "Dashboard" separada e seu redesign visual
— tudo isso é a Fase 2, com spec própria. Nenhuma entidade contribuível além de Weapon é implementada
nesta fase, só a estrutura (`EntityType`, `payload` genérico) que permite adicioná-las depois sem
nova tabela.
