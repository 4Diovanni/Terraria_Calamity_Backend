package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArmorRepository extends JpaRepository<Armor, Long> {
    List<Armor> findByArmorClass(Armor.ArmorClass armorClass);

    List<Armor> findByRarity(Rarity rarity);
}
