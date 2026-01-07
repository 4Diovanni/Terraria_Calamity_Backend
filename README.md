# Terraria Calamity RPG - Backend API

Um backend robusto para um RPG inspirado em Terraria Calamity, desenvolvido com **Spring Boot 3.5.9** e **Java 21**, oferecendo uma API RESTful para gerenciar entidades do jogo.

## 📋 Sobre o Projeto

Este é o backend de uma aplicação de RPG que implementa o universo de Terraria Calamity. A arquitetura segue padrões de desenvolvimento profissionais com separação clara de responsabilidades entre camadas e segurança implementada.

## 🏗️ Arquitetura

O projeto utiliza uma **arquitetura em camadas** bem definida:

```
src/main/java/com/terraria/calamity/
├── api/                          # Camada de Apresentação
│   ├── controller/               # Controladores REST
│   └── exception/                # Tratamento de exceções
├── application/                  # Camada de Aplicação
│   ├── service/                  # Lógica de negócio
│   └── mapper/                   # Mappers (Entity <-> DTO)
├── domain/                       # Camada de Domínio
│   ├── entity/                   # Entidades JPA
│   ├── dto/                      # Data Transfer Objects
│   └── repository/               # Interfaces de Repositório
└── config/                       # Configurações
    └── SecurityConfig.java       # Segurança Spring Security
```

## 🛠️ Stack Tecnológico

### Framework & Core
- **Spring Boot 3.5.9** - Framework web e DI
- **Spring Data JPA** - ORM para acesso a dados
- **Spring Validation** - Validação de dados
- **Spring Security** - Autenticação e autorização
- **Spring Boot Actuator** - Monitoramento e health checks

### Banco de Dados
- **PostgreSQL** (via Supabase) - Banco de dados relacional
- **Flyway** - Versionamento e migrations

### Ferramentas de Desenvolvimento
- **Lombok** (v1.18.36) - Redução de boilerplate code
- **MapStruct** (v1.6.3) - Mapeamento entre objetos
- **Spring Boot DevTools** - Hot reload para desenvolvimento
- **Dotenv** - Gerenciamento de variáveis de ambiente

### Testes
- **Spring Boot Test** - Framework de testes
- **Spring Security Test** - Testes de segurança
- **H2 Database** - Banco em memória para testes
- **Testcontainers** - PostgreSQL em container para testes

## 📦 Funcionalidades Implementadas

### Weapon (Armas) - CRUD
- **GET /api/weapons** - Listar todas as armas (✅ PÚBLICO)
- **GET /api/weapons/{id}** - Obter arma por ID (✅ PÚBLICO)
- **POST /api/weapons** - Criar nova arma (🔐 PROTEGIDO)
- **PUT /api/weapons/{id}** - Atualizar arma (🔐 PROTEGIDO)
- **DELETE /api/weapons/{id}** - Deletar arma (🔐 PROTEGIDO)

**Atributos da Arma:**
- Nome único
- Descrição
- Raridade
- Dano base
- Velocidade de ataque
- Tipo de dano
- E mais!

## 🔐 Segurança Implementada

✅ **Spring Security Configurado**
- Endpoints GET públicos (qualquer um pode listar armas)
- Endpoints POST/PUT/DELETE protegidos (requer autenticação)
- BCrypt para hash de senhas
- Sessão stateless (pronto para JWT)

