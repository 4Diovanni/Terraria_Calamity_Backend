package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import com.terraria.calamity.domain.repository.WeaponSubmissionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private WeaponRepository weaponRepository;
    @Mock private WeaponSubmissionRepository submissionRepository;

    @InjectMocks private AdminDashboardService service;

    @Test
    void getDashboard_aggregatesAllCounts() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(2L);
        when(weaponRepository.count()).thenReturn(50L);
        when(submissionRepository.countByStatus(SubmissionStatus.PENDING)).thenReturn(3L);
        when(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).thenReturn(7L);
        when(submissionRepository.countByStatus(SubmissionStatus.REJECTED)).thenReturn(1L);

        AdminDashboardResponseDTO dashboard = service.getDashboard();

        assertThat(dashboard.totalUsers()).isEqualTo(10L);
        assertThat(dashboard.totalAdmins()).isEqualTo(2L);
        assertThat(dashboard.totalWeapons()).isEqualTo(50L);
        assertThat(dashboard.pendingSubmissions()).isEqualTo(3L);
        assertThat(dashboard.approvedSubmissions()).isEqualTo(7L);
        assertThat(dashboard.rejectedSubmissions()).isEqualTo(1L);
    }
}
