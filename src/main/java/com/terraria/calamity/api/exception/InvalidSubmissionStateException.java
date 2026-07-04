package com.terraria.calamity.api.exception;

/**
 * Lancada ao tentar aprovar/rejeitar/cancelar uma WeaponSubmission que nao
 * esta mais PENDING. Mapeada para HTTP 409.
 */
public class InvalidSubmissionStateException extends RuntimeException {
    public InvalidSubmissionStateException(String message) {
        super(message);
    }
}
