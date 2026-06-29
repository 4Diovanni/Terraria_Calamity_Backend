package com.terraria.calamity.domain.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Password cannot be blank")
    String password
) {}
