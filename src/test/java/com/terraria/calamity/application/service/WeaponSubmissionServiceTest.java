package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.application.mapper.WeaponSubmissionMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeaponSubmissionServiceTest {

    @Mock private WeaponSubmissionRepository submissionRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private UserRepository userRepository;
    @Mock private WeaponSubmissionMapper mapper;

    @InjectMocks private WeaponSubmissionService service;

    private User submitter() {
        return User.builder().username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
    }

    private WeaponSubmissionRequestDTO createRequest(Long targetWeaponId) {
        return new WeaponSubmissionRequestDTO(targetWeaponId, "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY,
                50, 8, 1.3, 65, 5, 8000, 6, "Slash", "desc", "img");
    }

    private WeaponSubmissionResponseDTO responseFor(SubmissionType type, Long targetWeaponId) {
        return new WeaponSubmissionResponseDTO(
                1L, type, SubmissionStatus.PENDING, "calamitas", targetWeaponId,
                "Terra Blade", Weapon.WeaponClass.MELEE, Element.HOLY, 50, 8, 1.3, 65, 5, 8000, 6,
                "Slash", "desc", "img", null, null, null);
    }

    @Test
    void create_withoutTargetWeaponId_createsCreateTypeSubmission() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        WeaponSubmission builtEntity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(mapper.toEntity(any(), any(), any(), any())).thenReturn(builtEntity);
        when(submissionRepository.save(builtEntity)).thenReturn(builtEntity);
        when(mapper.toResponseDTO(builtEntity)).thenReturn(responseFor(SubmissionType.CREATE, null));

        WeaponSubmissionResponseDTO result = service.create(createRequest(null), "calamitas@terraria.com");

        assertThat(result.type()).isEqualTo(SubmissionType.CREATE);
        assertThat(result.submittedByUsername()).isEqualTo("calamitas");
    }

    @Test
    void create_withTargetWeaponId_throwsWhenPendingSubmissionAlreadyExists() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        Weapon target = Weapon.builder().name("Excalibur").weaponClass(Weapon.WeaponClass.MELEE).element(Element.HOLY)
                .baseDamage(40).criticalChance(5).attacksPerTurn(1.0).range(50).rarity(4).price(5000).quality(5).build();
        target.setId(7L);
        when(weaponRepository.findById(7L)).thenReturn(Optional.of(target));
        when(submissionRepository.existsByTargetWeaponIdAndStatus(7L, SubmissionStatus.PENDING)).thenReturn(true);

        assertThatThrownBy(() -> service.create(createRequest(7L), "calamitas@terraria.com"))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_withUnknownTargetWeaponId_throwsRuntimeException() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(createRequest(999L), "calamitas@terraria.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findMine_returnsOnlySubmitterSubmissions() {
        User author = submitter();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(author));
        WeaponSubmission entity = WeaponSubmission.builder().type(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findBySubmittedByOrderByCreatedAtDesc(author)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        List<WeaponSubmissionResponseDTO> result = service.findMine("calamitas@terraria.com");

        assertThat(result).containsExactly(responseDTO);
    }
}
