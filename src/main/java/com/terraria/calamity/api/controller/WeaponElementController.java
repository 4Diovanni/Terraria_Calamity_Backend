package com.terraria.calamity.api.controller;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.application.service.WeaponElementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para endpoints relacionados a Elementos de Armas
 *
 * Demonstra como usar o enum Element separado em endpoints REST
 * Inclui listagem de elementos, validação, cálculos de bônus, etc.
 */
@RestController
@RequestMapping("/api/v1/elements")
@RequiredArgsConstructor
public class WeaponElementController {

    private final WeaponElementService elementService;

    // ====================================================================
    // ENDPOINT: Listar todos os elementos com informações
    // ====================================================================
    @GetMapping
    public ResponseEntity<List<WeaponElementService.ElementInfoDTO>> getAllElementsInfo() {
//        """
//        GET /api/v1/elements
//
//        Retorna lista de TODOS os elementos disponíveis com:
//        - Nome interno (FIRE, BRIMSTONE, etc)
//        - Nome legible (Fogo, Enxofre, etc)
//        - Descrição de efeito
//        - Cor para UI
//        - Informações de grupo (Vanilla, Calamity, Supreme)
//
//        Resposta exemplo:
//        [
//          {
//            "name": "FIRE",
//            "displayName": "Fogo",
//            "description": "Causa queimadura...",
//            "color": "#FF6B35",
//            "hasEffect": true,
//            "isVanilla": true,
//            "isCalamity": false,
//            "isSupreme": false
//          },
//          {...}
//        ]
//        """
        List<WeaponElementService.ElementInfoDTO> elements = elementService.getAllElementsInfo();
        return ResponseEntity.ok(elements);
    }

    // ====================================================================
    // ENDPOINT: Obter informações de um elemento específico
    // ====================================================================
    @GetMapping("/{elementName}")
    public ResponseEntity<WeaponElementService.ElementInfoDTO> getElementInfo(
            @PathVariable String elementName
    ) {
//        """
//        GET /api/v1/elements/{elementName}
//        Exemplo: GET /api/v1/elements/FIRE
//
//        Retorna informações detalhadas de um elemento específico.
//        Se não existir, retorna NEUTRAL.
//        """
        Element element = elementService.parseElement(elementName);
        
        WeaponElementService.ElementInfoDTO info = WeaponElementService.ElementInfoDTO.builder()
            .name(element.name())
            .displayName(element.getDisplayName())
            .description(element.getDescription())
            .color(element.getColor())
            .hasEffect(element.hasEffect())
            .isVanilla(element.isVanilla())
            .isCalamity(element.isCalamity())
            .isSupreme(element.isSupreme())
            .build();
            
        return ResponseEntity.ok(info);
    }

    // ====================================================================
    // ENDPOINT: Listar elementos de um grupo específico
    // ====================================================================
    @GetMapping("/group/{group}")
    public ResponseEntity<List<String>> getElementsByGroup(
            @PathVariable String group
    ) {
//        """
//        GET /api/v1/elements/group/{group}
//        Exemplos:
//        - GET /api/v1/elements/group/vanilla
//        - GET /api/v1/elements/group/calamity
//        - GET /api/v1/elements/group/supreme
//
//        Retorna nomes dos elementos de um grupo específico.
//        """
        List<String> elementNames = List.of(Element.values()).stream()
            .filter(element -> {
                return switch (group.toLowerCase()) {
                    case "vanilla" -> element.isVanilla();
                    case "calamity" -> element.isCalamity();
                    case "supreme" -> element.isSupreme();
                    default -> true;
                };
            })
            .map(Element::name)
            .toList();
            
        return ResponseEntity.ok(elementNames);
    }

