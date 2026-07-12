---
tags: [docs, backend, security]
aliases: [Segurança, SECURITY_IMPLEMENTATION]
up: "[[INDEX]]"
related:
  - "[[Auth]]"
  - "[[Backend-MOC]]"
status: ativo
---

# 🔐 Guia: Public vs Protected Endpoints com Spring Security

> Ver também: [[Auth]] (nota-índice dos arquivos de autenticação) · [[Backend-MOC]]

## 📋 Estrutura de Segurança Implementada

```
GET    /api/weapons       → PUBLIC (qualquer um pode ver) ✅
GET    /api/weapons/{id}  → PUBLIC (qualquer um pode ver detalhes) ✅
POST   /api/weapons       → PROTECTED (apenas admin) 🔐
PUT    /api/weapons/{id}  → PROTECTED (apenas admin) 🔐
DELETE /api/weapons/{id}  → PROTECTED (apenas admin) 🔐
```

---

## ✅ O que Foi Implementado

### 1️⃣ Spring Security Adicionado
- ✅ `spring-boot-starter-security` no pom.xml
- ✅ `spring-security-test` para testes

### 2️⃣ SecurityConfig Criada
- ✅ Classe de configuração em: `src/main/java/com/terraria/calamity/config/SecurityConfig.java`
- ✅ GET endpoints públicos (sem autenticação)
- ✅ POST/PUT/DELETE endpoints protegidos
- ✅ BCrypt para encoding de senhas
- ✅ Sessão stateless (preparado para JWT)

### 3️⃣ Endpoints Públicos
```bash
# Funciona SEM autenticação:
GET http://localhost:8080/api/weapons
GET http://localhost:8080/api/weapons/1
```

### 4️⃣ Endpoints Protegidos
```bash
# Vai retornar 401 Unauthorized (quando tentar criar/editar/deletar)
POST http://localhost:8080/api/weapons
PUT http://localhost:8080/api/weapons/1
DELETE http://localhost:8080/api/weapons/1
```

---

## 🧪 Testando no Postman

### **GET (PUBLIC) - ✅ Funciona**

```
Método: GET
URL: http://localhost:8080/api/weapons
Headers: (nenhum)
Body: vazio
```

**Resposta Esperada:**
```json
200 OK
[]
```

---

### **POST (PROTECTED) - 🔐 Requer Auth**

```
Método: POST
URL: http://localhost:8080/api/weapons
Headers:
  - Content-Type: application/json
Body:
{
  "name": "Excalibur",
  "weaponClass": "MELEE",
  "element": "NEUTRAL",
  "baseDamage": 100,
  "criticalChance": 5,
  "attacksPerTurn": 1.0,
  "range": 50,
  "rarity": 5,
  "price": 1000,
  "quality": 8
}
```

**Resposta Esperada (sem autenticação):**
```json
401 Unauthorized
{
  "timestamp": "2026-01-07T22:18:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required"
}
```

---

## 🔐 Próximos Passos

A segurança está implementada, mas você ainda precisa:

### 1. Criar Endpoints de Autenticação
```java
@PostMapping("/auth/login")
@PermitAll
public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
    // Validar credenciais
    // Gerar JWT token
    // Retornar token
}
```

### 2. Implementar JWT Token
- Gerar token após login
- Validar token em requisições protegidas
- Usar `Authorization: Bearer {token}` header

### 3. Adicionar Usuários e Roles
- Criar tabela `users`
- Criar tabela `roles` (ADMIN, USER, etc)
- Associar usuários com roles

---

## 🎯 Estado Atual

| Funcionalidade | Status | Notas |
|---|---|---|
| GET endpoints públicos | ✅ Funcionando | Qualquer um pode listar armas |
| POST/PUT/DELETE protegidos | ✅ Funcionando | Retorna 401 sem auth |
| BCrypt password encoding | ✅ Configurado | Pronto para login |
| JWT Token | ❌ Não implementado | Próximo passo |
| Login endpoint | ❌ Não implementado | Próximo passo |
| User management | ❌ Não implementado | Próximo passo |

---

## 💡 Detalhes Técnicos

### SecurityConfig

```java
// Endpoints públicos
.requestMatchers("GET", "/api/weapons").permitAll()
.requestMatchers("GET", "/api/weapons/**").permitAll()

// Endpoints protegidos
.requestMatchers("POST", "/api/weapons").authenticated()
.requestMatchers("PUT", "/api/weapons/**").authenticated()
.requestMatchers("DELETE", "/api/weapons/**").authenticated()
```

### PasswordEncoder

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Usado para:
- Hash de senhas ao registrar
- Verificação de senhas ao fazer login

---

## 🚀 Como Funciona

1. **Requisição GET**
   ```
   GET /api/weapons
   → SecurityConfig permite
   → Controller processa
   → Retorna 200 OK
   ```

2. **Requisição POST (sem token)**
   ```
   POST /api/weapons
   → SecurityConfig bloqueia
   → Retorna 401 Unauthorized
   ```

3. **Requisição POST (com token - futuro)**
   ```
   POST /api/weapons
   Authorization: Bearer {token}
   → Token validado
   → Controller processa
   → Retorna 201 Created
   ```

---

## 📚 Arquivos Envolvidos

```
src/main/java/com/terraria/calamity/
├── config/
│   └── SecurityConfig.java          ← Nova! Configuração de segurança
└── api/
    └── controller/
        └── WeaponController.java    ← Já existente, agora protegido
```

---

## ✨ Resumo

✅ Spring Security integrado
✅ GET endpoints públicos
✅ POST/PUT/DELETE protegidos
✅ BCrypt configurado
✅ Pronto para autenticação JWT

**Próxima fase:** Implementar login e JWT tokens! 🎮
