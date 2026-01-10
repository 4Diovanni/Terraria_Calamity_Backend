# 📦 Coleção Postman - Terraria Calamity API

## 🚀 Como Importar a Coleção

### 1️⃣ **Faça Download do Arquivo**
- Arquivo: `postman/terraria-api.json`
- Clique em "Raw" e copie o link
- Ou faça download direto do GitHub

### 2️⃣ **Abra o Postman**
- Abra a aplicação Postman
- Clique em **File** → **Import** (ou use `Ctrl + O`)

### 3️⃣ **Importe o JSON**
- Opção 1: **Upload Files** → Selecione o arquivo `terraria-api.json`
- Opção 2: **Link** → Cole a URL do arquivo bruto
- Aguarde a importação completar

### 4️⃣ **Verifique a Importação**
- A coleção aparecerá como **"Terraria Calamity API"**
- Você verá 4 pastas organizadas

---

## 📋 Estrutura da Coleção

```
Terraria Calamity API
├── 🔫 Weapons (8 requisições)
│   ├── GET - Listar todas as armas ✅
│   ├── GET - Arma por ID ✅
│   ├── GET - Armas por ELEMENTO ✅
│   ├── GET - Armas por CLASSE ✅
│   ├── GET - Armas por RARIDADE ✅
│   ├── GET - Buscar por NOME ✅
│   ├── POST - Criar arma ⏳ (Requer JWT)
│   ├── PUT - Atualizar arma ⏳ (Requer JWT)
│   └── DELETE - Deletar arma ⏳ (Requer JWT)
│
├── 🌡️ Elements (1 requisição)
│   └── GET - Listar elementos ⏳ (A implementar)
│
├── 👤 Auth (2 requisições)
│   ├── POST - Login ⏳ (A implementar)
│   └── POST - Register ⏳ (A implementar)
│
└── ❤️ Health (1 requisição)
    └── GET - Health Check ✅
```

✅ = Funciona agora
⏳ = Será implementado

---

## 🔧 Configuração de Variáveis

A coleção usa **2 variáveis**:

### `base_url`
- **Padrão:** `http://localhost:8080`
- **Modificar em:** Collections → Terraria Calamity API → Variables

### `jwt_token`
- **Padrão:** (vazio)
- **Será usado para:** Autenticação em POST/PUT/DELETE

---

## ✅ Endpoints Funcionando AGORA

### 1️⃣ Health Check
```bash
GET http://localhost:8080/actuator/health
```
**Resposta esperada (200 OK):**
```json
{
  "status": "UP"
}
```

### 2️⃣ Listar Todas as Armas
```bash
GET http://localhost:8080/api/v1/weapons
```
**Resposta esperada (200 OK):** Array de armas

### 3️⃣ Buscar Arma por ID
```bash
GET http://localhost:8080/api/v1/weapons/1
```
**Resposta esperada (200 OK):** Objeto da arma com id=1

### 4️⃣ Filtrar por Elemento
```bash
GET http://localhost:8080/api/v1/weapons/element/FIRE
```
**Elementos:** FIRE, ICE, LIGHTNING, HOLY, NEUTRAL

### 5️⃣ Filtrar por Classe
```bash
GET http://localhost:8080/api/v1/weapons/class/MELEE
```
**Classes:** MELEE, RANGED, MAGE, SUMMON, ROGUE

### 6️⃣ Filtrar por Raridade
```bash
GET http://localhost:8080/api/v1/weapons/rarity/5
```
**Raridades:** 1-17

### 7️⃣ Buscar por Nome
```bash
GET http://localhost:8080/api/v1/weapons/search?name=sword
```
**Busca parcial, case-insensitive**

---

## 🚨 Endpoints Protegidos (Requerem JWT)

Estes endpoints estão configurados mas retornarão `401 Unauthorized` até implementarmos JWT.

### ❌ POST - Criar Arma
```bash
POST http://localhost:8080/api/v1/weapons
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "name": "Nova Arma",
  "weaponClass": "MELEE",
  "element": "FIRE",
  "baseDamage": 50,
  "criticalChance": 5,
  "attacksPerTurn": 1.5,
  "range": 50,
  "rarity": 3,
  "price": 1000,
  "quality": 5,
  "abilities": "Ataque com fogo",
  "description": "Uma arma de teste",
  "imageUrl": "https://example.com/weapon.png"
}
```

