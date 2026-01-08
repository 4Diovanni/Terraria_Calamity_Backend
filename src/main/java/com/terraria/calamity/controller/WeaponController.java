package com.terraria.calamity.controller;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.dto.WeaponResponseDTO;
import com.terraria.calamity.service.WeaponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para operações com Armas (Weapons)
 *
 * Demonstra como usar o enum Element separado em endpoints REST.
 * Inclui validação, conversão segura de tipos e tratamento de erros.
 */
@RestController
@RequestMapping("/api/v1/weapons")
@RequiredArgsConstructor
public class WeaponController {

    private final WeaponService weaponService;

    // ====================================================================
    // GET - Listar todas as armas
    // ====================================================================
    @GetMapping
    public ResponseEntity<List<WeaponResponseDTO>> getAllWeapons() {
        """
        GET /api/v1/weapons
        
        Retorna lista de TODAS as armas cadastradas.
        
        Resposta exemplo:
        [
          {
            "id": 1,
            "name": "Excalibur",
            "weaponClass": "MELEE",
            "element": "HOLY",
            "baseDamage": 44,
            "criticalChance": 8,
            "attacksPerTurn": 1.3,
            "range": 65,
            "rarity": 5,
            "price": 8000,
            "quality": 6,
            "abilities": "Dispara beams de luz sagrados",
            "description": "Espada legendária que dispara raios de luz..."
          },
          {...}
        ]
        """
        List<WeaponResponseDTO> weapons = weaponService.getAllWeapons();
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Obter arma por ID
    // ====================================================================
    @GetMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> getWeaponById(@PathVariable Long id) {
        """
        GET /api/v1/weapons/{id}
        Exemplo: GET /api/v1/weapons/1
        
        Retorna uma arma específica por ID.
        
        Resposta:
        {
          "id": 1,
          "name": "Excalibur",
          "weaponClass": "MELEE",
          "element": "HOLY",
          ...
        }
        
        Se não encontrar:
        404 Not Found
        """
        WeaponResponseDTO weapon = weaponService.getWeaponById(id);
        return ResponseEntity.ok(weapon);
    }

    // ====================================================================
    // GET - Filtrar armas por ELEMENTO (OPÇÃO 2: String com fallback)
    // ====================================================================
    /**
     * ✅ OPÇÃO 2 - RECOMENDADA
     *
     * Recebe elemento como STRING
     * Converte com fallback seguro usando Element.fromString()
     *
     * Vantagens:
     * - Seguro: client envia "FIRE", "fire", ou "Fire" → todos funcionam
     * - Sem erro 400: elemento inválido → fallback para NEUTRAL
     * - Melhor UX para API pública
     * - Fácil de usar no Postman
     */
    @GetMapping("/element/{element}")
    public ResponseEntity<List<WeaponResponseDTO>> findByElement(
            @PathVariable String element  // ✅ String ao invés de Element
    ) {
        """
        GET /api/v1/weapons/element/{element}
        
        Exemplos válidos:
        - GET /api/v1/weapons/element/FIRE
        - GET /api/v1/weapons/element/fire (converte automaticamente)
        - GET /api/v1/weapons/element/Fire (converte automaticamente)
        - GET /api/v1/weapons/element/BRIMSTONE
        - GET /api/v1/weapons/element/COSMIC
        - GET /api/v1/weapons/element/INEXISTENT (fallback para NEUTRAL)
        
        Retorna lista de armas com o elemento especificado.
        
        Resposta (elemento FIRE):
        [
          {
            "id": X,
            "name": "Meteor Staff",
            "element": "FIRE",
            ...
          },
          {
            "id": Y,
            "name": "Boomstick",
            "element": "FIRE",
            ...
          }
        ]
        """
        // ✅ Converte String para Element com fallback seguro
        Element elementEnum = Element.fromString(element);
        
        // Busca armas com este elemento
        List<WeaponResponseDTO> weapons = weaponService.findByElement(elementEnum);
        
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Filtrar armas por CLASSE
    // ====================================================================
    @GetMapping("/class/{weaponClass}")
    public ResponseEntity<List<WeaponResponseDTO>> findByWeaponClass(
            @PathVariable String weaponClass
    ) {
        """
        GET /api/v1/weapons/class/{weaponClass}
        
        Exemplos:
        - GET /api/v1/weapons/class/MELEE
        - GET /api/v1/weapons/class/RANGED
        - GET /api/v1/weapons/class/MAGE
        - GET /api/v1/weapons/class/SUMMON
        - GET /api/v1/weapons/class/ROGUE
        
        Retorna lista de armas de uma classe específica.
        """
        try {
            Weapon.WeaponClass weaponClassEnum = Weapon.WeaponClass.valueOf(
                weaponClass.toUpperCase()
            );
            List<WeaponResponseDTO> weapons = weaponService.findByWeaponClass(weaponClassEnum);
            return ResponseEntity.ok(weapons);
        } catch (IllegalArgumentException e) {
            // Classe inválida
            return ResponseEntity.badRequest().build();
        }
    }

    // ====================================================================
    // GET - Filtrar por RARIDADE
    // ====================================================================
    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<WeaponResponseDTO>> findByRarity(
            @PathVariable Integer rarity
    ) {
        """
        GET /api/v1/weapons/rarity/{rarity}
        
        Exemplos:
        - GET /api/v1/weapons/rarity/5 (lendárias)
        - GET /api/v1/weapons/rarity/3 (raras)
        - GET /api/v1/weapons/rarity/8 (supremas)
        
        Retorna lista de armas com a raridade especificada.
        """
        List<WeaponResponseDTO> weapons = weaponService.findByRarity(rarity);
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Buscar por NOME (com LIKE)
    // ====================================================================
    @GetMapping("/search")
    public ResponseEntity<List<WeaponResponseDTO>> searchByName(
            @RequestParam String name
    ) {
        """
        GET /api/v1/weapons/search?name={name}
        
        Exemplos:
        - GET /api/v1/weapons/search?name=Excalibur
        - GET /api/v1/weapons/search?name=sword
        - GET /api/v1/weapons/search?name=Calamity
        
        Busca case-insensitive por nome de arma.
        Usa LIKE para busca parcial.
        """
        List<WeaponResponseDTO> weapons = weaponService.searchByName(name);
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // POST - Criar nova arma
    // ====================================================================
    @PostMapping
    public ResponseEntity<WeaponResponseDTO> createWeapon(
            @RequestBody WeaponRequestDTO requestDTO
    ) {
        """
        POST /api/v1/weapons
        
        Body:
        {
          "name": "Nova Arma",
          "weaponClass": "MELEE",
          "element": "FIRE",
          "baseDamage": 50,
          "criticalChance": 5,
          "attacksPerTurn": 1.5,
          "range": 50,
          "rarity": 3,
          "price": 1000,
          "quality": 5,
          "abilities": "Queima inimigos",
          "description": "Uma arma que queima...",
          "imageUrl": "https://..."
        }
        
        Retorna:
        201 Created
        {
          "id": 100,
          "name": "Nova Arma",
          "element": "FIRE",
          ...
        }
        """
        WeaponResponseDTO created = weaponService.createWeapon(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ====================================================================
    // PUT - Atualizar arma existente
    // ====================================================================
    @PutMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> updateWeapon(
            @PathVariable Long id,
            @RequestBody WeaponRequestDTO requestDTO
    ) {
        """
        PUT /api/v1/weapons/{id}
        
        Exemplo: PUT /api/v1/weapons/1
        
        Body: (mesmo do POST com campos atualizados)
        
        Retorna:
        200 OK
        {
          "id": 1,
          "name": "Excalibur Melhorado",
          ...
        }
        """
        WeaponResponseDTO updated = weaponService.updateWeapon(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    // ====================================================================
    // DELETE - Deletar arma
    // ====================================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeapon(@PathVariable Long id) {
        """
        DELETE /api/v1/weapons/{id}
        
        Exemplo: DELETE /api/v1/weapons/1
        
        Retorna:
        204 No Content (sucesso)
        404 Not Found (arma não existe)
        """
        weaponService.deleteWeapon(id);
        return ResponseEntity.noContent().build();
    }

    // ====================================================================
    // REQUEST/RESPONSE DTOs
    // ====================================================================

    @lombok.Data
    @lombok.Builder
    public static class WeaponRequestDTO {
        private String name;
        private String weaponClass;  // String, conversão no service
        private String element;      // String, conversão com Element.fromString()
        private Integer baseDamage;
        private Integer criticalChance;
        private Double attacksPerTurn;
        private Integer range;
        private Integer rarity;
        private Integer price;
        private Integer quality;
        private String abilities;
        private String description;
        private String imageUrl;
    }
}
