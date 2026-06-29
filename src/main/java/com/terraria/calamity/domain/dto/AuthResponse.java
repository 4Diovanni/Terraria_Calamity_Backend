package com.terraria.calamity.domain.dto;

public record AuthResponse(
    String token,
    String type,
    String username,
    String email,
    String role
) {
    public static AuthResponse bearer(String token, String username, String email, String role) {
        return new AuthResponse(token, "Bearer", username, email, role);
    }
}
