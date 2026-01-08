package com.terraria.calamity.service;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço para operações específicas com Elementos de Armas
 *
 * Este serviço demonstra como usar o enum Element separado
 * que agora está em {@link com.terraria.calamity.domain.entity.Element}
 */
@Service
public class WeaponElementService {

    // ====================================================================
    // DEMONSTRAÇÕES DE USO DO ENUM ELEMENT SEPARADO
    // ====================================================================

    /**
     * Valida se uma arma tem um elemento válido
     */
    public boolean isValidElement(Weapon weapon) {
        return weapon.getElement() != null
            && weapon.getElement() != Element.NEUTRAL
            && weapon.getElement().hasEffect();
    }

    /**
     * Calcula bônus de dano baseado no elemento
     */
    public double calculateElementBonus(Weapon weapon) {
        Element element = weapon.getElement();

        // Bônus específicos por grupo de elemento
        if (element.isSupreme()) {
            return 2.5;  // 250% de bônus
        }

        if (element.isCalamity()) {
            return 1.5;  // 150% de bônus
        }

        if (element.isVanilla()) {
            return 1.2;  // 120% de bônus
        }

        return 1.0;  // Sem bônus
    }

    /**
     * Retorna a cor do elemento para UI (front-end)
     */
    public String getElementColor(Weapon weapon) {
        return weapon.getElement().getColor();
    }

    /**
     * Retorna nome legible do elemento
     */
    public String getElementDisplayName(Weapon weapon) {
        return weapon.getElement().getDisplayName();
    }

    /**
     * Retorna descrição completa do efeito
     */
    public String getElementDescription(Weapon weapon) {
        return weapon.getElement().getDescription();
    }

    /**
     * Filtra armas pelo tipo de elemento
     */
    public List<Weapon> filterByElementGroup(List<Weapon> weapons, String group) {
        return weapons.stream()
            .filter(weapon -> {
                Element element = weapon.getElement();

                return switch (group.toLowerCase()) {
                    case "vanilla" -> element.isVanilla();
                    case "calamity" -> element.isCalamity();
                    case "supreme" -> element.isSupreme();
                    default -> true;
                };
            })
            .collect(Collectors.toList());
    }

    /**
     * Filtra armas por elemento exato
     */
    public List<Weapon> filterByExactElement(List<Weapon> weapons, Element element) {
        return weapons.stream()
            .filter(weapon -> weapon.getElement() == element)
            .collect(Collectors.toList());
    }

    /**
     * Verifica compatibilidade de elementos para craft/combinação
     */
    public boolean areElementsCompatible(Weapon weapon1, Weapon weapon2) {
        Element elem1 = weapon1.getElement();
        Element elem2 = weapon2.getElement();

        // Elementos supremos são compatíveis com tudo
        if (elem1.isSupreme() || elem2.isSupreme()) {
            return true;
        }

        // Elementos do mesmo grupo são compatíveis
        if (elem1.isVanilla() && elem2.isVanilla()) {
            return true;
        }

        if (elem1.isCalamity() && elem2.isCalamity()) {
            return true;
        }

        return false;
    }

    /**
     * Verifica se uma arma é poderosa o suficiente para certo nível
     */
    public boolean isSuitableForLevel(Weapon weapon, int bossLevel) {
        Element element = weapon.getElement();

        // Require supreme elements para boss final
        if (bossLevel >= 10) {
            return element.isSupreme();
        }

        // Require Calamity para boss Calamity
        if (bossLevel >= 7) {
            return element.isCalamity() || element.isSupreme();
        }

        // Qualquer elemento válido para boss normal
        if (bossLevel >= 1) {
            return element != Element.NEUTRAL;
        }

        return true;
    }

    /**
     * Converte string do cliente para Element com fallback seguro
     */
    public Element parseElement(String elementString) {
        if (elementString == null || elementString.isBlank()) {
            return Element.NEUTRAL;
        }

        try {
            return Element.valueOf(elementString.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Se não encontrar, retorna NEUTRAL ao invés de errar
            return Element.NEUTRAL;
        }
    }

    /**
     * Retorna lista de todos os elementos disponíveis
     */
    public List<ElementInfoDTO> getAllElementsInfo() {
        return List.of(Element.values()).stream()
            .map(element -> ElementInfoDTO.builder()
                .name(element.name())
                .displayName(element.getDisplayName())
                .description(element.getDescription())
                .color(element.getColor())
                .hasEffect(element.hasEffect())
                .isVanilla(element.isVanilla())
                .isCalamity(element.isCalamity())
                .isSupreme(element.isSupreme())
                .build())
            .collect(Collectors.toList());
    }

    // ====================================================================
    // DTO INNER CLASS - Para retornar info de elementos
    // ====================================================================
    @lombok.Data
    @lombok.Builder
    public static class ElementInfoDTO {
        private String name;
        private String displayName;
        private String description;
        private String color;
        private boolean hasEffect;
        private boolean isVanilla;
        private boolean isCalamity;
        private boolean isSupreme;
    }
}
