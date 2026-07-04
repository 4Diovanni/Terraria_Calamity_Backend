package com.terraria.calamity.api.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAccessDenied_returns403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("status", 403);
    }

    @Test
    void handleForbiddenAction_returns403WithMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleForbiddenAction(new ForbiddenActionException("Only the author can cancel this submission"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("message", "Only the author can cancel this submission");
    }

    @Test
    void handleInvalidSubmissionState_returns409WithMessage() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleInvalidSubmissionState(new InvalidSubmissionStateException("Only PENDING submissions can be approved"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Only PENDING submissions can be approved");
    }
}
