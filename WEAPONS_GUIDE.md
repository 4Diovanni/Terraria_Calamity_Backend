# ⚔️ Guia Completo de Armas: Terraria + Calamity Mod

## 📊 Visão Geral

Este documento detalha todas as **60+ armas** inseridas na migration `V2__Insert_weapons_seed.sql`, provenientes de:
- **Terraria Vanilla** (Jogo base)
- **Terraria Calamity Mod** (Mod popular)

---

## 🎮 Classes de Armas

### 1. **MELEE** (Combate Corpo-a-corpo)
- Sem consumo de recursos
- Maior defesa
- Curto alcance (40-100 tiles)
- **Exemplos:** Night's Edge, Excalibur, Ark of the Cosmos

### 2. **RANGED** (À Distância)
- Requer muni ção (flechas, balas)
- Alcance médio-longo (200-350 tiles)
- Cad ência variável
- **Exemplos:** Minishark, Megashark, Onyx Blaster

### 3. **MAGIC** (Mágicas)
- Requer consumo de Mana
- Efeitos especiais (homing, splash, etc)
- Versáteis e poderosas
- **Exemplos:** Meteor Staff, Crystal Storm, Nebula Blaze

### 4. **SUMMON** (Invocação)
- Conjura minions para atacar
- Funcionamento automático
- Escalável com "minion slots"
- **Exemplos:** Slime Staff, Imp Staff, Endo Hydra Staff

### 5. **ROGUE** (Ladino - Exclusivo Calamity)
- Armas de arremesso (facas, shuriken, etc)
- Cad ência alta
- Críticos elevados
- **Exemplos:** Rusty Knives, Lionfish, Seraph Tracers

---

## 🗺️ Estrutura de Progressão

### **Pré-Hardmode (Início do Jogo)**

| Arma | Classe | Dano | Raridade | Nota |
|------|--------|------|----------|------|
| Wooden Sword | MELEE | 5 | -1 | Inicial |
| Copper Shortsword | MELEE | 6 | 0 | Primeira craft |
| Enchanted Sword | MELEE | 13 | 2 | Encontrado em cofres |
| Night's Edge | MELEE | 35 | 4 | Boss final pré-hardmode |
| Wulfrum Blade | MELEE | 12 | 0 | Calamity início |
| Blood Butcherer | MELEE | 28 | 3 | Pós-Eater/Brain |

### **Hardmode (Meio do Jogo)**

| Arma | Classe | Dano | Raridade | Progresso |
|------|--------|------|----------|----------|
| Excalibur | MELEE | 44 | 5 | Pós-Skeletron Prime |
| True Excalibur | MELEE | 58 | 7 | Hardmode crafted |
| Terra Blade | MELEE | 65 | 8 | Pós-Plantera |
| Megashark | RANGED | 25 | 5 | Dano por cadência |
| Crystal Storm | MAGIC | 45 | 5 | Proj étil homing |
| Contagion | MAGIC | 85 | 7 | Pós-Brimstone |
| Endo Hydra Staff | SUMMON | 80 | 7 | Summoner hardmode |

### **Late-Game / Final (Fim do Jogo)**

| Arma | Classe | Dano | Raridade | Status |
|------|--------|------|----------|--------|
| Ark of the Ancients | MELEE | 80 | 6 | Calamity avan çado |
| Ark of the Cosmos | MELEE | 300 | 10 | Calamity final ✨ |
| Soma Prime | RANGED | 95 | 8 | Pós-Yharon |
| Shrine of the Cosmos | MAGIC | 220 | 10 | Magic final ✨ |
| Temporal Umbrella | SUMMON | 193 | 9 | Summoner late |
| Seraph Tracers | ROGUE | 110 | 8 | Rogue avan çado |
| Murasama | ROGUE | 180 | 10 | Rogue final ✨ |
| Zenith | MELEE | 200 | 11 | Terraria suprema ✨ |

---

## 📈 Estatísticas Explicadas

### **base_damage** (Dano Base)
- Quanto dano a arma causa por golpe
- Escala: 5 (fraco) → 300 (supremo)
- Afetado por modificadores (Prefix)

### **critical_chance** (Chance de Crítico)**
- Porcentagem de golpe crítico (multiplicador 2x)
- Range: 4% → 15%
- Algumas armas ignoram critérios (minions)

### **attacks_per_turn** (Ataques por Segundo)
- Velocidade de ataque
- Melee típico: 1.0-3.0
- Minishark: 8.0 (altíssima cadência)

### **range** (Alcance em Tiles)
- Distância efetiva da arma
- Melee: 40-100 tiles
- Ranged: 150-350 tiles
- Magic: 150-300 tiles

### **rarity** (Raridade)
- Sistema de cores: -1 (gray) → 11 (rainbow)
- Indica valor/dificuldade de obtenção
- -1: Normal, 0-4: Comum, 5-8: Raro, 9+: Lendário

### **quality** (Qualidade 0-10)
- Classificação subjetiva
- 1-2: Comum, 3-4: Bom, 5-6: Muito Bom, 7-8: Excelente, 9-10: Supremo

---

## 🎯 Recomendações por Fase

