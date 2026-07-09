package com.terraria.calamity.application.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeaponPayloadMapperTest {

    private final WeaponPayloadMapper mapper = new WeaponPayloadMapper(new ObjectMapper());

    private WeaponSubmissionRequestDTO sampleRequest(Long targetWeaponId) {
        return new WeaponSubmissionRequestDTO(
                targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "Uma espada lendária", "https://example.com/terrablade.png");
    }

    private User sampleUser() {
        return User.builder().username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
    }

    @Test
    void toEntity_buildsSubmissionWithWeaponPayload() {
        Submission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        assertThat(submission.getEntityType()).isEqualTo(EntityType.WEAPON);
        assertThat(submission.getSubmissionType()).isEqualTo(SubmissionType.CREATE);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(submission.getSubmittedBy().getUsername()).isEqualTo("calamitas");
        assertThat(submission.getTargetEntityId()).isNull();
        assertThat(submission.getPayload()).containsEntry("name", "Terra Blade");
        assertThat(submission.getPayload()).containsEntry("baseDamage", 50);
        assertThat(submission.getPayload()).doesNotContainKey("targetWeaponId");
    }

    @Test
    void toResponseDTO_mapsPayloadBackToFlatFields() {
        Submission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), 1L, SubmissionType.UPDATE);
        submission.setId(10L);

        var responseDTO = mapper.toResponseDTO(submission);

        assertThat(responseDTO.id()).isEqualTo(10L);
        assertThat(responseDTO.type()).isEqualTo(SubmissionType.UPDATE);
        assertThat(responseDTO.submittedByUsername()).isEqualTo("calamitas");
        assertThat(responseDTO.targetWeaponId()).isEqualTo(1L);
        assertThat(responseDTO.name()).isEqualTo("Terra Blade");
        assertThat(responseDTO.baseDamage()).isEqualTo(50);
        assertThat(responseDTO.imageUrl()).isEqualTo("https://example.com/terrablade.png");
        assertThat(responseDTO.element()).isEqualTo(Element.HOLY);
        assertThat(responseDTO.attacksPerTurn()).isEqualTo(1.3);
    }

    @Test
    void toApprovedWeapon_buildsWeaponFromPayload() {
        Submission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        Weapon weapon = mapper.toApprovedWeapon(submission);

        assertThat(weapon.getName()).isEqualTo("Terra Blade");
        assertThat(weapon.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(weapon.getBaseDamage()).isEqualTo(50);
        assertThat(weapon.getRarity()).isEqualTo(5);
        assertThat(weapon.getElement()).isEqualTo(Element.HOLY);
        assertThat(weapon.getAttacksPerTurn()).isEqualTo(1.3);
    }

    @Test
    void applyToExistingWeapon_overwritesTargetFields() {
        Weapon existing = Weapon.builder()
                .name("Old Name").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10)
                .rarity(1).price(100).quality(1).build();

        Submission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), 1L, SubmissionType.UPDATE);
        mapper.applyToExistingWeapon(submission, existing);

        assertThat(existing.getName()).isEqualTo("Terra Blade");
        assertThat(existing.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(existing.getBaseDamage()).isEqualTo(50);
        assertThat(existing.getElement()).isEqualTo(Element.HOLY);
        assertThat(existing.getAttacksPerTurn()).isEqualTo(1.3);
    }
}
