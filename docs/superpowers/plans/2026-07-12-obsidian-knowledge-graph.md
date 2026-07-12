---
tags: [plan, docs, obsidian]
aliases: [Interligar o Projeto no Obsidian]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Frontend-MOC]]"
status: ativo
---

# Plano — Interligar o projeto no Obsidian (grafo de conhecimento)

> Ver também: [[Backend-MOC]] · [[Frontend-MOC]]

**Data:** 2026-07-12
**Branch:** `docs/obsidian-knowledge-graph`
**Tipo:** docs (nenhuma mudança de código-fonte)

## Objetivo

Tornar o repositório inteiro navegável como um **grafo de conhecimento no Obsidian**: ver
onde cada parte (backend, frontend, infra, planos, specs, guias) se liga às demais, e que
criações/edições/exclusões apareçam no grafo. Estabelecer uma **convenção** para que todo
arquivo novo/alterado, daqui pra frente, entre nessa teia.

## Decisões (alinhadas com o usuário)

1. **Código-fonte → notas-índice por módulo.** `.java`/`.tsx` não viram nós de grafo.
   Cada módulo/feature ganha uma nota `.md` companheira em `docs/vault/` que descreve o
   módulo e aponta para os arquivos por caminho. O código **não** é alterado.
2. **Escopo agora: fundação + amostra.** Monta-se a estrutura e aplica-se a uma fatia
   representativa; o resto migra incrementalmente.
3. **Sincronização: convenção manual.** Regra no `CLAUDE.md`: ao mexer num módulo,
   atualizar a nota-índice correspondente no mesmo PR. O Obsidian já detecta `.md`
   automaticamente.

## Problema crítico a resolver (config)

A raiz do repo é o vault (`.obsidian/` está na raiz). Hoje o Obsidian indexa **617 `.md`
dentro de `node_modules/`**, além de `target/`, `dist/`, `.claude/skills/`. Isso polui o
grafo. Primeira tarefa: filtros de exclusão em `.obsidian/app.json`.

## Estrutura do vault

```
docs/vault/
  INDEX.md                 <- home / MOC raiz (ponto de entrada do grafo)
  _templates/
    module-note.md         <- template de frontmatter para novas notas-índice
  backend/
    Backend-MOC.md
    Auth.md                <- AuthController, AuthService, JwtService, SecurityConfig...
    Weapons.md             <- WeaponController/Service/Mapper, Weapon entity...
  frontend/
    Frontend-MOC.md
    Carousel.md            <- components/ui/Carousel.tsx
    WeaponsPage.md         <- WeaponsPage.tsx, WeaponForm*, WeaponCard...
  infra/
    Infra-MOC.md           <- Supabase, Flyway, Render, Docker, CI
```

## Convenção de frontmatter (todas as notas do vault)

```yaml
---
tags: [backend, auth]          # área + tópico
aliases: [Autenticação]        # nome PT-BR pesquisável
up: "[[Backend-MOC]]"          # nota-pai (hierarquia no grafo)
related:                       # ligações laterais
  - "[[Weapons]]"
  - "[[SECURITY_IMPLEMENTATION]]"
status: ativo                  # ativo | rascunho | obsoleto
source:                        # arquivos de código que a nota indexa
  - src/main/java/.../AuthController.java
---
```
Além do frontmatter, o **corpo** sempre usa `[[wikilinks]]` inline (garantia de aresta no
grafo em qualquer versão do Obsidian).

## Config do `.obsidian`

- `app.json`: `userIgnoreFilters` excluindo `node_modules/`, `target/`, `dist/`,
  `.claude/`, `.idea/`, `.mvn/`, `.git/`.
- `graph.json`: `colorGroups` por pasta/tag — backend, frontend, infra, plans, specs, guides.

## Tasks

- **Task 1 — Config do Obsidian.** `app.json` (ignore filters) + `graph.json` (colorGroups).
  Sem isso o grafo é inutilizável.
- **Task 2 — Esqueleto do vault + template.** Criar `docs/vault/`, `INDEX.md` (MOC raiz),
  `_templates/module-note.md`, e os 3 MOCs de área (Backend/Frontend/Infra).
- **Task 3 — Notas-índice de amostra.** `backend/Auth.md`, `backend/Weapons.md`,
  `frontend/Carousel.md`, `frontend/WeaponsPage.md`, `infra/Infra-MOC.md` — todas
  ligadas entre si e aos MOCs, referenciando arquivos reais.
- **Task 4 — Retrofit de amostra em docs existentes.** Adicionar frontmatter + wikilinks
  em `ARCHITECTURE.md`, `SECURITY_IMPLEMENTATION.md`, um plano e um spec, ligando-os ao
  vault (demonstra o padrão de migração incremental).
- **Task 5 — README raiz + convenção no CLAUDE.md.** Seção "Mapa de Conhecimento
  (Obsidian)" no README apontando pro `INDEX.md`; regra de manutenção no `CLAUDE.md`.

## Validação

Usuário abre o Obsidian, confere: (1) grafo sem `node_modules`; (2) `INDEX.md` como hub
alcançando backend/frontend/infra/plans/specs; (3) cores por área; (4) backlinks
funcionando nas notas de amostra.

## Fora de escopo (migração incremental posterior)

- Notas-índice para todos os demais módulos (Admin, Submissions, Armor, Elements, todas
  as páginas do frontend).
- Frontmatter nas ~40 notas restantes de `plans/` e `specs/`.
