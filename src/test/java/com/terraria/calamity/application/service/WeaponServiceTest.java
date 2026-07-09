package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.ResourceInUseException;
import com.terraria.calamity.application.mapper.WeaponMapper;
import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeaponServiceTest {

    @Mock private WeaponRepository weaponRepository;
    @Mock private WeaponMapper weaponMapper;
    @Mock private SubmissionRepository submissionRepository;

    @InjectMocks private WeaponService service;

    @Test
    void delete_withAssociatedSubmission_throwsResourceInUseAndDoesNotDelete() {
        when(weaponRepository.existsById(7L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityType(7L, EntityType.WEAPON)).thenReturn(true);

        assertThatThrownBy(() -> service.delete(7L))
                .isInstanceOf(ResourceInUseException.class)
                .hasMessageContaining("submiss");

        verify(weaponRepository, never()).deleteById(7L);
    }

    @Test
    void delete_withoutAssociatedSubmission_deletesNormally() {
        when(weaponRepository.existsById(9L)).thenReturn(true);
        when(submissionRepository.existsByTargetEntityIdAndEntityType(9L, EntityType.WEAPON)).thenReturn(false);

        service.delete(9L);

        verify(weaponRepository).deleteById(9L);
    }
}
