package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeaponRepository extends JpaRepository<Weapon, Long> {
    List<Weapon> findByWeaponClass(Weapon.WeaponClass weaponClass);

    List<Weapon> findByElement(Element element);

    List<Weapon> findByRarity(Integer rarity);

    List<Weapon> findByNameContainingIgnoreCase(String name);

    @Query("SELECT w FROM Weapon w WHERE w.weaponClass = :class AND w.rarity >= :minRarity ORDER BY w.rarity ASC")
    List<Weapon> findWeaponsByClassAndMinimumRarity(@Param("class") Weapon.WeaponClass weaponClass, @Param("minRarity") Integer minRarity);
}
