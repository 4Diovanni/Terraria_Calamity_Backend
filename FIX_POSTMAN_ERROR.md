# 🔧 Solução: Erro "Invalid character found in method name" no Postman

## ❌ O Erro

```
java.lang.IllegalArgumentException: Invalid character found in method name [0x16 0x03...]
HTTP method names must be tokens
```

## 🔍 O que Significa

O Postman está enviando uma requisição **malformada ou com encoding incorreto**. Caracteres binários/inválidos no cabeçalho HTTP.

---

## ✅ Soluções (Do Mais Simples ao Mais Complexo)

### **SOLÇÃO 1: Limpar Cache do Postman (90% eficaz)**

**Windows:**
1. Feche o Postman completamente
2. Navegue para: `C:\Users\{seu-usuario}\AppData\Roaming\Postman`
3. Delete a pasta inteira
4. Reabra o Postman
5. Ele vai criar nova pasta limpa

**Mac:**
```bash
rm -rf ~/Library/Application\ Support/Postman
# Reabra o Postman
```

**Linux:**
```bash
rm -rf ~/.config/Postman
# Reabra o Postman
```

---

### **SOLÇÃO 2: Criar Requisição do Zero**

1. **Abra Postman**
2. **Clique em: + (New)**
3. **Selecione: HTTP Request**
4. **Preencha:**
   - **Method:** `GET` (dropdown)
   - **URL:** `http://localhost:8080/api/weapons`
   - **Headers:** (deixe em branco)
5. **Clique em Send**

✅ **Não importar coleções antigas ou duplicadas**

---

### **SOLÇÃO 3: Teste com cURL (Alternativa)**

Abra o terminal/prompt e execute:

```bash
# Teste simples
curl -X GET http://localhost:8080/api/weapons

# Com output formatado
curl -X GET http://localhost:8080/api/weapons | jq
```

Se funcionar com cURL, o problema é definitivamente do Postman.

---

### **SOLÇÃO 4: Verificar Versão do Postman**

1. **Postman → Settings**
2. **About**
3. Se versão < 10.0, **atualize**

```
Versão recomendada: 10.x ou 11.x
```

---

### **SOLÇÃO 5: Resetar Completamente**

Se nada funcionou:

**Windows:**
```bash
# Desinstale
Add/Remove Programs → Postman → Uninstall

# Delete resquícios
rd /s "%APPDATA%\Postman"

# Reinstale
# Download de: https://www.postman.com/downloads/
```

---

## 🛪 Teste de Conectividade

Verifique se a API está rodando:

```bash
# Terminal/Prompt
curl http://localhost:8080/api/weapons -v
```

Você deve ver:
```
< HTTP/1.1 200
< Content-Type: application/json
```

Se ver erro de conexão, a API não está rodando. Execute:

```bash
./mvnw spring-boot:run
```

---

## ✨ Fluxo de Requisição Correto

### **GET (Sem Autenticação - PÚBLICO)**

```
Método: GET
URL: http://localhost:8080/api/weapons
Headers: (nenhum obrigatório)
Body: vazio

↓ RESPOSTA:
200 OK
[]
```

### **POST (Protegido - Requer Autenticação)**

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

↓ RESPOSTA (sem auth):
401 Unauthorized
```

---

## 🚨 Se o Erro Persistir

**Possibilidades:**

1. **API não está rodando**
   ```bash
   ./mvnw spring-boot:run
   # Veja se aparecer "Started TerrariaCalamityApplication"
   ```

2. **Porta errada**
   - Verifique se a porta é 8080
   - No Postman, URL deve ser: `http://localhost:8080/api/weapons`

3. **Firewall bloqueando**
   - Tente: `http://127.0.0.1:8080/api/weapons`
   - Se não funcionar, pode ser firewall

4. **Connection refused**
   - Significa API não está escutando
   - Reinicie: `./mvnw clean spring-boot:run`

---

## 📱 Alternativas ao Postman

Se quiser evitar problemas:

### **Thunder Client (VS Code)**
```
Extensão super leve para VS Code
Sem cache, sem problemas
```

### **REST Client (VS Code)**
```
Arquivo .rest ou .http
Muito simples
```

### **Insomnia**
```
Alternativa ao Postman
Bem limpa
```

### **cURL (Terminal)**
```bash
# Mais rápido e confiável
curl -X GET http://localhost:8080/api/weapons
```

---

## ✅ Checklist de Debug

- [ ] API rodando? (`./mvnw spring-boot:run`)
- [ ] Terminal mostra "Started TerrariaCalamityApplication"?
- [ ] Porta correta? (8080)
- [ ] cURL funciona? (`curl http://localhost:8080/api/weapons`)
- [ ] Postman cache limpo?
- [ ] Requisição criada do zero (não importada)?
- [ ] URL correta? (http://localhost:8080/api/weapons)
- [ ] Método correto? (GET)

---

**Se nada funcionar, tente cURL primeiro para isolar o problema!** 🎯
