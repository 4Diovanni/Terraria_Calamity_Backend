-- Corrige inconsistência: o seed (V2) inseriu 'MAGIC' como weapon_class,
-- mas o enum Weapon.WeaponClass usa 'MAGE'.
UPDATE weapons SET weapon_class = 'MAGE' WHERE weapon_class = 'MAGIC';
