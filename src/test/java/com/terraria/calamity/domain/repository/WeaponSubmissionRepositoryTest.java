package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class WeaponSubmissionRepositoryTest {

    @Autowired private WeaponSubmissionRepository submissionRepository;
    @Autowired private WeaponRepository weaponRepository;
    @Autowired private UserRepository userRepository;

    private User saveUser(String email) {
        return userRepository.save(User.builder()
                .username(email.substring(0, email.indexOf('@')))
                .email(email)
                .password("hashed")
                .role(Role.USER)
                .enabled(true)
                .build());
    }

    private Weapon saveWeapon(String name) {
        return weaponRepository.save(Weapon.builder()
                .name(name)
                .weaponClass(Weapon.WeaponClass.MELEE)
                .element(Element.FIRE)
                .baseDamage(10)
                .criticalChance(5)
                .attacksPerTurn(1.0)
                .range(10)
                .rarity(1)
                .price(100)
                .quality(1)
                .build());
    }

    @Test
    void existsByTargetWeaponIdAndStatus_returnsTrue_whenPendingSubmissionExists() {
        User author = saveUser("author@terraria.com");
        Weapon weapon = saveWeapon("Excalibur");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.UPDATE)
                .status(SubmissionStatus.PENDING)
                .submittedBy(author)
                .targetWeapon(weapon)
                .name("Excalibur Melhorada")
                .weaponClass(Weapon.WeaponClass.MELEE)
                .element(Element.HOLY)
                .baseDamage(20)
                .criticalChance(10)
                .attacksPerTurn(1.5)
                .range(15)
                .rarity(2)
                .price(200)
                .quality(2)
                .build());

        assertThat(submissionRepository.existsByTargetWeaponIdAndStatus(weapon.getId(), SubmissionStatus.PENDING)).isTrue();
        assertThat(submissionRepository.existsByTargetWeaponIdAndStatus(weapon.getId(), SubmissionStatus.APPROVED)).isFalse();
    }

    @Test
    void findBySubmittedByOrderByCreatedAtDesc_returnsOnlyOwnSubmissions() {
        User author = saveUser("owner@terraria.com");
        User other = saveUser("other@terraria.com");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author)
                .name("Arma do Owner").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(15).criticalChance(5).attacksPerTurn(1.2).range(20).rarity(1).price(150).quality(1)
                .build());

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(other)
                .name("Arma do Other").weaponClass(Weapon.WeaponClass.RANGED).element(Element.ICE)
                .baseDamage(15).criticalChance(5).attacksPerTurn(1.2).range(20).rarity(1).price(150).quality(1)
                .build());

        var result = submissionRepository.findBySubmittedByOrderByCreatedAtDesc(author);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Arma do Owner");
    }

    @Test
    void countByStatus_countsOnlyMatchingStatus() {
        User author = saveUser("counter@terraria.com");

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author)
                .name("Pendente").weaponClass(Weapon.WeaponClass.MAGE).element(Element.ARCANE)
                .baseDamage(30).criticalChance(8).attacksPerTurn(1.0).range(25).rarity(3).price(500).quality(3)
                .build());

        submissionRepository.save(WeaponSubmission.builder()
                .type(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(author)
                .name("Aprovada").weaponClass(Weapon.WeaponClass.MAGE).element(Element.ARCANE)
                .baseDamage(30).criticalChance(8).attacksPerTurn(1.0).range(25).rarity(3).price(500).quality(3)
                .build());

        assertThat(submissionRepository.countByStatus(SubmissionStatus.PENDING)).isEqualTo(1);
        assertThat(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).isEqualTo(1);
    }
}
