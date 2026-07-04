package com.terraria.calamity.application.mapper;

import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeaponSubmissionMapperTest {

    private final WeaponSubmissionMapper mapper = new WeaponSubmissionMapper();

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
    void toEntity_copiesAllProposedFields() {
        WeaponSubmission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        assertThat(submission.getType()).isEqualTo(SubmissionType.CREATE);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(submission.getSubmittedBy().getUsername()).isEqualTo("calamitas");
        assertThat(submission.getTargetWeapon()).isNull();
        assertThat(submission.getName()).isEqualTo("Terra Blade");
        assertThat(submission.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(submission.getElement()).isEqualTo(Element.HOLY);
        assertThat(submission.getBaseDamage()).isEqualTo(50);
        assertThat(submission.getImageUrl()).isEqualTo("https://example.com/terrablade.png");
    }

    @Test
    void toApprovedWeapon_buildsWeaponFromSubmissionFields() {
        WeaponSubmission submission = mapper.toEntity(sampleRequest(null), sampleUser(), null, SubmissionType.CREATE);

        Weapon weapon = mapper.toApprovedWeapon(submission);

        assertThat(weapon.getName()).isEqualTo("Terra Blade");
        assertThat(weapon.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(weapon.getBaseDamage()).isEqualTo(50);
        assertThat(weapon.getRarity()).isEqualTo(5);
    }

    @Test
    void applyToExistingWeapon_overwritesTargetFields() {
        Weapon existing = Weapon.builder()
                .name("Old Name").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10)
                .rarity(1).price(100).quality(1).build();

        WeaponSubmission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), existing, SubmissionType.UPDATE);
        mapper.applyToExistingWeapon(submission, existing);

        assertThat(existing.getName()).isEqualTo("Terra Blade");
        assertThat(existing.getWeaponClass()).isEqualTo(Weapon.WeaponClass.MELEE);
        assertThat(existing.getBaseDamage()).isEqualTo(50);
    }

    @Test
    void toResponseDTO_mapsSubmittedByUsernameAndTargetWeaponId() {
        Weapon existing = Weapon.builder()
                .name("Old Name").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10)
                .rarity(1).price(100).quality(1).build();
        existing.setId(1L);

        WeaponSubmission submission = mapper.toEntity(sampleRequest(1L), sampleUser(), existing, SubmissionType.UPDATE);
        submission.setId(10L);

        var responseDTO = mapper.toResponseDTO(submission);

        assertThat(responseDTO.id()).isEqualTo(10L);
        assertThat(responseDTO.submittedByUsername()).isEqualTo("calamitas");
        assertThat(responseDTO.targetWeaponId()).isEqualTo(1L);
        assertThat(responseDTO.type()).isEqualTo(SubmissionType.UPDATE);
    }
}
