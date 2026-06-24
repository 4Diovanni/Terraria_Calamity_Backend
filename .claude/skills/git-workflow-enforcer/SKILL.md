---
name: git-workflow-enforcer
description: Garante o uso de boas práticas no Git, como criar branches padrão, commits convencionais e preparar Pull Requests.
---

# Diretrizes de Fluxo de Trabalho do Git (Git Workflow)

Sempre que a tarefa do usuário envolver modificação de código ou versionamento, você DEVE seguir este fluxo de trabalho rigorosamente:

1. **Verificação de Branch:**
   - Nunca faça commits diretamente nas branches `main`, `master` ou `develop`.
   - Antes de começar qualquer alteração, crie uma nova branch a partir da branch principal atualizada.
   - Use um padrão de nomenclatura claro:
     - `feat/...` para novas funcionalidades.
     - `fix/...` para correção de bugs.
     - `refactor/...` para refatorações de código.
     - `docs/...` para alterações na documentação.

2. **Boas Práticas de Commit:**
   - Revise o `git status` e o `git diff` antes de commitar para garantir que apenas os arquivos desejados sejam incluídos.
   - Faça commits atômicos e concisos (agrupe alterações que fazem sentido juntas).
   - Use o padrão **Conventional Commits** para as mensagens:
     - Exemplo: `feat: adiciona botão de login na página inicial`
     - Exemplo: `fix: resolve travamento ao carregar lista de usuários`
   - O título do commit deve ser no imperativo e ter no máximo 50 a 72 caracteres.

3. **Push e Pull Request (PR):**
   - Após finalizar os commits, faça o push da branch para o repositório remoto (`git push origin nome-da-branch`).
   - Oriente o usuário a criar o Pull Request (ou crie via CLI se as ferramentas estiverem disponíveis).
   - Sempre forneça uma sugestão de título e descrição para o PR com base nos commits realizados, incluindo:
     - **O que foi feito:** Breve resumo das mudanças.
     - **Por que foi feito:** Qual problema isso resolve.
     - **Como testar:** Passos para validar a alteração.
