package com.terraria.calamity.application.service;

import com.terraria.calamity.api.exception.DuplicateResourceException;
import com.terraria.calamity.domain.dto.AuthResponse;
import com.terraria.calamity.domain.dto.LoginRequest;
import com.terraria.calamity.domain.dto.RegisterRequest;
import com.terraria.calamity.domain.dto.UserResponse;
import com.terraria.calamity.domain.entity.Role;
import com.terraria.calamity.domain.entity.User;
import com.terraria.calamity.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService authService;

    @Test
    void register_savesUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("calamitas", "calamitas@terraria.com", "secret123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken("calamitas@terraria.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("hashed");
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.USER);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.type()).isEqualTo("Bearer");
        assertThat(response.username()).isEqualTo("calamitas");
        assertThat(response.email()).isEqualTo("calamitas@terraria.com");
        assertThat(response.role()).isEqualTo("USER");
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("calamitas", "calamitas@terraria.com", "secret123");
        when(userRepository.existsByEmail("calamitas@terraria.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void register_throwsWhenUsernameAlreadyTaken() {
        RegisterRequest request = new RegisterRequest("calamitas", "calamitas@terraria.com", "secret123");
        when(userRepository.existsByEmail("calamitas@terraria.com")).thenReturn(false);
        when(userRepository.existsByUsername("calamitas")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void login_returnsTokenOnValidCredentials() {
        LoginRequest request = new LoginRequest("calamitas@terraria.com", "secret123");
        User user = User.builder()
                .username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("calamitas@terraria.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.type()).isEqualTo("Bearer");
    }

    @Test
    void login_throwsBadCredentialsOnAuthFailure() {
        LoginRequest request = new LoginRequest("bad@terraria.com", "wrong");
        doThrow(new org.springframework.security.authentication.InternalAuthenticationServiceException("fail"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void getCurrentUser_returnsUserDataForValidEmail() {
        User user = User.builder()
                .username("calamitas").email("calamitas@terraria.com")
                .password("hashed").role(Role.USER).enabled(true).build();
        when(userRepository.findByEmail("calamitas@terraria.com")).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser("calamitas@terraria.com");

        assertThat(response.username()).isEqualTo("calamitas");
        assertThat(response.email()).isEqualTo("calamitas@terraria.com");
        assertThat(response.role()).isEqualTo("USER");
    }

    @Test
    void getCurrentUser_throwsWhenUserNoLongerExists() {
        when(userRepository.findByEmail("ghost@terraria.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser("ghost@terraria.com"))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
    }
}
