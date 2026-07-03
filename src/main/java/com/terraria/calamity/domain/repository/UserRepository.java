package com.terraria.calamity.domain.repository;

import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    long countByRole(Role role);
}
