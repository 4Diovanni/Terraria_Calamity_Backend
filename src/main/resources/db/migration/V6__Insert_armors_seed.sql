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
  E'## Bônus de Conjunto\n\nQuando o conjunto completo é usado, uma **aura curativa** libera partículas que\nrestauram vida ao redor do jogador ao coletar corações.\n\n- +8% de dano para todas as classes\n- Regeneração de vida aprimorada perto da água',
  'Forjada com os restos do mar, guarda a maré em cada placa.'
),
(
  'Armadura Aerospec',
  'UNIVERSAL',
  'UNCOMMON',
  15,
  '',
  E'## Bônus de Conjunto\n\nAumenta a **mobilidade aérea** e concede um impulso de velocidade ao voar.\n\n- +10% de velocidade de movimento\n- +15% de dano de projétil ao estar no ar',
  'Leve como o vento das ilhas flutuantes.'
),
(
  'Armadura Daedalus (Empíreo)',
  'MELEE',
  'RARE',
  30,
  '',
  E'## Bônus de Conjunto\n\nCristais de neve orbitam o jogador e disparam contra inimigos próximos.\n\n- +2 defesa adicional\n- Invocação de estilhaços de gelo ao atacar',
  'O engenho do labirinto, cristalizado em gelo eterno.'
),
(
  'Armadura de Brimchama',
  'MAGE',
  'EPIC',
  22,
  '',
  E'## Bônus de Conjunto\n\nAo receber dano, envolve o jogador em uma **explosão de enxofre** que incendeia\ninimigos e concede fúria mágica temporária.\n\n- +12% de dano mágico\n- Explosão de Brimstone ao ser atingido (cooldown de 20s)',
  'Vestir chamas é aceitar que elas também te consomem.'
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
SELECT id, 'HELMET', 'Elmo Empíreo de Daedalus', '', 8 FROM armors WHERE name = 'Armadura Daedalus (Empíreo)'
UNION ALL
SELECT id, 'CHEST', 'Peitoral de Daedalus', '', 12 FROM armors WHERE name = 'Armadura Daedalus (Empíreo)'
UNION ALL
SELECT id, 'LEGS', 'Perneiras de Daedalus', '', 10 FROM armors WHERE name = 'Armadura Daedalus (Empíreo)'
UNION ALL
SELECT id, 'HELMET', 'Capuz de Brimchama', '', 6 FROM armors WHERE name = 'Armadura de Brimchama'
UNION ALL
SELECT id, 'CHEST', 'Túnica de Brimchama', '', 9 FROM armors WHERE name = 'Armadura de Brimchama'
UNION ALL
SELECT id, 'LEGS', 'Calças de Brimchama', '', 7 FROM armors WHERE name = 'Armadura de Brimchama';
