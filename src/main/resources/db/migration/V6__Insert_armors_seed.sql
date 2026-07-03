-- =====================================================================
-- V6: Inserção de Armaduras - reproduz os mocks de src/frontend/src/services/armorService.ts
-- =====================================================================

INSERT INTO armors (name, armor_class, rarity, total_defense, image_url, markdown_content, flavor_text) VALUES
(
  'Armadura de Victide',
  'UNIVERSAL',
  'COMMON',
  12,
  '',
  E'## Bonus de Conjunto\n\nQuando o conjunto completo e usado, uma **aura curativa** libera particulas que\nrestauram vida ao redor do jogador ao coletar coracoes.\n\n- +8% de dano para todas as classes\n- Regeneracao de vida aprimorada perto da agua',
  'Forjada com os restos do mar, guarda a mare em cada placa.'
),
(
  'Armadura Aerospec',
  'UNIVERSAL',
  'UNCOMMON',
  15,
  '',
  E'## Bonus de Conjunto\n\nAumenta a **mobilidade aerea** e concede um impulso de velocidade ao voar.\n\n- +10% de velocidade de movimento\n- +15% de dano de projetil ao estar no ar',
  'Leve como o vento das ilhas flutuantes.'
),
(
  'Armadura Daedalus (Empireo)',
  'MELEE',
  'RARE',
  30,
  '',
  E'## Bonus de Conjunto\n\nCristais de neve orbitam o jogador e disparam contra inimigos proximos.\n\n- +2 defesa adicional\n- Invocacao de estilhacos de gelo ao atacar',
  'O engenho do labirinto, cristalizado em gelo eterno.'
),
(
  'Armadura de Brimchama',
  'MAGE',
  'EPIC',
  22,
  '',
  E'## Bonus de Conjunto\n\nAo receber dano, envolve o jogador em uma **explosao de enxofre** que incendeia\ninimigos e concede furia magica temporaria.\n\n- +12% de dano magico\n- Explosao de Brimstone ao ser atingido (cooldown de 20s)',
  'Vestir chamas e aceitar que elas tambem te consomem.'
);

INSERT INTO armor_pieces (armor_id, slot, name, image_url, defense)
SELECT id, 'HELMET', 'Elmo de Victide', '', 3 FROM armors WHERE name = 'Armadura de Victide'
UNION ALL
SELECT id, 'CHEST', 'Peitoral de Victide', '', 5 FROM armors WHERE name = 'Armadura de Victide'
UNION ALL
SELECT id, 'LEGS', 'Perneiras de Victide', '', 4 FROM armors WHERE name = 'Armadura de Victide'
UNION ALL
SELECT id, 'HELMET', 'Elmo Aerospec', '', 4 FROM armors WHERE name = 'Armadura Aerospec'
UNION ALL
SELECT id, 'CHEST', 'Peitoral Aerospec', '', 6 FROM armors WHERE name = 'Armadura Aerospec'
UNION ALL
SELECT id, 'LEGS', 'Perneiras Aerospec', '', 5 FROM armors WHERE name = 'Armadura Aerospec'
UNION ALL
SELECT id, 'HELMET', 'Elmo Empireo de Daedalus', '', 8 FROM armors WHERE name = 'Armadura Daedalus (Empireo)'
UNION ALL
SELECT id, 'CHEST', 'Peitoral de Daedalus', '', 12 FROM armors WHERE name = 'Armadura Daedalus (Empireo)'
UNION ALL
SELECT id, 'LEGS', 'Perneiras de Daedalus', '', 10 FROM armors WHERE name = 'Armadura Daedalus (Empireo)'
UNION ALL
SELECT id, 'HELMET', 'Capuz de Brimchama', '', 6 FROM armors WHERE name = 'Armadura de Brimchama'
UNION ALL
SELECT id, 'CHEST', 'Tunica de Brimchama', '', 9 FROM armors WHERE name = 'Armadura de Brimchama'
UNION ALL
SELECT id, 'LEGS', 'Calcas de Brimchama', '', 7 FROM armors WHERE name = 'Armadura de Brimchama';
