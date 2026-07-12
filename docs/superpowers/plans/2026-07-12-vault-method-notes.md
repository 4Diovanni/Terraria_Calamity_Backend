---
tags: [plan, docs, obsidian]
aliases: [Notas de Métodos no Vault]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Frontend-MOC]]"
  - "[[2026-07-12-obsidian-knowledge-graph]]"
status: ativo
---

# Plano — Notas de Métodos por Classe no Vault do Obsidian

> Ver também: [[Backend-MOC]] · [[Frontend-MOC]] · plano anterior: [[2026-07-12-obsidian-knowledge-graph]]

**Data:** 2026-07-12
**Branch:** `docs/vault-method-notes` (rodada 1; rodadas seguintes em branches próprias)
**Tipo:** docs (nenhuma mudança de código-fonte)

## Objetivo

Descer um nível na granularidade do grafo: cada **classe/arquivo relevante** de
backend e frontend ganha uma nota própria explicando **cada método** (o que faz,
parâmetros/retorno em uma linha, quem chama e quem é chamado), com wikilinks
formando a teia real de chamadas frontend → backend → banco.

## Decisões (alinhadas com o usuário)

1. **Granularidade: uma nota por classe** (não por método — nomes de método como
   `create`/`findById` colidiriam, pois nomes de nota são únicos no vault inteiro).
2. **Escopo: backend + frontend completos**, em 4 rodadas com PR e validação entre elas.

## Regra de nomes (crítica)

A resolução de wikilink do Obsidian é **case-insensitive**: `weaponService.md`
(frontend) colidiria com `WeaponService.md` (backend). Convenção:

- Notas de classe do backend: nome da classe como está (`WeaponService.md`).
- Notas de módulo do frontend em `services/`: sufixo `-ts` uniforme
  (`weaponService-ts.md`, `authService-ts.md`, ...), porque 4 delas colidem com
  services do backend e a regra uniforme é mais fácil de manter.
- Hooks, context e lib do frontend: nome como está (`useWeapons.md`,
  `AuthContext.md`, `weaponDiff.md`) — sem colisões.

## Estrutura nova

```
docs/vault/
  _templates/class-note.md        <- template novo (nota de classe com ## Métodos)
  backend/classes/                <- notas de classe do backend
  frontend/modules/               <- notas de módulo do frontend
```

Cada nota de classe: frontmatter (`up` → nota-índice do módulo, `source` → arquivo
único) + seção `## Métodos` (um bloco por método: assinatura resumida, o que faz,
chamado por / chama) + `## Conexões`.

As notas-índice de módulo existentes (ex.: [[Weapons]]) ganham uma seção
`## Classes` linkando para baixo.

## Rodadas

- **Rodada 1 (esta branch)** — Backend controllers + services (14 notas):
  `AdminController`, `ArmorController`, `AuthController`, `SubmissionController`,
  `WeaponController`, `WeaponElementController`, `AdminDashboardService`,
  `ArmorService`, `AuthService`, `CustomUserDetailsService`, `JwtService`,
  `SubmissionService`, `WeaponElementService`, `WeaponService`.
  Inclui: template `class-note.md`, subpastas, seção `## Classes` nas notas-índice
  de backend, regra no `CLAUDE.md`.
- **Rodada 2** — Backend config/mappers/exceptions/repositories (12 notas):
  `SecurityConfig`, `JwtAuthenticationFilter`, `RateLimitFilter`, `JacksonConfig`,
  `ArmorMapper`, `WeaponMapper`, `WeaponPayloadMapper`, `GlobalExceptionHandler`,
  `ArmorRepository`, `SubmissionRepository`, `UserRepository`, `WeaponRepository`.
- **Rodada 3** — Frontend services (9 notas, sufixo `-ts`):
  `apiClient-ts`, `adminService-ts`, `armorService-ts`, `authService-ts`,
  `biomeService-ts`, `bossService-ts`, `enemyService-ts`, `submissionService-ts`,
  `weaponService-ts`.
- **Rodada 4** — Frontend hooks/context/lib (9 notas):
  `useAuth`, `useFetch`, `useWeapons`, `useSubmissionTargetWeapon`, `AuthContext`,
  `theme`, `weaponDiff`, `weaponPreview`, `weaponRarity`.

Fora de escopo: componentes de página/UI (`.tsx` de render) — já cobertos pelas
notas-índice de módulo; entities/DTOs/exceptions triviais do backend (sem lógica).

## Manutenção (atualização do CLAUDE.md)

Regra nova: ao adicionar/alterar/remover um **método** de uma classe que tem nota em
`backend/classes/` ou `frontend/modules/`, atualizar a seção `## Métodos`
correspondente no mesmo PR. Ao criar classe nova em módulo indexado, criar a nota de
classe junto.

## Validação

Após cada rodada: usuário confere no Obsidian — notas de classe penduradas na
nota-índice certa, cadeia controller → service → repository visível no grafo,
nenhum wikilink não resolvido novo (checklist de auditoria da memória).
