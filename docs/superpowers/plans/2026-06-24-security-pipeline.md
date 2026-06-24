# Pipeline de Segurança (GitHub Actions)

## Objetivo
Adicionar automação de segurança via GitHub Actions para o repositório
(Maven/Java backend + frontend Node em `src/frontend` + `package.json` na
raiz), cobrindo: análise estática de código, revisão de dependências em
PRs, varredura de segredos vazados e atualizações automáticas de
dependências vulneráveis.

## Contexto
- Repositório público (`4Diovanni/Terraria_Calamity_Backend`), branch
  padrão `main`.
- Não existe pasta `.github/` ainda.
- Dois ecossistemas de dependências: Maven (`pom.xml`) e npm (`package.json`
  na raiz e em `src/frontend/package.json`).
- Ferramentas escolhidas são gratuitas/zero-config para repos públicos e
  não dependem de chaves de API externas (evita flakiness em CI).

## Arquivos a criar

1. `.github/workflows/codeql.yml`
   - CodeQL para `java-kotlin` e `javascript-typescript`.
   - Gatilhos: `push` em `main`, `pull_request` para `main`, e `schedule`
     semanal.

2. `.github/workflows/dependency-review.yml`
   - `actions/dependency-review-action` em `pull_request`.
   - Falha o PR se houver dependência nova com severidade `high` ou maior.

3. `.github/workflows/secret-scan.yml`
   - `gitleaks` em `push` e `pull_request`, full history scan.

4. `.github/dependabot.yml`
   - Atualizações de segurança + versão para `maven`, `npm` (raiz e
     `src/frontend`) e `github-actions`, semanal.

## Fora de escopo
- OWASP Dependency-Check / Snyk: requerem chave de API (NVD) ou conta
  externa — ficam de fora para não introduzir flakiness/setup extra.
  Pode ser adicionado depois se o usuário quiser.

## Como testar
1. Validar sintaxe YAML localmente.
2. Push da branch `feat/security-pipeline` e abertura de PR.
3. Conferir na aba "Actions" do GitHub que os workflows disparam e
   completam (CodeQL e secret-scan rodam mesmo sem PR ativo; dependency
   review roda no próprio PR).
4. Conferir aba "Security" do repositório para os alertas do
   Dependabot/CodeQL habilitados.
