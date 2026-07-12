---
tags: [moc, indice]
aliases: [Home, Índice, Mapa do Projeto]
status: ativo
---

# Terraria Calamity RPG — Mapa de Conhecimento

Ponto de entrada do grafo do Obsidian para este repositório. Cada área do projeto tem
um MOC (Map of Content) próprio; código-fonte é representado por notas-índice que
apontam para os arquivos reais (`.java`, `.tsx`) sem alterá-los.

## Áreas

- [[Backend-MOC]] — API Spring Boot / Java
- [[Frontend-MOC]] — React / Vite / TypeScript
- [[Infra-MOC]] — banco de dados, deploy, CI/CD

## Documentação de referência

- [[ARCHITECTURE]] — camadas e decisões arquiteturais
- [[SECURITY_IMPLEMENTATION]] — configuração de segurança

## Planejamento

- `docs/superpowers/plans/` — um plano por feature/mudança, aprovado antes da execução
- `docs/superpowers/specs/` — specs de design que antecedem os planos mais complexos

## Convenção de manutenção

Todo arquivo novo ou alterado em `docs/`, `src/` (backend e frontend) deve se conectar
a este grafo: módulos de código ganham/atualizam sua nota-índice em `docs/vault/`, com
frontmatter (`tags`, `aliases`, `up`, `related`, `source`) e `[[wikilinks]]` no corpo.
Ver template em `docs/vault/_templates/module-note.md` e a regra completa no `CLAUDE.md`.