    // ====================================================================
    // ENDPOINT: Validar elemento
    // ====================================================================
    @PostMapping("/validate")
    public ResponseEntity<ElementValidationResponse> validateElement(
            @RequestBody ElementValidationRequest request
    ) {
//        """
//        POST /api/v1/elements/validate
//
//        Body:
//        {
//          "elementName": "FIRE"
//        }
//
//        Valida se um elemento existe e é válido.
//        """
        Element element = elementService.parseElement(request.getElementName());
        
        ElementValidationResponse response = ElementValidationResponse.builder()
            .elementName(element.name())
            .displayName(element.getDisplayName())
            .isValid(element != Element.NEUTRAL || request.getElementName().equalsIgnoreCase("NEUTRAL"))
            .hasEffect(element.hasEffect())
            .build();
            
        return ResponseEntity.ok(response);
    }

    // ====================================================================
    // ENDPOINT: Calcular bônus de elemento para arma
    // ====================================================================
    @PostMapping("/bonus")
    public ResponseEntity<ElementBonusResponse> calculateElementBonus(
            @RequestBody ElementBonusRequest request
    ) {
//        """
//        POST /api/v1/elements/bonus
//
//        Body:
//        {
//          "baseDamage": 50,
//          "elementName": "FIRE"
//        }
//
//        Calcula o dano total com bônus de elemento.
//        """
        Element element = elementService.parseElement(request.getElementName());
        double bonus = elementService.calculateElementBonus(
            Weapon.builder().element(element).build()
        );
        
        double finalDamage = request.getBaseDamage() * bonus;
        
        ElementBonusResponse response = ElementBonusResponse.builder()
            .baseDamage(request.getBaseDamage())
            .element(element.name())
            .elementDisplayName(element.getDisplayName())
            .bonusMultiplier(bonus)
            .finalDamage((int) finalDamage)
            .bonusPercentage(Math.round((bonus - 1) * 100) + "%")
            .build();
            
        return ResponseEntity.ok(response);
    }

    // ====================================================================
    // ENDPOINT: Verificar compatibilidade de elementos
    // ====================================================================
    @PostMapping("/compatibility")
    public ResponseEntity<ElementCompatibilityResponse> checkCompatibility(
            @RequestBody ElementCompatibilityRequest request
    ) {
//        """
//        POST /api/v1/elements/compatibility
//
//        Body:
//        {
//          "element1": "FIRE",
//          "element2": "BRIMSTONE"
//        }
//
//        Verifica se dois elementos são compatíveis para craft/combinação.
//        """
        Element elem1 = elementService.parseElement(request.getElement1());
        Element elem2 = elementService.parseElement(request.getElement2());
        
        Weapon weapon1 = Weapon.builder().element(elem1).build();
        Weapon weapon2 = Weapon.builder().element(elem2).build();
        
        boolean compatible = elementService.areElementsCompatible(weapon1, weapon2);
        
        ElementCompatibilityResponse response = ElementCompatibilityResponse.builder()
            .element1(elem1.name())
            .element2(elem2.name())
            .isCompatible(compatible)
            .reason(compatible ? "Elementos compatíveis para combinação" : "Elementos incompátíveis")
            .build();
            
        return ResponseEntity.ok(response);
    }

    // ====================================================================
    // REQUEST/RESPONSE DTOs
    // ====================================================================

    @lombok.Data
    @lombok.Builder
    public static class ElementValidationRequest {
        private String elementName;
    }

    @lombok.Data
    @lombok.Builder
    public static class ElementValidationResponse {
        private String elementName;
        private String displayName;
        private boolean isValid;
        private boolean hasEffect;
    }

    @lombok.Data
    @lombok.Builder
    public static class ElementBonusRequest {
        private Integer baseDamage;
        private String elementName;
    }

    @lombok.Data
    @lombok.Builder
    public static class ElementBonusResponse {
        private Integer baseDamage;
        private String element;
        private String elementDisplayName;
        private double bonusMultiplier;
        private Integer finalDamage;
        private String bonusPercentage;
    }

    @lombok.Data
    @lombok.Builder
    public static class ElementCompatibilityRequest {
        private String element1;
        private String element2;
    }

    @lombok.Data
    @lombok.Builder
    public static class ElementCompatibilityResponse {
        private String element1;
        private String element2;
        private boolean isCompatible;
        private String reason;
    }
}
