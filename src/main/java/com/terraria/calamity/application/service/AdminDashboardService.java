package com.terraria.calamity.application.service;

import com.terraria.calamity.domain.dto.AdminDashboardResponseDTO;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.repository.SubmissionRepository;
import com.terraria.calamity.domain.repository.UserRepository;
import com.terraria.calamity.domain.repository.WeaponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final WeaponRepository weaponRepository;
    private final SubmissionRepository submissionRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponseDTO getDashboard() {
        return new AdminDashboardResponseDTO(
                userRepository.count(),
                userRepository.countByRole(Role.ADMIN),
                weaponRepository.count(),
                submissionRepository.countByStatus(SubmissionStatus.PENDING),
                submissionRepository.countByStatus(SubmissionStatus.APPROVED),
                submissionRepository.countByStatus(SubmissionStatus.REJECTED)
        );
    }
}
