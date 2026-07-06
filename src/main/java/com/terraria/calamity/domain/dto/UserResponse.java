package com.terraria.calamity.domain.dto;

public record UserResponse(
    String username,
    String email,
    String role
) {
}
