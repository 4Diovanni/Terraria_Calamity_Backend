package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

// Spring Boot 4.x removed @DataJpaTest from test-autoconfigure; @SpringBootTest
// uses the H2 test profile (src/test/resources/application.yml) with Flyway
// disabled and ddl-auto=create-drop, which builds the schema from JPA entities.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void existsAndFind_returnTrue_whenUserSaved() {
        userRepository.save(User.builder()
                .username("calamitas")
                .email("calamitas@terraria.com")
                .password("hashed")
                .role(Role.USER)
                .enabled(true)
                .build());

        assertThat(userRepository.existsByEmail("calamitas@terraria.com")).isTrue();
        assertThat(userRepository.existsByUsername("calamitas")).isTrue();
        assertThat(userRepository.findByEmail("calamitas@terraria.com"))
                .hasValueSatisfying(u -> assertThat(u.getEmail()).isEqualTo("calamitas@terraria.com"));
        assertThat(userRepository.existsByEmail("ghost@terraria.com")).isFalse();
    }
}
