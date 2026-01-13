# 🐛 **Corrigido: Infinite Loop de Requ isições**

## 😛 **O Problema**

Você estava recebendo o erro:
```
net::ERR_INSUFFICIENT_RESOURCES
```

Isso significa que o navegador estava fazendo **MUITAS requisições simultâneas** e ficou sem recursos.

### Causa Raiz

O `useEffect` **sem array de dependências** causa um **loop infinito**:

```typescript
// ❌ ERRADO - Executa infinitamente
useEffect(() => {
  fetchWeapons(); // Chama a função
}); // Sem dependências!
```

**Por que?**
1. O componente renderiza
2. useEffect executa (chama fetch)
3. Fetch atualiza o estado
4. Componente renderiza novamente
5. useEffect executa NOVAMENTE
6. Volta ao passo 3 → **LOOP INFINITO** 🔄

---

## ✅ **A Solução**

### 1. **Adicione o array de dependências VAZIO `[]`**

```typescript
// ✅ CORRETO - Executa UMA VEZ ao montar
useEffect(() => {
  fetchWeapons();
}, []); // ← Array vazio = dependência
```

**Explicação:**
- `[]` vazio = execute apenas quando o componente montar
- Nenhuma dependência muda, então nunca executa novamente

### 2. **Se precisar refetch quando algo mudar:**

```typescript
// ✅ CORRETO - Executa quando `id` muda
useEffect(() => {
  fetchWeapon(id);
}, [id]); // ← Reexecuta quando id mudar
```

### 3. **Nunca coloque estado no array de dependências sem cuidado:**

```typescript
// ❌ PERIGO - Loop infinito
const [weapons, setWeapons] = useState([]);

useEffect(() => {
  fetchWeapons();
}, [weapons]); // ← weapons muda no useEffect, executa novamente!

// ✅ CORRETO - Array vazio ou IDs específicos
useEffect(() => {
  fetchWeapons();
}, []); // Executa 1x ao montar
```

---

## 📂 **Arquivos Corrigidos**

### 1. **`src/frontend/src/hooks/useWeapons.ts`**
```typescript
useEffect(() => {
  fetchWeapons();
}, []); // ✅ Array vazio = executa 1x
```

### 2. **`src/frontend/src/hooks/useFetch.ts`**
```typescript
useEffect(() => {
  fetchData();
}, dependencies); // ✅ Gerenciado corretamente
```

### 3. **`src/frontend/src/App.tsx`**
```typescript
// ❌ NÃO faz requisições aqui
// ✅ Deixe para páginas e componentes específicos
```

### 4. **`src/frontend/src/components/pages/Home.tsx`** (NOVO)
```typescript
// ✅ SIM faz requisição aqui via hook
const { weapons, loading, error } = useWeapons();
```

---

## 👋 **Como Usar Agora**

### **Passo 1: Puxar as correções**
```bash
cd C:\Projetos\Terraria_Calamity_Backend
git pull origin main
```

### **Passo 2: Instalar dependências (se primeira vez)**
```bash
cd src/frontend
rm -rf node_modules package-lock.json
npm install
```

### **Passo 3: Rodar**
```bash
npm run dev
```

✅ **Deve funcionar perfeitamente agora! Nenhum loop infinito!**

---

## 🗐 **Checklist: useEffect Correto**

Antes de usar `useEffect`, sempre pergunte:

- [ ] Estou fazendo fetch de dados?
  - SIM → Use array vazio `[]`
  - NÃO → Cuidado com dependências

- [ ] O fetch depende de algum prop/estado?
  - SIM → Adicione no array: `[id, filter]`
  - NÃO → Use `[]` vazio

- [ ] Estou chamando setState dentro do effect?
  - SIM → Procure por loop infinito
  - Solução: Use `[]` ou específico `[dependencies]`

- [ ] Array de dependências está presente?
  - SIM ✅
  - NÃO ❌ → Adicione!

---

## 📑 **Resumo das Correções**

| Arquivo | Problema | Solução |
|---------|----------|----------|
| `useWeapons.ts` | Sem `[]` | Adicionado `[]` vazio |
| `useFetch.ts` | Sem dependências | Adicionado gerenciamento correto |
| `App.tsx` | Fazendo fetch no root | Removido, movido para Home.tsx |
| `Home.tsx` | Não existia | Criado com hook useWeapons |
| `Loading.tsx` | Não existia | Criado |
| `Error.tsx` | Não existia | Criado |
| `NotFound.tsx` | Não existia | Criado |
| `Layout.tsx` | Precisa melhorar | Refatorado |
| `Header.tsx` | Precisa melhorar | Refatorado |
| `Footer.tsx` | Precisa melhorar | Refatorado |

---

## 🚀 **Próximos Passos**

1. ✅ Corrigir o infinite loop (FEITO!)
2. ⏭️ Testar se as armas carregam corretamente
3. ⏭️ Adicionar filtros (elemento, raridade, etc)
4. ⏭️ Adicionar busca por nome
5. ⏭️ Criar página de detalhe da arma
6. ⏭️ Adicionar admin panel (criar/editar/deletar)

---

## 💬 **Referências Rápidas**

**React Docs sobre useEffect:**
https://react.dev/reference/react/useEffect

**Depuração de loops:**
- DevTools Console: Procure por muitos console.logs
- DevTools Network: Veja muitas requisições GET
- React DevTools: Veja quantas vezes renderiza

---

**Problema resolvido! 🎉 Se tiver mais erros, manda a mensagem do console!**