### **Fase 1: Eye of Cthulhu**
```
✅ Wooden Sword ou Copper Shortsword
✅ Wooden Bow + Flechas
✅ Wooden Wand + Mana
❌ NÃO use armas hardmode
```

### **Fase 2: Terraria Vanilla Hardmode (Mech Bosses)**
```
✅ Excalibur (Melee) - Pós-Skeletron Prime
✅ Megashark (Ranged) - Alto DPS
✅ Crystal Storm (Magic) - Homing
✅ Blade Staff (Summon) - Minions rápidos
❌ Equipamento pré-hardmode obsoleto
```

### **Fase 3: Calamity Early Bosses (Desert Scourge ~ Crabulon)**
```
✅ Wulfrum Blade (Melee)
✅ Boomstick (Ranged)
✅ Revolver (Ranged alternativo)
❌ Armas vanilla iniciais fracas demais
```

### **Fase 4: Calamity Mid-Game (Eater/Brain ~ Brimstone)**
```
✅ Ark of the Ancients (Melee)
✅ Onyx Blaster (Ranged)
✅ Contagion (Magic - Venenoso)
✅ Endo Hydra Staff (Summon)
✅ Lionfish (Rogue)
⚠️  Prepare armadura e acessórios
```

### **Fase 5: Calamity Late (Yharon, Supreme Calamitas)**
```
✅ Ark of the Cosmos (Melee)
✅ Soma Prime (Ranged)
✅ Shrine of the Cosmos (Magic)
✅ Temporal Umbrella (Summon)
✅ Murasama ou Seraph Tracers (Rogue)
⚠️  Dano acima de 100+
⚠️  Crit chance 10%+
```

---

## 🔧 Como Usar no Backend

### **GET todas as armas**
```bash
curl http://localhost:8080/api/weapons
```

**Resposta:**
```json
200 OK
[
  {
    "id": 1,
    "name": "Wooden Sword",
    "weaponClass": "MELEE",
    "element": "NEUTRAL",
    "baseDamage": 5,
    "criticalChance": 4,
    "attacksPerTurn": 1.8,
    "range": 40,
    "rarity": -1,
    "price": 5,
    "quality": 1,
    "abilities": "Espada inicial de madeira",
    "description": "A arma iniciante mais básica. Pouca utilidade além dos primeiros minutos.",
    "imageUrl": "https://terraria.wiki.gg/..."
  },
  ...
]
```

### **GET arma específica (ID)**
```bash
curl http://localhost:8080/api/weapons/10
```

### **Filtros Futuros (a implementar)**
```bash
# Por classe
/api/weapons?weaponClass=MELEE

# Por raridade
/api/weapons?rarity=5

# Por dano mínimo
/api/weapons?baseDamage=50

# Por elemento
/api/weapons?element=FIRE
```

---

## 📚 Referências

- [Terraria Wiki Official](https://terraria.wiki.gg/)
- [Calamity Mod Wiki](https://calamitymod.wiki.gg/)
- [Terraria Class Guide](https://terraria.wiki.gg/wiki/Guide:Class_setups)
- [Calamity Boss Progression](https://calamitymod.wiki.gg/wiki/Boss_progression)

---

## 🎨 Elementos Especiais

### **NEUTRAL** (Sem Elemento)
- Dano genérico
- Sem efeitos especiais
- Exemplo: Copper Shortsword

### **FIRE** 🔥 (Fogo)
- Causa queimadura
- Dano contínuo
- Exemplo: Meteor Staff

### **SHADOW** 🌑 (Sombra)
- Dano obscuro/corrompido
- Efeitos sombrios
- Exemplo: Blood Butcherer

### **HOLY** ✨ (Sagrado)
- Dano radiante/divino
- Contra inimigos sombrios
- Exemplo: Excalibur

### **ELEMENTAL** ⚡ (Elementar)
- Múltiplos elementos
- Efeitos variados
- Exemplo: Elemental Excalibur

### **COSMIC** 🌌 (Cósmico)
- Dano universal
- Poder supremo
- Exemplo: Ark of the Cosmos

---

## 📊 Estatísticas Gerais

```
Total de Armas: 60+
Classes: 5 (Melee, Ranged, Magic, Summon, Rogue)

Por Raridade:
  -1: 2 armas (Inicial)
   0: 3 armas (Comum)
   1-2: 8 armas (Básico)
   3-4: 15 armas (Intermediário)
   5-6: 18 armas (Avançado)
   7-8: 10 armas (Raro)
   9-10: 4 armas (Lendário)
   11+: 1 arma (Supremo)

Dano Máximo: 300 (Ark of the Cosmos)
Dano Mínimo: 5 (Wooden Sword)
Crítico Máximo: 15% (Zenith)
Alcance Máximo: 350 tiles (Ranged)
```

---

## ✅ Checklist de Teste

- [ ] Migration V2 executa sem erros
- [ ] GET /api/weapons retorna 60+ armas
- [ ] Filtro por classe funciona
- [ ] Imagens carregam corretamente
- [ ] Estatísticas respeitam CHECKs (rarity, quality, critical_chance)
- [ ] Preços escalam com raridade

---

**Última atualização:** 2026-01-08
**Versão:** 2.0 (Migration V2)
**Status:** ✅ Completo
