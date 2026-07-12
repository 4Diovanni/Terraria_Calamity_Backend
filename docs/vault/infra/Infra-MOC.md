---
tags: [infra, moc]
aliases: [Infraestrutura, Mapa de Infra]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Frontend-MOC]]"
status: ativo
source:
  - supabase/config.toml
  - render.yaml
  - Dockerfile
  - .github/workflows
---

# Infraestrutura — Mapa

Banco de dados, deploy e pipelines de CI/CD do projeto.

## Banco de dados

- `supabase/config.toml` — configuração do projeto Supabase local/preview branches
- `supabase/migrations/20260624070006_remote_schema.sql` — schema remoto
- Migrations de aplicação em `src/main/resources/db/migration/` (Flyway), aplicadas
  automaticamente na inicialização do backend — ver [[ARCHITECTURE]]
- Conexão local via Session Pooler (`aws-1-sa-east-1.pooler.supabase.com`), variáveis
  em `.env` (nunca comitado) — ver regra "Backend — Configuração Local" no `CLAUDE.md`

## Deploy

- `render.yaml` — deploy do backend no Render
- `Dockerfile` — build da imagem do backend
- Frontend hospedado em Vercel ou Render Static Site

## CI/CD

- `.github/workflows/codeql.yml` — análise estática de segurança
- `.github/workflows/dependency-review.yml` — revisão de dependências em PRs
- `.github/workflows/secret-scan.yml` — varredura de segredos
- `.github/workflows/keep-alive.yml` — pinga o health do Actuator a cada ~10 min
  para evitar o cold start de hibernação do plano free do Render; URL no secret
  `RENDER_HEALTH_URL`. O endpoint `/actuator/**` é público via [[SecurityConfig]].

## Conexões

- Sustenta a persistência do [[Backend-MOC]].
- Detalhes de segurança em [[SECURITY_IMPLEMENTATION]].
