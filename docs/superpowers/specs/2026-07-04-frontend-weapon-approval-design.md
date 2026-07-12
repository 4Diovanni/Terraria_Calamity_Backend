---
tags: [spec, frontend, submissions]
aliases: [CRUD Direto de Armas e Fila de Aprovação — Design]
up: "[[INDEX]]"
related:
  - "[[AdminPage]]"
  - "[[Contributions]]"
  - "[[WeaponsPage]]"
  - "[[2026-07-04-frontend-weapon-approval-queue]]"
status: ativo
---

# Frontend — CRUD Direto de Armas (ADMIN) + Fila de Aprovação (USER/ADMIN) — Design Spec

> Ver também: plano: [[2026-07-04-frontend-weapon-approval-queue]] · [[AdminPage]] · [[Contributions]] · [[WeaponsPage]]

**Data:** 2026-07-04
**Escopo:** Frontend (`src/frontend`). Constrói a interface para o backend de roles ADMIN/USER e fila
de aprovação de armas já mesclado (PR #54): CRUD direto de arma para ADMIN, fluxo de
proposta/acompanhamento para USER, e dashboard + fila de revisão para ADMIN.

---

## 1. Objetivo

- **ADMIN**: cria, edita e deleta armas diretamente (endpoints já restritos a `ROLE_ADMIN` no
  backend); acessa um dashboard com contagens gerais; revisa a fila de submissões (aprova ou
  rejeita, com motivo).
- **USER**: propõe criação de arma nova ou edição de uma arma existente através de um formulário;
  acompanha o status das próprias propostas (`PENDING`/`APPROVED`/`REJECTED`); cancela uma proposta
  ainda pendente.

## 2. Entregas sequenciais

Dado o tamanho, o trabalho é dividido em duas branches/planos sequenciais, cada um validado
manualmente antes de avançar para o próximo:

1. **`feat/frontend-weapon-admin-crud`** — fundação (correção do contrato `Weapon`) + componente
   `WeaponForm` compartilhado + CRUD direto do ADMIN (criar/editar/deletar arma via UI, sem fila).
2. **`feat/frontend-weapon-approval-queue`** — fila de submissões: USER propõe/acompanha/cancela;
   ADMIN vê dashboard + fila de revisão (aprovar/rejeitar). Constrói em cima do `WeaponForm` da
   Entrega 1.

Este documento cobre o design de ambas, já que compartilham arquitetura e tipos — cada uma gera seu
próprio plano de implementação (`docs/superpowers/plans/`) e sua própria branch.

---

## 3. Entrega 1 — Fundação + CRUD direto do ADMIN

### 3.1 Correção do contrato `Weapon` (bug pré-existente, não relacionado à feature de roles)

`src/frontend/src/types/weapon.ts` está desalinhado do contrato real do backend
(`Weapon.java`/`CreateWeaponDTO`):

| Campo | Frontend hoje | Backend real |
|---|---|---|
| `rarity` | `RarityLevel` (enum: COMMON..LEGENDARY) | `Integer`, -1 a 17 |
| `price` | não existe | `Integer`, obrigatório, ≥ 0 |
| `quality` | não existe | `Integer`, obrigatório, 0–10 |
| `abilities` | não existe | `String`, opcional |

As funções `createWeapon`/`updateWeapon` já existentes em `weaponService.ts` nunca funcionariam
corretamente contra a API real como estão tipadas hoje (rarity com tipo errado, 3 campos
obrigatórios ausentes). Esta correção é pré-requisito para qualquer formulário funcional — de CRUD
direto ou de proposta.

**Mudanças:**
- `Weapon.rarity: number`; adicionar `price: number`, `quality: number`, `abilities?: string`.
- `WeaponFilters.rarity` (hoje `RarityLevel`) passa a ser o próprio tier (`RarityLevel`) selecionado
  no dropdown — a comparação em `WeaponsPage` muda de `weapon.rarity === filters.rarity` para
  `weaponRarityToTier(weapon.rarity) === filters.rarity`. A UI do filtro (dropdown com os 5 tiers)
  não muda, só a comparação por baixo.
- Nova função pura `weaponRarityToTier(rarity: number): RarityLevel` (local a `types/weapon.ts` ou
  `lib/`), faixas: `COMMON` (-1 a 2), `UNCOMMON` (3–6), `RARE` (7–10), `EPIC` (11–14), `LEGENDARY`
  (15–17). Usada **só** para colorir `Badge`/borda nas telas de arma (`WeaponCard`,
  `WeaponDetailPage`, filtro de raridade da `WeaponsPage`) — não introduz uma nova prop no `Badge`,
  que continua recebendo `value: string` (o tier já resolvido).
- `WeaponDetailPage` passa a exibir `price`, `quality` e `abilities` (novas linhas de stat/seção,
  seguindo o padrão visual de `StatBar`/`DetailLayout` já usado).

**Fora de escopo:** `Armor`/`ArmorPage`/`ArmorCard` têm o mesmo enum `RarityLevel` e podem ter o
mesmo tipo de mismatch — não é tocado aqui. É um problema pré-existente e independente desta
feature.

### 3.2 `WeaponForm` — componente compartilhado

Novo componente `src/frontend/src/components/pages/WeaponForm.tsx`, reutilizado nas 4 superfícies de
criação/edição de arma (2 nesta entrega, 2 na Entrega 2):

```ts
interface WeaponFormProps {
  initialValues?: Partial<WeaponFormData>; // vazio = criação; preenchido = edição/proposta de UPDATE
  onSubmit: (data: WeaponFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}
```

- Campos: `name`, `weaponClass`, `element`, `baseDamage`, `criticalChance`, `attacksPerTurn`,
  `range`, `rarity` (input numérico -1–17, com preview do `Badge` de tier ao lado), `price`,
  `quality`, `abilities`, `description`, `imageUrl`.
- Formulário manual (`useState` por campo, sem lib), seguindo a convenção de `LoginPage`/
  `RegisterPage`: `<form onSubmit noValidate>`, validação client-side espelhando os `@Min`/`@Max` do
  backend, mensagens de erro em PT-BR por campo, botão `Button` com `isLoading={isSubmitting}`.
- Não decide sozinho para onde os dados vão (create direto vs. submissão) — quem usa o componente
  passa `onSubmit`, que decide se chama `weaponService.createWeapon`/`updateWeapon` (Entrega 1) ou
  `weaponSubmissionService.create` (Entrega 2).

### 3.3 Superfícies de CRUD direto (ADMIN)

- **Criar**: `WeaponsPage.tsx` ganha um botão "+ Nova Arma", visível só se `user?.role === 'ADMIN'`.
  Abre `WeaponForm` vazio num `Drawer`/modal (reaproveitando o componente `Drawer` já usado para
  filtros mobile). Ao submeter com sucesso: `weaponService.createWeapon`, fecha o drawer, adiciona a
  arma nova à lista em memória (sem re-fetch completo).
- **Editar**: `WeaponDetailPage.tsx` ganha um botão "Editar", visível só para ADMIN, ao lado do
  título. Abre `WeaponForm` pré-preenchido com os dados atuais num modal/drawer. Ao submeter:
  `weaponService.updateWeapon(id, data)`, atualiza a página com os dados retornados.
- **Deletar**: botão "Deletar" ao lado de "Editar", visível só para ADMIN. Abre confirmação (texto
  claro, ex. "Esta ação não pode ser desfeita"). Ao confirmar: `weaponService.deleteWeapon(id)`;
  sucesso → redireciona para `/armas`; erro 409 (arma referenciada por uma submissão, ver §5) →
  mensagem clara sem redirecionar.

---

## 4. Entrega 2 — Fila de submissões (USER) + Dashboard/Revisão (ADMIN)

### 4.1 Novos tipos e serviços

`src/frontend/src/types/weaponSubmission.ts`:
```ts
export type SubmissionType = 'CREATE' | 'UPDATE';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WeaponSubmission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedByUsername: string;
  targetWeaponId: string | null;
  // + todos os campos propostos (mesmo shape de WeaponFormData)
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboard {
  totalUsers: number;
  totalAdmins: number;
  totalWeapons: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}
```

`src/frontend/src/services/weaponSubmissionService.ts` (`/api/v1/weapon-submissions`):
`create(data)`, `getMine()`, `cancel(id)` — para USER; `getAll(status?)`, `getById(id)`,
`approve(id)`, `reject(id, reason)` — para ADMIN.

`src/frontend/src/services/adminService.ts` (`/api/v1/admin/dashboard`): `getDashboard()`.

### 4.2 Aba "Contribuir" (`/contribuir`)

Rota nova em `App.tsx`, envolvida pelo `ProtectedRoute` já existente (só exige login — nenhuma
restrição de role na rota; o conteúdo se ramifica internamente por `user.role`). `Header.tsx` ganha
a aba "Contribuir", visível só quando há `user` logado (qualquer role).

**USER** — sub-abas internas:
- **"Nova Proposta"**: `WeaponForm` vazio (ou pré-preenchido, se chegou via "Sugerir Edição" na
  `WeaponDetailPage" — ver §4.3). Ao submeter: `weaponSubmissionService.create`.
- **"Minhas Propostas"**: lista via `getMine()`, cada item com badge de status (cores próprias,
  fixas — não usa o `RarityLevel`/`Badge` existente): Pendente (âmbar), Aprovado (verde), Rejeitado
  (vermelho, com o motivo exibido abaixo). Botão "Cancelar" só em itens `PENDING`, com confirmação.

**ADMIN** — dashboard fixo no topo + fila abaixo:
- Faixa de 6 cards de contagem (`AdminDashboard`), sempre visível.
- Fila de submissões: filtro por status (default `PENDING`), cada item expansível mostrando os
  dados propostos (mesmos campos do `WeaponForm`, em modo leitura) e dois botões: "Aprovar"
  (confirma e chama `approve(id)`) e "Rejeitar" (abre campo de motivo obrigatório, chama
  `reject(id, reason)`).

### 4.3 `WeaponDetailPage` — botão "Sugerir Edição" (USER)

Ao lado de onde o ADMIN vê "Editar"/"Deletar" (Entrega 1), um usuário USER logado vê "Sugerir
Edição". Abre o mesmo `WeaponForm` pré-preenchido com os dados atuais, mas o `onSubmit` chama
`weaponSubmissionService.create({ ...data, targetWeaponId: weapon.id })` em vez de
`updateWeapon` — a diferença fica isolada em qual função é passada como prop, o formulário em si é
idêntico.

Usuário não-logado não vê nenhum botão de ação nesta página.

---

## 5. Tratamento de erros (`apiClient.ts`)

O interceptor de resposta hoje trata 401/403/404/500 com mensagens genéricas; não trata 409 nem 429.
Esta feature introduz os dois:

- **409** (`DuplicateResourceException`/`InvalidSubmissionStateException`/`ResourceInUseException`
  no backend): repassar a mensagem vinda do corpo da resposta (`error.message`) — já é específica o
  bastante no backend (ex. "Já existe uma submissão pendente para esta arma", "Não é possível
  deletar: esta arma possui submissões associadas"). Sem tradução adicional no frontend.
- **429** (rate limit): mensagem fixa amigável, ex. "Muitas requisições. Aguarde um instante e tente
  novamente." — mesma linguagem do backend, exibida onde o formulário/ação atual já mostra erros.

## 6. Testes

Seguindo a convenção do projeto (arquivo de teste ao lado de cada componente/service/hook novo):

- Entrega 1: `WeaponForm.test.tsx` (validação de campos, submit chamando `onSubmit` com os dados
  certos), atualização de `WeaponCard.test.tsx`/`WeaponDetailPage.test.tsx`/`WeaponsPage.test.tsx`
  para os novos campos/botões condicionais por role, `weaponRarityToTier` testado isoladamente.
- Entrega 2: `weaponSubmissionService.test.ts`, `adminService.test.ts`, `ContributePage.test.tsx`
  (casos USER e ADMIN), atualização de `Header.test.tsx` (aba condicional), `apiClient.test.ts`
  (409/429).
- Validação manual do usuário após cada task (mobile 375px, desktop 1280px, dark/light mode),
  conforme `CLAUDE.md`.

## 7. Fora de escopo

- Mismatch equivalente de `rarity` em `Armor` (problema pré-existente e independente).
- Edição pelo ADMIN dos dados de uma submissão antes de aprovar (aprova/rejeita como está, mesma
  decisão já tomada no backend).
- Fila de submissão para outras entidades (armadura, inimigo, boss, bioma) — mesmo padrão se repete
  depois, entidade por entidade, quando o backend cobrir cada uma.
- Notificações (push/e-mail) de mudança de status de submissão.
