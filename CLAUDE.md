# Terraria Calamity RPG — Diretrizes para Claude

## Git — Branches

SEMPRE executar `git checkout main && git pull origin main` antes de criar qualquer branch nova.

Nomear com prefixo do propósito:
- `feat/` → nova funcionalidade
- `fix/` → correção de bug
- `style/` → ajustes visuais/CSS
- `refactor/` → reestruturação sem mudança de comportamento
- `docs/` → documentação
- `chore/` → limpeza, dependências, configuração

NUNCA misturar frontend e backend na mesma branch. NUNCA commitar diretamente na `main`.

## Git — Commits

- Usar Conventional Commits: `feat(scope):`, `fix(scope):`, `style(scope):`, `refactor(scope):`, `docs:`, `chore:`
- Commits atômicos: uma mudança lógica por commit
- Cada task de um plano gera seu próprio commit
- NUNCA commitar com testes falhando

## Testes — Frontend

Após cada mudança de componente frontend, rodar:

```
cd src/frontend
npx vitest run
```

Total de testes: **31** — todos devem passar antes de qualquer commit. Se um teste quebrar, corrigir antes de prosseguir.

## Validação Manual — Frontend

Após cada task, PARAR e deixar o usuário validar visualmente no browser antes de avançar.
O usuário verifica: mobile (375px), desktop (1280px), dark mode e light mode.
Testes automatizados verificam correção de código, não qualidade visual.

## Planejamento

Para tarefas com múltiplos passos:
1. Criar plano em `docs/superpowers/plans/YYYY-MM-DD-<nome>.md`
2. Apresentar ao usuário e aguardar aprovação
3. Executar uma task de cada vez → testes → mostrar resultado → aguardar validação

## Pull Requests

- Um PR por branch/feature
- Título em conventional commit style
- Body: **Summary** (bullet points) + **Test plan** (checklist de validação manual)
- Repositório: `4Diovanni/Terraria_Calamity_Backend`
- NUNCA fazer merge sem aprovação explícita do usuário

## Frontend — Regras de Design

- Usar tokens `calamity-*` do Tailwind, NUNCA hex hardcoded nos componentes de tema
- Exceção: cores semânticas de gameplay (raridade, personagens de lore) podem usar hex
- NUNCA usar emojis em componentes
- Mobile-first: classes base para mobile, `sm:`/`md:`/`lg:` para telas maiores
- Componente `Carousel`: usar prop `layout` (`portrait-left` | `portrait-right`) fixa por seção — NUNCA alternar por índice de slide

## Backend — Configuração Local

- Banco: Supabase PostgreSQL via Session Pooler (`aws-1-sa-east-1.pooler.supabase.com`)
- Variáveis carregadas via `spring.config.import: "optional:file:.env[.properties]"` no `application.yml`
- NÃO usar spring-dotenv (removido — incompatível com Spring Boot 4.x)
- Erro de conexão com `localhost:5432` → verificar se o arquivo `.env` existe na raiz do projeto
