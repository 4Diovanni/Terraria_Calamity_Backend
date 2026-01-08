-- =====================================================================
-- V2: Inserção de Armas - Terraria + Terraria Calamity Mod
-- =====================================================================
-- Esta migration popula a tabela weapons com armas do Terraria vanilla
-- e do mod Calamity, organizadas por classe e progressão de jogo.
-- Elementos baseados em wiki.gg e calamitymod.wiki.gg
-- 
-- Nota: Os elementos agora são mapeados conforme enum Element.java
-- =====================================================================

INSERT INTO public.weapons (
    name,
    weapon_class,
    element,
    base_damage,
    critical_chance,
    attacks_per_turn,
    range,
    rarity,
    price,
    quality,
    abilities,
    description,
    image_url
) VALUES

-- =====================================================================
-- TERRARIA VANILLA - PRE-HARDMODE MELEE
-- =====================================================================
(
  'Wooden Sword',
  'MELEE',
  'NEUTRAL',
  5,
  4,
  1.8,
  40,
  -1,
  5,
  1,
  'Espada inicial de madeira',
  'A arma iniciante mais básica. Pouca utilidade além dos primeiros minutos.',
  'https://terraria.wiki.gg/images/thumb/b/bd/Wooden_Sword.png/40px-Wooden_Sword.png'
),
(
  'Copper Shortsword',
  'MELEE',
  'NEUTRAL',
  6,
  4,
  1.6,
  45,
  0,
  50,
  1,
  'Curta distância, pouco alcance',
  'Primeira arma craftável. Melhor que a espada de madeira mas ainda fraca.',
  'https://terraria.wiki.gg/images/thumb/f/f4/Copper_Shortsword.png/40px-Copper_Shortsword.png'
),
(
  'Iron Shortsword',
  'MELEE',
  'NEUTRAL',
  9,
  4,
  1.6,
  46,
  0,
  120,
  2,
  'Melhor que cobre',
  'Arma de ferro para combate básico. Upgrade significativo.',
  'https://terraria.wiki.gg/images/thumb/6/6f/Iron_Shortsword.png/40px-Iron_Shortsword.png'
),
(
  'Enchanted Sword',
  'MELEE',
  'MAGIC',
  13,
  5,
  1.4,
  50,
  2,
  800,
  3,
  'Dispara projéteis mágicos azuis',
  'Espada encantada encontrada em cofres. útil mid-game.',
  'https://terraria.wiki.gg/images/thumb/0/0a/Enchanted_Sword_%28item%29.png/40px-Enchanted_Sword_%28item%29.png'
),
(
  'Night''s Edge',
  'MELEE',
  'SHADOW',
  35,
  6,
  1.2,
  60,
  4,
  3500,
  5,
  'Combinação de 4 espadas demoníacas. Projéteis sombrios.',
  'Arma lendária craftável a partir de espadas demoníacas e do Underworld.',
  'https://terraria.wiki.gg/images/thumb/2/21/Night%27s_Edge.png/40px-Night%27s_Edge.png'
),
(
  'Arkhalis',
  'MELEE',
  'NEUTRAL',
  20,
  5,
  3.0,
  35,
  3,
  2000,
  4,
  'Ataque muito rápido e leve',
  'Espada rápida com múltiplos golpes por segundo. Excelente DPS.',
  'https://terraria.wiki.gg/images/thumb/5/51/Arkhalis.png/40px-Arkhalis.png'
),

