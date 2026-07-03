package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Armor;
import com.terraria.calamity.domain.entity.ArmorPiece;
import com.terraria.calamity.domain.entity.Rarity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

// Spring Boot 4.x removed @DataJpaTest; @SpringBootTest uses the H2 test
// profile (src/test/resources/application.yml), Flyway disabled, ddl-auto=create-drop.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class ArmorRepositoryTest {

    @Autowired
    private ArmorRepository armorRepository;

    @Test
    void save_cascadesPiecesAndReloadsThem() {
        Armor armor = Armor.builder()
                .name("Test Armor")
                .armorClass(Armor.ArmorClass.UNIVERSAL)
                .rarity(Rarity.COMMON)
                .totalDefense(10)
                .imageUrl("")
                .build();
        armor.addPiece(ArmorPiece.builder()
                .slot(ArmorPiece.Slot.HELMET).name("Test Helmet").imageUrl("").defense(3).build());
        armor.addPiece(ArmorPiece.builder()
                .slot(ArmorPiece.Slot.CHEST).name("Test Chest").imageUrl("").defense(5).build());

        Armor saved = armorRepository.save(armor);

        Armor reloaded = armorRepository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getPieces()).hasSize(2);
        assertThat(reloaded.getPieces())
                .extracting(ArmorPiece::getSlot)
                .containsExactlyInAnyOrder(ArmorPiece.Slot.HELMET, ArmorPiece.Slot.CHEST);
    }

    @Test
    void findByArmorClass_returnsOnlyMatching() {
        Armor melee = Armor.builder().name("Melee Set").armorClass(Armor.ArmorClass.MELEE)
                .rarity(Rarity.RARE).totalDefense(20).imageUrl("").build();
        Armor mage = Armor.builder().name("Mage Set").armorClass(Armor.ArmorClass.MAGE)
                .rarity(Rarity.RARE).totalDefense(18).imageUrl("").build();
        armorRepository.save(melee);
        armorRepository.save(mage);

        assertThat(armorRepository.findByArmorClass(Armor.ArmorClass.MELEE))
                .extracting(Armor::getName)
                .containsExactly("Melee Set");
    }
}
