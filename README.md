# Terraria Calamity RPG - Backend API

Um backend robusto para um RPG inspirado em Terraria Calamity, desenvolvido com **Spring Boot 3.5.9** e **Java 21**, oferecendo uma API RESTful para gerenciar entidades do jogo.

## 📋 Sobre o Projeto

Este é o backend de uma aplicação de RPG que implementa o universo de Terraria Calamity. A arquitetura segue padrões de desenvolvimento profissionais com separação clara de responsabilidades entre camadas.

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
└── domain/                       # Camada de Domínio
    ├── entity/                   # Entidades JPA
    ├── dto/                      # Data Transfer Objects
    └── repository/               # Interfaces de Repositório
```

## 🛠️ Stack Tecnológico

### Framework & Core
- **Spring Boot 3.5.9** - Framework web e DI
- **Spring Data JPA** - ORM para acesso a dados
- **Spring Validation** - Validação de dados
- **Spring Boot Actuator** - Monitoramento e health checks

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional
- **Flyway** - Versionamento e migrations

### Ferramentas de Desenvolvimento
- **Lombok** (v1.18.36) - Redução de boilerplate code
- **MapStruct** (v1.6.3) - Mapeamento entre objetos
- **Spring Boot DevTools** - Hot reload para desenvolvimento
- **Dotenv** - Gerenciamento de variáveis de ambiente

### Testes
- **Spring Boot Test** - Framework de testes
- **H2 Database** - Banco em memória para testes
- **Testcontainers** - PostgreSQL em container para testes

## 📦 Funcionalidades Implementadas

### Weapon (Armas)
- **CRUD completo** de armas
  - `GET /api/weapons` - Listar todas as armas
  - `GET /api/weapons/{id}` - Obter arma por ID
  - `POST /api/weapons` - Criar nova arma
  - `PUT /api/weapons/{id}` - Atualizar arma
  - `DELETE /api/weapons/{id}` - Deletar arma

**Atributos da Arma:**
- Nome único
- Descrição
- Raridade
- Dano base
- Velocidade de ataque
- Tipo de dano

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Java 21** LTS instalado
- **PostgreSQL** 12+ instalado e rodando
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
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/terraria_calamity
   SPRING_DATASOURCE_USERNAME=seu_usuario
   SPRING_DATASOURCE_PASSWORD=sua_senha
   SPRING_JPA_HIBERNATE_DDL_AUTO=validate
   ```

3. **Crie o banco de dados PostgreSQL**
   ```sql
   CREATE DATABASE terraria_calamity;
   ```

4. **Execute o projeto**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Ou compile e rode via Java:
   ```bash
   ./mvnw clean package
   java -jar target/Calamity-0.0.1-SNAPSHOT.jar
   ```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SPRING_DATASOURCE_URL` | URL de conexão PostgreSQL | `jdbc:postgresql://localhost:5432/terraria_calamity` |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco | `sua_senha_segura` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Estratégia de schema | `validate` (production) |
| `SERVER_PORT` | Porta da aplicação | `8080` |

## 🧪 Testando a API

### Com cURL

```bash
# Listar todas as armas
curl http://localhost:8080/api/weapons

# Criar nova arma
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

1. Importe os endpoints da API
2. Configure as variáveis:
   - Base URL: `http://localhost:8080`
3. Teste os endpoints em `api/weapons`

## 📊 Migrations (Flyway)

As migrations SQL estão localizadas em:
```
src/main/resources/db/migration/
```

O Flyway gerencia automaticamente as versões do schema PostgreSQL.

## 🔒 Segurança

- Validação de entrada em todos os endpoints
- Tratamento centralizado de exceções
- Logs estruturados
- Preparado para integração futura de autenticação (JWT)

## 📚 Dependências Principais

```xml
<!-- Veja pom.xml para a lista completa -->
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- flyway-core + flyway-database-postgresql
- lombok
- mapstruct
- postgresql driver
```

## 🔄 CI/CD & Deploy

Aplicação preparada para deploy em:
- **Docker** (via Spring Boot Maven Plugin)
- **Heroku** / **Railway**
- **AWS / Google Cloud**

## 🛣️ Roadmap Futuro

- [ ] Autenticação JWT
- [ ] Autorização baseada em roles
- [ ] Endpoints adicionais (Bosses, Items, Players)
- [ ] Caching com Redis
- [ ] Testes unitários e integração expandidos
- [ ] Documentação com Swagger/OpenAPI
- [ ] Rate limiting e throttling

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
- Verifique a documentação do Spring Boot: https://spring.io/projects/spring-boot

---

**Desenvolvido com ❤️ para a comunidade de Terraria Calamity**
