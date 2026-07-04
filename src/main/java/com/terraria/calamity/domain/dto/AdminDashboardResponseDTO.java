package com.terraria.calamity.domain.dto;

public record AdminDashboardResponseDTO(
    long totalUsers,
    long totalAdmins,
    long totalWeapons,
    long pendingSubmissions,
    long approvedSubmissions,
    long rejectedSubmissions
) {}
