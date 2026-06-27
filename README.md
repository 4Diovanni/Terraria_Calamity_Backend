# Terraria Calamity RPG — Backend API

Backend de um RPG inspirado em Terraria Calamity, com API RESTful em **Spring Boot 4.1.0 / Java 21** e frontend em **React + Vite + TypeScript**, banco de dados **PostgreSQL via Supabase**.

---

## Estrutura do Projeto

```
Terraria_Calamity_Backend/
├── src/
│   ├── main/
│   │   ├── java/com/terraria/calamity/
│   │   │   ├── api/            # Controllers REST + tratamento de exceções
│   │   │   ├── application/    # Services + Mappers (Entity <-> DTO)
│   │   │   ├── domain/         # Entities JPA + DTOs + Repositories
│   │   │   └── config/         # Spring Security, CORS, etc.
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/   # Flyway migrations
│   ├── frontend/               # React + Vite + TypeScript + Tailwind
│   └── test/
├── supabase/                   # Supabase config / preview branches
├── postman/                    # Coleção Postman da API
├── docs/                       # Documentação detalhada
├── Dockerfile
├── render.yaml
└── pom.xml
```

---

## Stack

| Camada       | Tecnologia                                                   |
|--------------|--------------------------------------------------------------|
| Framework    | Spring Boot 4.1.0, Java 21                                   |
| Persistência | Spring Data JPA, Flyway, PostgreSQL (Supabase)               |
| Segurança    | Spring Security, JWT (JJWT 0.12.6), BCrypt                  |
| Mapeamento   | MapStruct 1.6.3, Lombok 1.18.46                              |
| Testes       | Spring Boot Test, H2 (unit), Testcontainers (integration)    |
| Frontend     | React 18, Vite, TypeScript, Tailwind CSS                     |
| Deploy       | Render (backend), Supabase (banco), Vercel (frontend)        |

---

## Endpoints — Weapons

| Método | Rota                  | Acesso     |
|--------|-----------------------|------------|
| GET    | `/api/weapons`        | Público    |
| GET    | `/api/weapons/{id}`   | Público    |
| POST   | `/api/weapons`        | Protegido  |
| PUT    | `/api/weapons/{id}`   | Protegido  |
| DELETE | `/api/weapons/{id}`   | Protegido  |

Endpoints protegidos requerem autenticação Bearer (JWT).

---

## Como rodar localmente

### Pré-requisitos
- Java 21
- Maven 3.8+ (ou usar o `mvnw` incluso)
- Conta no [Supabase](https://supabase.com) com projeto criado

### 1. Configurar variáveis de ambiente

Copie `env.example` para `.env` e preencha:

```env
# Session Pooler do Supabase (IPv4) — obtenha em:
# Project Settings > Database > Connect > Session pooler
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.<project_ref>
DB_PASSWORD=sua_senha

SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
SERVER_PORT=8080
```

### 2. Rodar o backend

```bash
./mvnw spring-boot:run
```

### 3. Rodar o frontend

```bash
cd src/frontend
npm install
npm run dev
```

---

## Migrations (Flyway)

As migrations ficam em `src/main/resources/db/migration/`. O Flyway as aplica automaticamente na inicialização.

---

## Segurança

- Endpoints GET públicos; POST/PUT/DELETE exigem JWT
- BCrypt para hash de senhas
- Sessão stateless (JWT)
- Validação de entrada em todos os endpoints
- `.env` nunca comitado

---

## Deploy

A aplicação está configurada para deploy no **Render** via `render.yaml` (backend) e banco via **Supabase**. O frontend pode ser hospedado no **Vercel** ou **Render Static Site**.

```bash
# Build da imagem Docker
./mvnw spring-boot:build-image

# Ou compilar o JAR
./mvnw clean package
java -jar target/Calamity-0.0.1-SNAPSHOT.jar
```

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagrama de camadas e decisões arquiteturais |
| [docs/SECURITY_IMPLEMENTATION.md](docs/SECURITY_IMPLEMENTATION.md) | Detalhes da configuração de segurança |
| [docs/POSTMAN_GUIDE.md](docs/POSTMAN_GUIDE.md) | Como usar a coleção Postman |
| [docs/WEAPONS_GUIDE.md](docs/WEAPONS_GUIDE.md) | Guia dos atributos de armas |
| [docs/FRONTEND_SETUP.md](docs/FRONTEND_SETUP.md) | Setup do frontend em detalhe |
| [docs/FIX_POSTMAN_ERROR.md](docs/FIX_POSTMAN_ERROR.md) | Solução de erros comuns no Postman |
| [docs/FIX_SCHEMA_VALIDATION_ERROR.md](docs/FIX_SCHEMA_VALIDATION_ERROR.md) | Solução de erros de schema Flyway |

---

## Roadmap

- [ ] Login/Register com JWT completo
- [ ] Roles (ADMIN, USER)
- [ ] Endpoints para Bosses, Items, Players, Inventory
- [ ] Swagger / OpenAPI
- [ ] Testes de integração expandidos
- [ ] Rate limiting

---

## Licença

MIT — veja [LICENSE](LICENSE).
