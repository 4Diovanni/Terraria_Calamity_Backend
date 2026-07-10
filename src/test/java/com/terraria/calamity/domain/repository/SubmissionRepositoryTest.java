package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class SubmissionRepositoryTest {

    @Autowired private SubmissionRepository submissionRepository;
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

    private Submission buildSubmission(User author, Long targetEntityId, SubmissionStatus status) {
        return Submission.builder()
                .entityType(EntityType.WEAPON)
                .submissionType(targetEntityId != null ? SubmissionType.UPDATE : SubmissionType.CREATE)
                .status(status)
                .submittedBy(author)
                .targetEntityId(targetEntityId)
                .payload(Map.of("name", "Terra Blade", "baseDamage", 50))
                .build();
    }

    @Test
    void existsByTargetEntityIdAndEntityTypeAndStatus_returnsTrue_whenPendingSubmissionExists() {
        User author = saveUser("author@terraria.com");
        submissionRepository.save(buildSubmission(author, 7L, SubmissionStatus.PENDING));

        assertThat(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.PENDING)).isTrue();
        assertThat(submissionRepository.existsByTargetEntityIdAndEntityTypeAndStatus(7L, EntityType.WEAPON, SubmissionStatus.APPROVED)).isFalse();
    }

    @Test
    void existsByTargetEntityIdAndEntityType_returnsTrue_regardlessOfStatus() {
        User author = saveUser("author2@terraria.com");
        submissionRepository.save(buildSubmission(author, 8L, SubmissionStatus.APPROVED));

        assertThat(submissionRepository.existsByTargetEntityIdAndEntityType(8L, EntityType.WEAPON)).isTrue();
        assertThat(submissionRepository.existsByTargetEntityIdAndEntityType(999L, EntityType.WEAPON)).isFalse();
    }

    @Test
    void findBySubmittedByAndEntityTypeOrderByCreatedAtDesc_returnsOnlyOwnSubmissions() {
        User author = saveUser("owner@terraria.com");
        User other = saveUser("other@terraria.com");

        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.PENDING));
        submissionRepository.save(buildSubmission(other, null, SubmissionStatus.PENDING));

        var result = submissionRepository.findBySubmittedByAndEntityTypeOrderByCreatedAtDesc(author, EntityType.WEAPON);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSubmittedBy().getEmail()).isEqualTo("owner@terraria.com");
    }

    @Test
    void countByStatus_countsOnlyMatchingStatus() {
        User author = saveUser("counter@terraria.com");
        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.PENDING));
        submissionRepository.save(buildSubmission(author, null, SubmissionStatus.APPROVED));

        assertThat(submissionRepository.countByStatus(SubmissionStatus.PENDING)).isEqualTo(1);
        assertThat(submissionRepository.countByStatus(SubmissionStatus.APPROVED)).isEqualTo(1);
    }

    @Test
    void payload_roundTripsAsMap() {
        User author = saveUser("payload@terraria.com");
        Submission saved = submissionRepository.saveAndFlush(buildSubmission(author, null, SubmissionStatus.PENDING));

        Submission reloaded = submissionRepository.findById(saved.getId()).orElseThrow();

        assertThat(reloaded.getPayload()).containsEntry("name", "Terra Blade");
    }
}
