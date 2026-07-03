package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.entity.WeaponSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeaponSubmissionRepository extends JpaRepository<WeaponSubmission, Long> {
    List<WeaponSubmission> findBySubmittedByOrderByCreatedAtDesc(User submittedBy);

    List<WeaponSubmission> findByStatusOrderByCreatedAtAsc(SubmissionStatus status);

    boolean existsByTargetWeaponIdAndStatus(Long targetWeaponId, SubmissionStatus status);

    long countByStatus(SubmissionStatus status);
}
