package com.terraria.calamity.api.exception;

/**
 * Lancada quando um recurso unico (ex.: e-mail ou username ja cadastrado)
 * viola a restricao de unicidade. Mapeada para HTTP 409 no GlobalExceptionHandler.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
