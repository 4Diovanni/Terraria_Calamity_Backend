---
tags: [spec, frontend, admin]
aliases: [Dashboard Admin como Aba Própria — Design]
up: "[[INDEX]]"
related:
  - "[[AdminPage]]"
  - "[[ProfilePage]]"
  - "[[2026-07-09-dashboard-admin-aba]]"
status: ativo
---

# Dashboard Admin como Aba Própria (Fase 2, parte 2) — Design Spec

> Ver também: plano: [[2026-07-09-dashboard-admin-aba]] · [[AdminPage]] · [[ProfilePage]]

**Data:** 2026-07-09
**Escopo:** Frontend apenas. Segunda parte da Fase 2 do redesign de contribuições (a fundação foi
mergeada no PR #62; o diff estilo GitHub nas submissões foi mergeado no PR #63). Move os cards de
estatística do admin — hoje embutidos na aba "Contribuições", junto da fila de submissões — para uma
aba "Dashboard" própria dentro do Perfil, visível só para administradores.

A terceira parte da Fase 2 — preview ao vivo da página ao criar/editar — fica para uma spec separada,
fora do escopo deste documento.

---

## 1. Objetivo

- Extrair os 6 cards de estatística (Usuários, Admins, Armas, Pendentes, Aprovadas, Rejeitadas) de
  dentro de `AdminContributeView` para um componente próprio, `AdminDashboardView`, com sua própria
  busca de dados e seu próprio estado de loading/erro.
- `ProfilePage` ganha uma terceira aba, "Dashboard", que renderiza `AdminDashboardView`. Essa aba só
  aparece na lista de abas quando `user?.role === 'ADMIN'` — para um usuário comum, ela não existe
  (não aparece nem desabilitada).
- Ordem final das abas: Perfil, Contribuições, Dashboard.
- `AdminContributeView` continua existindo, mas só com a fila de submissões (filtro de status,
  expandir com `SubmissionDiff`, aprovar/rejeitar) — perde a busca e a renderização dos cards.
- Mesmo conteúdo dos cards de hoje, sem dado novo, sem gráfico — só reorganização de onde vive e como
  é buscado.

---

## 2. Fora de escopo (decisões explícitas)

| Tema | Decisão |
|---|---|
| Preview ao vivo da página ao criar/editar | Fase 2, parte 3, spec separada. Fora deste documento. |
| Novo conteúdo no dashboard (gráficos, atividade recente, etc.) | Não. Só os 6 cards que já existem, movidos para uma aba própria. |
| Sincronizar o dashboard em tempo real com ações da aba Contribuições (ex.: atualizar contadores assim que uma submissão é aprovada, sem trocar de aba) | Não é necessário — como cada aba desmonta ao trocar (padrão já usado em `ProfilePage`), o Dashboard busca dados frescos toda vez que é aberto. Não há necessidade de estado compartilhado entre `AdminDashboardView` e `AdminContributeView`. |
| Mudança de layout dos cards (grid, cores, tamanhos) | Não. Mesmo grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`), mesmos estilos — só muda o componente que os contém e busca os dados. |
| Esconder a aba Dashboard de forma desabilitada (visível mas cinza) para não-admin | Não. A aba simplesmente não é renderizada na lista de abas quando o role não é `ADMIN` — mesmo padrão de "esconder completamente" já usado no projeto (ex.: link "Contribuir" removido do Header na Fase 1, não deixado desabilitado). |

---

## 3. Arquitetura e componentes

### 3.1 `AdminDashboardView` — novo componente

Novo arquivo `src/frontend/src/components/pages/AdminDashboardView.tsx`, extraído da metade de
`AdminContributeView.tsx` que hoje cuida do dashboard (array `DASHBOARD_CARDS`, linhas 17-24 atuais, e
o bloco de renderização dos cards, linhas 85-97 atuais):

```tsx
export const AdminDashboardView = () => { ... }
```

Busca `adminService.getDashboard()` no próprio `useEffect` ao montar, com seu próprio estado
(`dashboard`, `loading`, `error`). Renderiza o mesmo grid de 6 cards que existe hoje. Em caso de erro,
mostra `ErrorView` com `onRetry` que rechama a busca — mesmo padrão já usado em `AdminContributeView`/
`UserContributeView` hoje.

### 3.2 `AdminContributeView` — simplificado

Perde: o import de `adminService`, o array `DASHBOARD_CARDS`, o estado `dashboard`, a chamada a
`adminService.getDashboard()` dentro de `fetchAll` (que passa a buscar só `submissionService.getAll`),
e o bloco JSX dos cards. Mantém: filtro de status, lista de submissões, expandir com `SubmissionDiff`,
aprovar/rejeitar. Nenhuma mudança visual ou de comportamento no que sobra.

### 3.3 `ProfilePage` — nova aba condicional

```tsx
type Tab = 'profile' | 'contributions' | 'dashboard';
```

A lista de botões de aba ganha um terceiro botão "Dashboard", renderizado só quando
`user?.role === 'ADMIN'` (ex.: `{user?.role === 'ADMIN' && (<button ...>Dashboard</button>)}`), na
posição depois de "Contribuições". Novo bloco condicional `{tab === 'dashboard' && <AdminDashboardView />}`.

---

## 4. Fluxo de dados

```
Admin clica na aba "Dashboard"
        │
        ▼
  AdminDashboardView monta
        │
        ▼
  adminService.getDashboard()
        │
        ├── sucesso ──► renderiza os 6 cards
        │
        └── falha ──► ErrorView com retry (rechama adminService.getDashboard())

Trocar de aba ──► AdminDashboardView desmonta (padrão já existente em ProfilePage)
Reabrir a aba ──► remonta, busca de novo (dados sempre atuais, sem cache)
```

---

## 5. Tratamento de erros

| Situação | Comportamento |
|---|---|
| `adminService.getDashboard()` falha | `AdminDashboardView` mostra `ErrorView` com mensagem genérica ("Erro ao carregar o painel administrativo.") e `onRetry` que tenta de novo — mesmo padrão já usado hoje em `AdminContributeView`. |
| Busca em andamento | `Loading` compacto (`fullHeight={false}`), mesmo padrão já usado nas outras views. |
| Usuário sem role ADMIN tenta acessar a aba Dashboard | Impossível pela UI — o botão da aba não existe para esse usuário. Sem rota direta (`/perfil` não tem sub-rotas por aba), então não há necessidade de guard adicional além de não renderizar o botão. |

---

## 6. Testes

| Área | Cenários |
|---|---|
| `AdminDashboardView.test.tsx` (novo) | Renderiza os 6 cards com os valores corretos (migra as asserções de dashboard hoje em `AdminContributeView.test.tsx`); mostra loading enquanto busca; mostra erro com retry funcional se a busca falhar. |
| `AdminContributeView.test.tsx` | Remove o mock de `adminService` e as asserções de dashboard — mantém só os testes de fila/expandir/aprovar/rejeitar/filtro de status, que já não dependiam do conteúdo dos cards. |
| `ProfilePage.test.tsx` | Novo teste: aba "Dashboard" aparece para `role: 'ADMIN'` e não aparece para `role: 'USER'`. Novo teste: clicar na aba "Dashboard" renderiza `AdminDashboardView` (mockando `adminService.getDashboard`). |

Rodar `npx vitest run` em `src/frontend` — todos os testes devem passar antes de qualquer commit
(contagem não é fixa, conforme prática já estabelecida no projeto).

---

## 7. Arquivos

**Novos**
- `src/frontend/src/components/pages/AdminDashboardView.tsx`
- `src/frontend/src/components/pages/AdminDashboardView.test.tsx`

**Modificados**
- `src/frontend/src/components/pages/AdminContributeView.tsx` — remove busca/renderização de dashboard
- `src/frontend/src/components/pages/AdminContributeView.test.tsx` — remove mock/asserções de dashboard
- `src/frontend/src/components/pages/ProfilePage.tsx` — adiciona aba "Dashboard" condicional ao role
- `src/frontend/src/components/pages/ProfilePage.test.tsx` — novos testes de visibilidade/render da aba

---

## 8. Fora de escopo (repetido para clareza)

Preview ao vivo da página ao criar/editar continua pendente como a terceira parte da Fase 2, com sua
própria spec. Nenhuma mudança de backend nesta spec — puramente reorganização de componentes
frontend, reaproveitando o endpoint `/api/v1/admin/dashboard` que já existe e já é usado hoje.
