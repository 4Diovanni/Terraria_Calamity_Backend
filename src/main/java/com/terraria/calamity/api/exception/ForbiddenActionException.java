package com.terraria.calamity.api.exception;

/**
 * Lancada quando um usuario tenta uma acao que so o dono do recurso pode fazer
 * (ex.: cancelar a submissao de outro usuario). Mapeada para HTTP 403.
 */
public class ForbiddenActionException extends RuntimeException {
    public ForbiddenActionException(String message) {
        super(message);
    }
}
