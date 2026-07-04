package com.terraria.calamity.api.exception;

/**
 * Lancada ao tentar deletar um recurso que ainda esta referenciado por outro
 * (ex.: uma Weapon alvo de uma WeaponSubmission de UPDATE). Mapeada para HTTP 409.
 */
public class ResourceInUseException extends RuntimeException {
    public ResourceInUseException(String message) {
        super(message);
    }
}
