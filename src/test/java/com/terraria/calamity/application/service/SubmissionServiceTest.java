package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.api.exception.ForbiddenActionException;
import com.terraria.calamity.api.exception.InvalidSubmissionStateException;
import com.terraria.calamity.application.mapper.WeaponPayloadMapper;
import com.terraria.calamity.domain.dto.WeaponSubmissionRequestDTO;
import com.terraria.calamity.domain.dto.WeaponSubmissionResponseDTO;
import com.terraria.calamity.domain.entity.*;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private UserRepository userRepository;
    @Mock private WeaponPayloadMapper mapper;

    @InjectMocks private SubmissionService service;

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
        Submission builtEntity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(mapper.toEntity(any(), any(), any(), any())).thenReturn(builtEntity);
        when(submissionRepository.save(builtEntity)).thenReturn(builtEntity);
        when(mapper.toResponseDTO(builtEntity)).thenReturn(responseFor(SubmissionType.CREATE, null));

        WeaponSubmissionResponseDTO result = service.create(createRequest(null), "calamitas@terraria.com");

        assertThat(result.type()).isEqualTo(SubmissionType.CREATE);
        assertThat(result.submittedByUsername()).isEqualTo("calamitas");
        // Verify that SubmissionType.CREATE and null targetEntityId were actually passed to mapper
        verify(mapper).toEntity(any(WeaponSubmissionRequestDTO.class), eq(submitter()), isNull(), eq(SubmissionType.CREATE));
    }

    @Test
    void create_withValidTargetWeaponId_createsUpdateTypeSubmission() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.existsById(7L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.PENDING)).thenReturn(false);
        Submission builtEntity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.UPDATE).targetEntityId(7L).status(SubmissionStatus.PENDING).build();
        when(mapper.toEntity(any(), any(), any(), any())).thenReturn(builtEntity);
        when(submissionRepository.save(builtEntity)).thenReturn(builtEntity);
        when(mapper.toResponseDTO(builtEntity)).thenReturn(responseFor(SubmissionType.UPDATE, 7L));

        WeaponSubmissionResponseDTO result = service.create(createRequest(7L), "calamitas@terraria.com");

        assertThat(result.type()).isEqualTo(SubmissionType.UPDATE);
        assertThat(result.targetWeaponId()).isEqualTo(7L);
        assertThat(result.submittedByUsername()).isEqualTo("calamitas");
        // Verify that SubmissionType.UPDATE and targetEntityId=7L were actually passed to mapper
        verify(mapper).toEntity(any(WeaponSubmissionRequestDTO.class), eq(submitter()), eq(7L), eq(SubmissionType.UPDATE));
    }

    @Test
    void create_withTargetWeaponId_throwsWhenPendingSubmissionAlreadyExists() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.existsById(7L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.PENDING)).thenReturn(true);

        assertThatThrownBy(() -> service.create(createRequest(7L), "calamitas@terraria.com"))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_withUnknownTargetWeaponId_throwsRuntimeException() {
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(submitter()));
        when(weaponRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.create(createRequest(999L), "calamitas@terraria.com"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findMine_returnsOnlySubmitterSubmissions() {
        User author = submitter();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(author));
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(author, EntityType.WEAPON)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        List<WeaponSubmissionResponseDTO> result = service.findMine("calamitas@terraria.com");

        assertThat(result).containsExactly(responseDTO);
    }

    @Test
    void approve_createType_savesNewWeaponAndMarksApproved() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        Weapon newWeapon = Weapon.builder().name("Terra Blade").weaponClass(Weapon.WeaponClass.MELEE).element(Element.HOLY)
                .baseDamage(50).criticalChance(8).attacksPerTurn(1.3).range(65).rarity(5).price(8000).quality(6).build();
        when(mapper.toApprovedWeapon(submission)).thenReturn(newWeapon);
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.CREATE, null));

        service.approve(5L);

        verify(weaponRepository).save(newWeapon);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.APPROVED);
    }

    @Test
    void approve_updateType_appliesChangesToExistingWeaponAndMarksApproved() {
        Weapon target = Weapon.builder().name("Old").weaponClass(Weapon.WeaponClass.MELEE).element(Element.FIRE)
                .baseDamage(10).criticalChance(5).attacksPerTurn(1.0).range(10).rarity(1).price(100).quality(1).build();
        target.setId(7L);
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.UPDATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).targetEntityId(7L).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        when(weaponRepository.findById(7L)).thenReturn(Optional.of(target));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.UPDATE, 7L));

        service.approve(5L);

        verify(mapper).applyToExistingWeapon(submission, target);
        verify(weaponRepository).save(target);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.APPROVED);
    }

    @Test
    void approve_throwsWhenNotPending() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.approve(5L)).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void reject_setsStatusAndReason() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(mapper.toResponseDTO(submission)).thenReturn(responseFor(SubmissionType.CREATE, null));

        service.reject(5L, "Dano muito alto");

        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.REJECTED);
        assertThat(submission.getRejectionReason()).isEqualTo("Dano muito alto");
    }

    @Test
    void reject_throwsWhenNotPending() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.REJECTED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.reject(5L, "motivo")).isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void cancel_deletesWhenAuthorAndPending() {
        User author = submitter();
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(author).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        service.cancel(5L, "calamitas@terraria.com");

        verify(submissionRepository).delete(submission);
    }

    @Test
    void cancel_throwsForbiddenWhenNotAuthor() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "stranger@terraria.com"))
                .isInstanceOf(ForbiddenActionException.class);
    }

    @Test
    void cancel_throwsInvalidStateWhenNotPending() {
        Submission submission = Submission.builder()
                .entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.APPROVED).submittedBy(submitter()).build();
        submission.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.cancel(5L, "calamitas@terraria.com"))
                .isInstanceOf(InvalidSubmissionStateException.class);
    }

    @Test
    void findByStatus_mapsAllMatchingSubmissions() {
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        when(submissionRepository.findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType.WEAPON, SubmissionStatus.PENDING)).thenReturn(List.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        assertThat(service.findByStatus(SubmissionStatus.PENDING)).containsExactly(responseDTO);
    }

    @Test
    void findById_returnsMappedSubmission() {
        Submission entity = Submission.builder().entityType(EntityType.WEAPON).submissionType(SubmissionType.CREATE).status(SubmissionStatus.PENDING).build();
        entity.setId(5L);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(entity));
        WeaponSubmissionResponseDTO responseDTO = responseFor(SubmissionType.CREATE, null);
        when(mapper.toResponseDTO(entity)).thenReturn(responseDTO);

        assertThat(service.findById(5L)).isEqualTo(responseDTO);
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(submissionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(404L)).isInstanceOf(RuntimeException.class);
    }
}
