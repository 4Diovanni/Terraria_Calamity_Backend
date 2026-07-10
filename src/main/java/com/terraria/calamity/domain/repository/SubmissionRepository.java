package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.EntityType;
import com.terraria.calamity.domain.entity.Submission;
import com.terraria.calamity.domain.entity.SubmissionStatus;
import com.terraria.calamity.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(User submittedBy, EntityType entityType);

    List<Submission> findByEntityTypeAndStatusOrderByCreatedAtAsc(EntityType entityType, SubmissionStatus status);

    boolean existsByTargetEntityIdAndEntityTypeAndStatus(Long targetEntityId, EntityType entityType, SubmissionStatus status);

    boolean existsByTargetEntityIdAndEntityType(Long targetEntityId, EntityType entityType);

    long countByStatus(SubmissionStatus status);
}