-- =====================================================================
-- TERRARIA VANILLA - PRE-HARDMODE RANGED
-- =====================================================================
(
  'Wooden Bow',
  'RANGED',
  'NEUTRAL',
  5,
  5,
  2.5,
  200,
  -1,
  10,
  1,
  'Arco de madeira básico',
  'Primeira arma à distância. Requer flechas.',
  'https://terraria.wiki.gg/images/thumb/f/f8/Wooden_Bow.png/40px-Wooden_Bow.png'
),
(
  'Minishark',
  'RANGED',
  'NEUTRAL',
  7,
  5,
  8.0,
  300,
  2,
  3500,
  3,
  'Altíssima cadência de tiro',
  'Metralhadora compacta. Alto DPS com consumo massivo de munição.',
  'https://terraria.wiki.gg/images/thumb/d/d7/Minishark.png/40px-Minishark.png'
),
(
  'Musket',
  'RANGED',
  'NEUTRAL',
  20,
  6,
  1.8,
  280,
  2,
  800,
  3,
  'Disparo simples potente',
  'Arma de fogo tradicional. Bom dano, cadência baixa.',
  'https://terraria.wiki.gg/images/thumb/3/3f/Musket.png/40px-Musket.png'
),

-- =====================================================================
-- TERRARIA VANILLA - PRE-HARDMODE MAGIC
-- =====================================================================
(
  'Wooden Wand',
  'MAGIC',
  'NEUTRAL',
  7,
  4,
  1.5,
  150,
  -1,
  30,
  1,
  'Projéteis mágicos simples',
  'Varinha de madeira iniciante. Requer mana.',
  'https://terraria.wiki.gg/images/thumb/7/7f/Wooden_Wand.png/40px-Wooden_Wand.png'
),
(
  'Demon Scythe',
  'MAGIC',
  'SHADOW',
  35,
  7,
  1.2,
  250,
  4,
  8000,
  5,
  'Foices demoníacas que perseguem inimigos',
  'Livro demoníaco avançado. Invoca foices de energia sombria.',
  'https://terraria.wiki.gg/images/thumb/9/9f/Demon_Scythe.png/40px-Demon_Scythe.png'
),
(
  'Meteor Staff',
  'MAGIC',
  'FIRE',
  22,
  6,
  1.6,
  220,
  3,
  1500,
  4,
  'Meteoros que caem do céu',
  'Cajado que conjura meteoros em cascata. Grande área.',
  'https://terraria.wiki.gg/images/thumb/8/87/Meteor_Staff.png/40px-Meteor_Staff.png'
),

-- =====================================================================
-- TERRARIA VANILLA - PRE-HARDMODE SUMMON
-- =====================================================================
(
  'Slime Staff',
  'SUMMON',
  'NEUTRAL',
  12,
  4,
  1.0,
  150,
  3,
  9000,
  3,
  'Invoca slimes para atacar',
  'Cajado que invoca slimes como minions. Facil de obter.',
  'https://terraria.wiki.gg/images/thumb/7/7c/Slime_Staff.png/40px-Slime_Staff.png'
),
(
  'Imp Staff',
  'SUMMON',
  'FIRE',
  21,
  4,
  1.0,
  200,
  3,
  9000,
  4,
  'Invoca pequenos demônios',
  'Cajado que conjura imps que lançam bolas de fogo.',
  'https://terraria.wiki.gg/images/thumb/9/98/Imp_Staff.png/40px-Imp_Staff.png'
),

-- =====================================================================
-- TERRARIA VANILLA - HARDMODE MELEE
-- =====================================================================
(
  'Excalibur',
  'MELEE',
  'HOLY',
  44,
  8,
  1.3,
  65,
  5,
  8000,
  6,
  'Dispara beams de luz sagrados',
  'Espada lendária que dispara raios de luz. Pós-Skeletron Prime.',
  'https://terraria.wiki.gg/images/thumb/d/d5/Excalibur.png/40px-Excalibur.png'
),
(
  'True Excalibur',
  'MELEE',
  'HOLY',
  58,
  8,
  1.2,
  70,
  7,
  12000,
  7,
  'Versão melhorada super potente',
  'Excalibur crafted com True Night''s Edge. Dano extremo.',
  'https://terraria.wiki.gg/images/thumb/0/0d/True_Excalibur.png/40px-True_Excalibur.png'
),
(
  'Terra Blade',
  'MELEE',
  'HOLY',
  65,
  8,
  1.1,
  75,
  8,
  20000,
  8,
  'Projecteis Ichor em alta velocidade',
  'Espada suprema do Terraria vanilla. Combina múltiplos crafts.',
  'https://terraria.wiki.gg/images/thumb/5/54/Terra_Blade.png/40px-Terra_Blade.png'
),
(
  'Megashark',
  'RANGED',
  'NEUTRAL',
  25,
  6,
  10.0,
  350,
  5,
  25000,
  7,
  'Versão super da Minishark',
  'Metralhadora melhorada com maior cadência e dano.',
  'https://terraria.wiki.gg/images/thumb/8/8a/Megashark.png/40px-Megashark.png'
),

