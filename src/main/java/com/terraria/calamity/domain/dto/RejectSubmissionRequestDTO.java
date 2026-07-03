package com.terraria.calamity.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectSubmissionRequestDTO(
    @NotBlank(message = "Reason cannot be blank")
    String reason
) {}
