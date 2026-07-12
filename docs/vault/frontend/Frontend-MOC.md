---
tags: [frontend, moc]
aliases: [Frontend, Mapa do Frontend]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Infra-MOC]]"
status: ativo
source:
  - src/frontend/src
---

# Frontend — Mapa

React + Vite + TypeScript + Tailwind. Identidade visual descrita na skill
`visual-identity` (tokens `calamity-*`).

## Módulos indexados

- [[Carousel]] — componente de carrossel reutilizável (`layout` fixo por seção)
- [[WeaponsPage]] — listagem, formulário e preview de armas
- [[AdminPage]] — views administrativas (dashboard + fila de revisão, dentro de [[ProfilePage]])
- [[Contributions]] — área de contribuições do usuário (nova proposta, minhas propostas, diff)
- [[ArmorPages]] — listagem e detalhe de armadura
- [[BossPages]] — listagem e detalhe de boss (dados mockados, sem backend)
- [[BiomePages]] — listagem e detalhe de bioma (dados mockados, sem backend)
- [[EnemyPages]] — listagem e detalhe de inimigo (dados mockados, sem backend)
- [[AuthPages]] — login, registro e rota protegida
- [[ProfilePage]] — hub da área logada (perfil/contribuições/dashboard)
- [[UIComponents]] — design system (`components/ui`, exceto Carousel)
- [[Placeholders]] — Itens, NPCs (em desenvolvimento) e 404

Todos os módulos de frontend estão indexados.

## Camada de serviços (notas de método)

- [[apiClient-ts]] — instância Axios central (JWT, retry/backoff, tratamento de erro)
  usada por todos os services abaixo
- Services por domínio: [[authService-ts]], [[weaponService-ts]], [[armorService-ts]],
  [[submissionService-ts]], [[adminService-ts]] (batem no backend) e
  [[bossService-ts]], [[biomeService-ts]], [[enemyService-ts]] (mockados)
- Estado/hooks: [[AuthContext]], [[useAuth]], [[useWeapons]],
  [[useSubmissionTargetWeapon]], [[useFetch]]
- Lib (funções puras): [[weaponDiff]], [[weaponPreview]], [[weaponRarity]], [[theme]]

## Estrutura

- `components/common` — layout, header, footer, rotas protegidas
- `components/pages` — uma página ou view por arquivo, com `*.test.tsx` par
- `components/ui` — componentes de UI reutilizáveis (design system)

## Conexões

- Consome a API do [[Backend-MOC]].
- Testes: `npx vitest run` (contagem cresce a cada task, ver `CLAUDE.md`).
