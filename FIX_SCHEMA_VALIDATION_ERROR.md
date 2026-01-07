# 🔧 Solução: Schema Validation Error - Wrong Column Type

## ❌ O Erro

```
Schema-validation: wrong column type encountered in column [id] in table [weapons]; 
found [serial (Types#INTEGER)], but expecting [bigint (Types#BIGINT)]
```

**O que significa:** A tabela `weapons` no banco tem `id` como `SERIAL` (INTEGER/32-bit), mas o Hibernate espera `BIGSERIAL` (BIGINT/64-bit).

---

## ✅ Status Atual (RESOLVIDO!)

Este erro **JA FOI CORRIGIDO** na migração V1:

```sql
CREATE TABLE IF NOT EXISTS weapons (
    id BIGSERIAL PRIMARY KEY,  ✅ CORRETO (64-bit)
    ...
);
```

---

## ✅ Se Precisar Resetar o Banco

Se ainda tiver esse erro (banco antigo):

### **OPCÃO 1: Resetar no Supabase (Mais Rápido)**

1. **Abra o Supabase Dashboard**
2. **SQL Editor**
3. **Execute:**
   ```sql
   DROP TABLE IF EXISTS weapons CASCADE;
   DELETE FROM flyway_schema_history WHERE version = 1;
   ```

4. **Execute a aplicação:**
   ```bash
   ./mvnw clean spring-boot:run
   ```

5. **Flyway vai recriar tudo CORRETO!**

---

### **OPCÃO 2: Usar Migration V2 (Se tem dados importantes)**

Já está resolvido na V1, não precisa.

---

## 🛠 Por Que Isso Aconteceu?

Migrações antigas podem ter usado `SERIAL` (INTEGER - 32 bits):
```sql
CREATE TABLE weapons (
    id SERIAL PRIMARY KEY,  ❌ INTEGER (32-bit)
    ...
)
```

Mas o Hibernate JPA espera `BIGSERIAL` (BIGINT - 64 bits):
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;  // ← Long = 64-bit = BIGINT
```

---

## 📋 Arquivos Envolvidos

```
src/main/resources/db/migration/
└── V1__Create_weapons_table.sql  ✅ CORRETO (BIGSERIAL)
```

---

## 📚 Dica Para o Futuro

Ao criar novas migrations, **SEMPRE use BIGSERIAL**:

```sql
✅ CORRETO:
CREATE TABLE entities (
    id BIGSERIAL PRIMARY KEY,
    ...
);

❌ ERRADO:
CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    ...
);
```

---

## ✅ Checklist

- [ ] V1 migration usa BIGSERIAL? (✅ SIM)
- [ ] Erro ainda aparece? Tente resetar banco
- [ ] API inicia normalmente? Pronto para usar!

---

**Erro resolvido!** 🌟
