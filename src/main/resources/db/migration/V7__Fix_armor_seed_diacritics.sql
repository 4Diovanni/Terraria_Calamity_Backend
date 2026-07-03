-- =====================================================================
-- V7: Corrige a acentuacao PT-BR no seed de armaduras inserido pela V6
-- =====================================================================
-- A V6 original foi aplicada sem acentos (ASCII). Migrations ja aplicadas
-- nunca devem ser editadas (quebraria o checksum do Flyway em qualquer
-- ambiente onde a V6 ja rodou) - por isso a correcao vem como uma
-- migration nova, via UPDATE, em vez de editar a V6 diretamente.
-- =====================================================================

UPDATE armors SET
  name = 'Armadura Daedalus (Empíreo)',
  markdown_content = E'## Bônus de Conjunto\n\nCristais de neve orbitam o jogador e disparam contra inimigos próximos.\n\n- +2 defesa adicional\n- Invocação de estilhaços de gelo ao atacar',
  flavor_text = 'O engenho do labirinto, cristalizado em gelo eterno.'
WHERE name = 'Armadura Daedalus (Empireo)';

UPDATE armors SET
  markdown_content = E'## Bônus de Conjunto\n\nQuando o conjunto completo é usado, uma **aura curativa** libera partículas que\nrestauram vida ao redor do jogador ao coletar corações.\n\n- +8% de dano para todas as classes\n- Regeneração de vida aprimorada perto da água',
  flavor_text = 'Forjada com os restos do mar, guarda a maré em cada placa.'
WHERE name = 'Armadura de Victide';

UPDATE armors SET
  markdown_content = E'## Bônus de Conjunto\n\nAumenta a **mobilidade aérea** e concede um impulso de velocidade ao voar.\n\n- +10% de velocidade de movimento\n- +15% de dano de projétil ao estar no ar',
  flavor_text = 'Leve como o vento das ilhas flutuantes.'
WHERE name = 'Armadura Aerospec';

UPDATE armors SET
  markdown_content = E'## Bônus de Conjunto\n\nAo receber dano, envolve o jogador em uma **explosão de enxofre** que incendeia\ninimigos e concede fúria mágica temporária.\n\n- +12% de dano mágico\n- Explosão de Brimstone ao ser atingido (cooldown de 20s)',
  flavor_text = 'Vestir chamas é aceitar que elas também te consomem.'
WHERE name = 'Armadura de Brimchama';

UPDATE armor_pieces SET name = 'Elmo Empíreo de Daedalus'
WHERE armor_id = (SELECT id FROM armors WHERE name = 'Armadura Daedalus (Empíreo)') AND slot = 'HELMET';

UPDATE armor_pieces SET name = 'Túnica de Brimchama'
WHERE armor_id = (SELECT id FROM armors WHERE name = 'Armadura de Brimchama') AND slot = 'CHEST';

UPDATE armor_pieces SET name = 'Calças de Brimchama'
WHERE armor_id = (SELECT id FROM armors WHERE name = 'Armadura de Brimchama') AND slot = 'LEGS';