📚 **Documentação:** Veja [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Java 21** LTS instalado
- **PostgreSQL** (local ou Supabase)
- **Maven** 3.6+ (ou usar o wrapper incluído)

### Setup do Projeto

1. **Clone o repositório**
   ```bash
   git clone https://github.com/4Diovanni/Terraria_Calamity_Backend.git
   cd Terraria_Calamity_Backend
   ```

2. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   DB_HOST=db.elshjfsuxnmargpxqads.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=sua_senha_supabase_aqui
   
   SPRING_JPA_HIBERNATE_DDL_AUTO=validate
   SPRING_JPA_SHOW_SQL=false
   
   SERVER_PORT=8080
   ```
   
   > **Veja [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) para um guia detalhado!**

3. **Execute o projeto**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Ou compile e rode via Java:
   ```bash
   ./mvnw clean package
   java -jar target/Calamity-0.0.1-SNAPSHOT.jar
   ```

## 🗄️ Integração com Supabase

Este projeto está configurado para usar **PostgreSQL do Supabase**.

### Configuração Rápida
1. Crie uma conta em [Supabase](https://supabase.com)
2. Obtenha as credenciais do seu projeto
3. Preencha o arquivo `.env` com as credenciais
4. Execute o projeto!

Para um guia passo a passo, veja [SETUP_SUPABASE.md](./SETUP_SUPABASE.md).

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `DB_HOST` | Host do PostgreSQL | `db.elshjfsuxnmargpxqads.supabase.co` |
| `DB_PORT` | Porta PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco | `postgres` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `sua_senha_segura` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Estratégia de schema | `validate` (production) |
| `SPRING_JPA_SHOW_SQL` | Mostrar SQL no log | `false` |
| `SERVER_PORT` | Porta da aplicação | `8080` |

## 🧪 Testando a API

### Com cURL

```bash
# Listar todas as armas (PUBLIC ✅)
curl http://localhost:8080/api/weapons

# Criar nova arma (PROTECTED 🔐 - vai retornar 401)
curl -X POST http://localhost:8080/api/weapons \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Excalibur",
    "descricao": "Uma espada lendária",
    "raridade": "LENDARIO",
    "damoBase": 100,
    "velocidadeAtaque": 1.5,
    "tipoDano": "MELEE"
  }'
```

### Com Postman

1. Crie uma nova requisição GET
2. URL: `http://localhost:8080/api/weapons`
3. Clique em Send
4. Deve retornar `200 OK` com um array JSON

> **Se tiver erro no Postman:** Veja [FIX_POSTMAN_ERROR.md](./FIX_POSTMAN_ERROR.md)

## 📊 Migrations (Flyway)

As migrations SQL estão localizadas em:
```
src/main/resources/db/migration/
```

O Flyway gerencia automaticamente as versões do schema PostgreSQL.

## 🔒 Segurança

- ✅ Validação de entrada em todos os endpoints
- ✅ Tratamento centralizado de exceções
- ✅ Logs estruturados
- ✅ Arquivo `.env` nunca é commitado (adicione ao `.gitignore`)
- ✅ Spring Security com endpoints públicos/protegidos
- ✅ BCrypt para hash de senhas
- ✅ Preparado para autenticação JWT futura

## 📚 Dependências Principais

```xml
<!-- Veja pom.xml para a lista completa -->
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- spring-boot-starter-security
- flyway-core + flyway-database-postgresql
- lombok
- mapstruct
- postgresql driver
- spring-dotenv (variáveis de ambiente)
```

## 🔄 CI/CD & Deploy

Aplicação preparada para deploy em:
- **Docker** (via Spring Boot Maven Plugin)
- **Heroku** / **Railway**
- **AWS / Google Cloud**
- **Render** (com PostgreSQL do Supabase)

## 🛣️ Roadmap Futuro

- [ ] Autenticação JWT completa
- [ ] Endpoints de Login/Register
- [ ] Autorização baseada em roles (ADMIN, USER)
- [ ] Endpoints adicionais (Bosses, Items, Players, Inventory)
- [ ] Caching com Redis
- [ ] Testes unitários e integração expandidos
- [ ] Documentação com Swagger/OpenAPI
- [ ] Rate limiting e throttling
- [ ] WebSocket para multiplayer

## 📖 Documentação Adicional

- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Guia de configuração do Supabase
- [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) - Detalhes de segurança
- [FIX_POSTMAN_ERROR.md](./FIX_POSTMAN_ERROR.md) - Solução de erros do Postman
- [FIX_SCHEMA_VALIDATION_ERROR.md](./FIX_SCHEMA_VALIDATION_ERROR.md) - Solução de erros de schema

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Verifique a documentação relevante (veja links acima)
- Consulte a documentação do Spring Boot: https://spring.io/projects/spring-boot

---

**Desenvolvido com ❤️ para a comunidade de Terraria Calamity**