### ❌ PUT - Atualizar Arma
```bash
PUT http://localhost:8080/api/v1/weapons/1
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

### ❌ DELETE - Deletar Arma
```bash
DELETE http://localhost:8080/api/v1/weapons/1
Authorization: Bearer {{jwt_token}}
```

---

## 💡 Dicas Importantes

### 1️⃣ **Alterar Base URL**
Se sua API está em outro lugar:
- Collections → Terraria Calamity API → Variables
- Altere `base_url` para:
  - `http://192.168.1.100:8080` (outro PC)
  - `https://api.example.com` (produção)

### 2️⃣ **Salvar Respostas**
- Após fazer uma requisição, clique em **Examples**
- Postman salva automaticamente
- Use como referência para o frontend

### 3️⃣ **Testar Múltiplas Requisições**
- Pressione `Ctrl + Shift + P` para abrir o "Runner"
- Execute toda a coleção de uma vez
- Perfeito para testes automatizados

---

## 📊 Fluxo de Teste Recomendado

```
1. ❤️ Health Check
   ↓
2. 🔫 GET - Listar todas as armas
   ↓
3. 🔫 GET - Arma por ID
   ↓
4. 🔫 GET - Filtrar por Elemento
   ↓
5. 🔫 GET - Filtrar por Classe
   ↓
6. 🔫 GET - Filtrar por Raridade
   ↓
7. 🔫 GET - Buscar por Nome
   ↓
8. (Depois de implementar JWT)
   👤 POST - Login
   ↓
9. 🔫 POST - Criar arma
   ↓
10. 🔫 PUT - Atualizar arma
    ↓
11. 🔫 DELETE - Deletar arma
```

---

## 🔐 Próximo Passo: JWT Authentication

Quando implementar JWT, será assim:

### 1️⃣ Login para obter Token
```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

### 2️⃣ Copiar o Token
- Selecione o valor de `token`
- Copie

### 3️⃣ Usar em Requisições Protegidas
- Vá para POST/PUT/DELETE
- Aba **Headers**
- Adicione:
  ```
  Authorization: Bearer {{jwt_token}}
  ```

### 4️⃣ Automação (Opcional)
No Postman, aba **Tests** da requisição de login:
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("jwt_token", jsonData.token);
```

---

## 📝 Validações de Dados

Quando criar/atualizar armas:

| Campo | Validação |
|-------|-----------|  
| `name` | Obrigatório, não pode ser vazio |
| `weaponClass` | Obrigatório (MELEE, RANGED, MAGE, SUMMON, ROGUE) |
| `element` | Obrigatório (FIRE, ICE, LIGHTNING, HOLY, NEUTRAL) |
| `baseDamage` | Obrigatório, mínimo 1 |
| `criticalChance` | 1-20% |
| `attacksPerTurn` | Mínimo 1 |
| `rarity` | -1 até 17 |
| `quality` | 0-10 |

---

## 🎓 Próximos Passos

### Backend
- [ ] Implementar JWT Authentication
- [ ] Criar endpoints de Login/Register
- [ ] Adicionar Role-Based Access Control (RBAC)
- [ ] Implementar validações mais robustas

### Frontend (React)
- [ ] Criar componentes para listar armas
- [ ] Implementar filtros (elemento, classe, raridade)
- [ ] Criar formulário para adicionar armas
- [ ] Integrar com a API
- [ ] Implementar autenticação no frontend

---

## ✨ Resumo

✅ **API funcionando com 7 endpoints públicos**
✅ **Coleção Postman pronta para testes**
✅ **Segurança configurada corretamente**
✅ **Estrutura pronta para frontend**

🚀 **Próximo passo: Desenvolver o Frontend React!**

---

## 📞 Troubleshooting

### "Erro ao importar a coleção"
- Certifique-se que o arquivo está em formato JSON válido
- Tente importar via link direto do GitHub

### "401 Unauthorized em requisições POST/PUT/DELETE"
- Esperado! JWT não foi implementado ainda
- Endpoints GET funcionam normalmente

### "Conexão recusada (localhost:8080)"
- A API não está rodando
- Execute: `mvn spring-boot:run`
- Verifique se está na porta 8080

### "404 Not Found"
- Caminho da URL incorreto
- Verifique se está usando `/api/v1/weapons`
- Não use apenas `/weapons`

---

**Documentação completa e pronta para o desenvolvimento! 🎉**