-- =====================================================================
-- TERRARIA VANILLA - HARDMODE MAGIC
-- =====================================================================
(
  'Crystal Storm',
  'MAGIC',
  'CRYSTAL',
  45,
  8,
  2.5,
  260,
  5,
  12000,
  6,
  'Cristais que ricocheteiam',
  'Cajado de cristal que dispara múltiplos projéteis em padrão.',
  'https://terraria.wiki.gg/images/thumb/3/35/Crystal_Storm.png/40px-Crystal_Storm.png'
),
(
  'Nebula Blaze',
  'MAGIC',
  'ASTRAL',
  90,
  12,
  1.5,
  280,
  8,
  80000,
  8,
  'Chamas nebulares que perseguem',
  'Arma final mágica pós-Moon Lord. Projéteis homing.',
  'https://terraria.wiki.gg/images/thumb/c/c0/Nebula_Blaze.png/40px-Nebula_Blaze.png'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - PRE-HARDMODE MELEE
-- =====================================================================
(
  'Wulfrum Blade',
  'MELEE',
  'NEUTRAL',
  12,
  4,
  1.5,
  45,
  0,
  200,
  2,
  'Espada de Wulfrum básica',
  'Primeira arma do Calamity. Fácil de craft.',
  'https://calamitymod.wiki.gg/wiki/Wulfrum_Blade'
),
(
  'Feller of Evergreens',
  'MELEE',
  'NATURE',
  15,
  5,
  1.4,
  50,
  1,
  500,
  2,
  'Machado que corta árvores',
  'Arma melee pré-Desert Scourge.',
  'https://calamitymod.wiki.gg/wiki/Feller_of_Evergreens'
),
(
  'Mandible Blade',
  'MELEE',
  'NEUTRAL',
  14,
  5,
  1.6,
  48,
  1,
  400,
  2,
  'Lâmina de quitina',
  'Arma obtida de insetos do Calamity.',
  'https://calamitymod.wiki.gg/wiki/Mandible_Blade'
),
(
  'Blood Butcherer',
  'MELEE',
  'BLOOD',
  28,
  6,
  1.5,
  55,
  3,
  2000,
  4,
  'Causa sangramento. Corrompida.',
  'Espada feita de carne e sangue. Pós-Eater/Brain.',
  'https://calamitymod.wiki.gg/wiki/Blood_Butcherer'
),
(
  'Ark of the Ancients',
  'MELEE',
  'ARCANE',
  80,
  8,
  1.3,
  70,
  6,
  15000,
  7,
  'Cortes arcanos enormes',
  'Espada que dispara beams. Hardmode avançado.',
  'https://calamitymod.wiki.gg/wiki/Ark_of_the_Ancients'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - PRE-HARDMODE RANGED
-- =====================================================================
(
  'Revolver',
  'RANGED',
  'NEUTRAL',
  14,
  8,
  2.5,
  180,
  1,
  800,
  2,
  'Revolver rápido com recarga',
  'Arma de fogo básica do Calamity.',
  'https://calamitymod.wiki.gg/wiki/Revolver'
),
(
  'Boomstick',
  'RANGED',
  'FIRE',
  35,
  7,
  1.8,
  220,
  3,
  3500,
  4,
  'Shotgun que explode',
  'Arma explosiva pós-Eye of Cthulhu.',
  'https://calamitymod.wiki.gg/wiki/Boomstick'
),
(
  'Onyx Blaster',
  'RANGED',
  'SHADOWFLAME',
  55,
  8,
  1.7,
  220,
  5,
  8000,
  6,
  'Projéteis sombrios que explodem',
  'Shotgun de obsidiana. Mid-hardmode ranged.',
  'https://calamitymod.wiki.gg/wiki/Onyx_Blaster'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - HARDMODE MELEE
-- =====================================================================
(
  'Calamity Blade',
  'MELEE',
  'BRIMSTONE',
  120,
  10,
  1.2,
  85,
  7,
  50000,
  8,
  'Lâmina calamitosa suprema',
  'Arma do boss Calamitas. Poder absurdo.',
  'https://calamitymod.wiki.gg/wiki/Calamity_Blade'
),
(
  'Elemental Excalibur',
  'MELEE',
  'ELEMENTAL',
  110,
  9,
  1.3,
  80,
  8,
  45000,
  8,
  'Excalibur com elementos',
  'Versão elemental pós-Yharon.',
  'https://calamitymod.wiki.gg/wiki/Elemental_Excalibur'
),
(
  'Ark of the Cosmos',
  'MELEE',
  'COSMIC',
  300,
  12,
  1.1,
  90,
  10,
  500000,
  10,
  'Arma final cósmica suprema',
  'Ark final que atravessa tela. Dano infinito.',
  'https://calamitymod.wiki.gg/wiki/Ark_of_the_Cosmos'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - HARDMODE RANGED
-- =====================================================================
(
  'Soma Prime',
  'RANGED',
  'NEUTRAL',
  95,
  10,
  6.0,
  350,
  8,
  60000,
  8,
  'Rifle de elite com cadência insana',
  'Arma ranged pós-Yharon. Dano consistente.',
  'https://calamitymod.wiki.gg/wiki/Soma_Prime'
),
(
  'Astral Blaster',
  'RANGED',
  'ASTRAL',
  90,
  9,
  2.5,
  280,
  7,
  40000,
  8,
  'Projéteis astral penetrantes',
  'Blaster que ignora defesa. Hardmode avançado.',
  'https://calamitymod.wiki.gg/wiki/Astral_Blaster'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - HARDMODE MAGIC
-- =====================================================================
(
  'Contagion',
  'MAGIC',
  'PLAGUE',
  85,
  8,
  2.0,
  260,
  7,
  35000,
  7,
  'Projecteis venenosos homing',
  'Arma mágica tóxica. Pós-Brimstone.',
  'https://calamitymod.wiki.gg/wiki/Contagion'
),
(
  'Shrine of the Cosmos',
  'MAGIC',
  'COSMIC',
  220,
  12,
  1.1,
  300,
  10,
  400000,
  10,
  'Santuário cósmico supremo',
  'Arma final que distorce espaço. Suprema.',
  'https://calamitymod.wiki.gg/wiki/Shrine_of_the_Cosmos'
),
(
  'Fabstaff',
  'MAGIC',
  'CRYSTAL',
  110,
  9,
  1.8,
  270,
  8,
  70000,
  8,
  'Cajado de cristal explosivo',
  'Arma mágica pós-Providence.',
  'https://calamitymod.wiki.gg/wiki/Fabstaff'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - SUMMONER
-- =====================================================================
(
  'Endo Hydra Staff',
  'SUMMON',
  'TOXIC',
  80,
  8,
  1.0,
  220,
  7,
  60000,
  8,
  'Invoca hidra tóxica',
  'Cajado que conjura criatura colossal venenosa.',
  'https://calamitymod.wiki.gg/wiki/Endo_Hydra_Staff'
),
(
  'Temporal Umbrella',
  'SUMMON',
  'TEMPORAL',
  193,
  9,
  1.0,
  250,
  9,
  120000,
  9,
  'Invoca chapéu mágico com items',
  'Summoner pós-Yharon. Minions variados.',
  'https://calamitymod.wiki.gg/wiki/Temporal_Umbrella'
),
(
  'Endogenesis',
  'SUMMON',
  'ABYSSAL',
  150,
  10,
  1.0,
  240,
  9,
  150000,
  9,
  'Criatura abissal final',
  'Invoca entidade suprema do abismo.',
  'https://calamitymod.wiki.gg/wiki/Endogenesis'
),

-- =====================================================================
-- TERRARIA CALAMITY MOD - ROGUE (Classe exclusiva Calamity)
-- =====================================================================
(
  'Rusty Knives',
  'ROGUE',
  'NEUTRAL',
  12,
  6,
  3.5,
  160,
  1,
  300,
  2,
  'Facas baratas enferrujadas',
  'Arma rogue iniciante do Calamity.',
  'https://calamitymod.wiki.gg/wiki/Rusty_Knives'
),
(
  'Lionfish',
  'ROGUE',
  'SULPHURIC',
  45,
  9,
  2.8,
  200,
  4,
  8000,
  6,
  'Espinhos venenosos perfurantes',
  'Arma rogue biológica com veneno.',
  'https://calamitymod.wiki.gg/wiki/Lionfish'
),
(
  'Seraph Tracers',
  'ROGUE',
  'HOLY_FLAMES',
  110,
  12,
  3.2,
  260,
  8,
  150000,
  9,
  'Daggers angelicais ultra-rápidos',
  'Rogue final sagrado. Altíssimo DPS.',
  'https://calamitymod.wiki.gg/wiki/Seraph_Tracers'
),
(
  'Murasama',
  'ROGUE',
  'GOD_SLAYER',
  180,
  13,
  2.5,
  300,
  10,
  300000,
  10,
  'Katana suprema pós-Yharon',
  'Arma rogue final. Crítico absurdo.',
  'https://calamitymod.wiki.gg/wiki/Murasama'
),

-- =====================================================================
-- BONUS: TERRARIA VANILLA - LATE GAME
-- =====================================================================
(
  'Zenith',
  'MELEE',
  'OMNI',
  200,
  15,
  2.0,
  100,
  11,
  1000000,
  10,
  'Arma suprema combina TUDO',
  'Versão final do Terraria 1.4. Crafted com 18+ armas lendárias.',
  'https://terraria.wiki.gg/images/thumb/1/14/Zenith.png/40px-Zenith.png'
),
(
  'Meowmere',
  'MELEE',
  'HOLY',
  95,
  10,
  1.3,
  85,
  8,
  100000,
  8,
  'Espada com gatinhos',
  'Arma de Moon Lord. Dispara gatinhos mágicos.',
  'https://terraria.wiki.gg/images/thumb/e/eb/Meowmere.png/40px-Meowmere.png'
),
(
  'Star Wrath',
  'MELEE',
  'HOLY',
  110,
  11,
  1.2,
  90,
  8,
  120000,
  9,
  'Invoca estrelas do céu',
  'Espada celestial pós-Profaned. Dano massivo.',
  'https://terraria.wiki.gg/images/thumb/f/f5/Star_Wrath.png/40px-Star_Wrath.png'
);

-- =====================================================================
-- Índices para melhor performance (já criados em V1)
-- =====================================================================
-- CREATE INDEX IF NOT EXISTS idx_weapon_class ON public.weapons(weapon_class);
-- CREATE INDEX IF NOT EXISTS idx_weapon_element ON public.weapons(element);
-- CREATE INDEX IF NOT EXISTS idx_weapon_rarity ON public.weapons(rarity);
-- CREATE INDEX IF NOT EXISTS idx_weapon_name ON public.weapons(name);
