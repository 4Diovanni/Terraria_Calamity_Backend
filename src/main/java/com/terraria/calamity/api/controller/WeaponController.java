package com.terraria.calamity.api.controller;

import com.terraria.calamity.domain.entity.Element;
import com.terraria.calamity.domain.entity.Weapon;
import com.terraria.calamity.domain.dto.WeaponResponseDTO;
import com.terraria.calamity.application.service.WeaponService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para operações com Armas (Weapons)
 *
 * Fornece endpoints CRUD completos para gerenciar armas.
 * Demonstra boas práticas:
 * - Dependency Injection correto com Lombok @RequiredArgsConstructor
 * - Nomes de variáveis em camelCase
 * - Tratamento de tipos com conversão segura (String → Element)
 * - Documentação clara em cada endpoint
 */
@RestController
@RequestMapping("/api/v1/weapons")
@RequiredArgsConstructor
public class WeaponController {

    private final WeaponService weaponService;

    // ====================================================================
    // GET - Listar todas as armas
    // ====================================================================
    /**
     * GET /api/v1/weapons
     *
     * Retorna lista de TODAS as armas cadastradas.
     *
     * @return ResponseEntity com lista de WeaponResponseDTO
     *
     * Exemplo de resposta:
     * [
     *   {
     *     "id": 1,
     *     "name": "Excalibur",
     *     "weaponClass": "MELEE",
     *     "element": "HOLY",
     *     "baseDamage": 44,
     *     "criticalChance": 8,
     *     "attacksPerTurn": 1.3,
     *     "range": 65,
     *     "rarity": 5,
     *     "price": 8000,
     *     "quality": 6
     *   }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<WeaponResponseDTO>> getAllWeapons() {
        List<WeaponResponseDTO> weapons = weaponService.getAllWeapons();
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Obter arma por ID
    // ====================================================================
    /**
     * GET /api/v1/weapons/{id}
     *
     * Retorna uma arma específica por ID.
     *
     * @param id ID da arma a buscar
     * @return ResponseEntity com WeaponResponseDTO
     *
     * Resposta de sucesso (200 OK):
     * {
     *   "id": 1,
     *   "name": "Excalibur",
     *   ...
     * }
     *
     * Se não encontrar: 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> getWeaponById(@PathVariable Long id) {
        WeaponResponseDTO weapon = weaponService.getWeaponById(id);
        return ResponseEntity.ok(weapon);
    }

    // ====================================================================
    // GET - Filtrar armas por ELEMENTO
    // ====================================================================
    /**
     * GET /api/v1/weapons/element/{element}
     *
     * Retorna lista de armas com um elemento específico.
     * Implementa conversão segura de String → Element com fallback.
     *
     * @param element Nome do elemento (case-insensitive)
     * @return ResponseEntity com lista de WeaponResponseDTO
     *
     * Exemplos de uso:
     * - GET /api/v1/weapons/element/FIRE        → Retorna armas de fogo
     * - GET /api/v1/weapons/element/fire        → Funciona (auto-uppercase)
     * - GET /api/v1/weapons/element/Fire        → Funciona (auto-uppercase)
     * - GET /api/v1/weapons/element/BRIMSTONE   → Retorna armas enxofre
     * - GET /api/v1/weapons/element/INEXISTENT  → Retorna vazio (fallback NEUTRAL)
     */
    @GetMapping("/element/{element}")
    public ResponseEntity<List<WeaponResponseDTO>> findByElement(
            @PathVariable String element
    ) {
        // ✅ Conversão segura: String → Element com fallback NEUTRAL
        Element elementEnum = Element.fromString(element);
        List<WeaponResponseDTO> weapons = weaponService.findByElement(elementEnum);
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Filtrar armas por CLASSE
    // ====================================================================
    /**
     * GET /api/v1/weapons/class/{weaponClass}
     *
     * Retorna lista de armas de uma classe específica.
     *
     * @param weaponClass Classe da arma (MELEE, RANGED, MAGE, SUMMON, ROGUE)
     * @return ResponseEntity com lista de WeaponResponseDTO
     *
     * Exemplos:
     * - GET /api/v1/weapons/class/MELEE
     * - GET /api/v1/weapons/class/RANGED
     * - GET /api/v1/weapons/class/MAGE
     *
     * Se classe inválida: 400 Bad Request
     */
    @GetMapping("/class/{weaponClass}")
    public ResponseEntity<List<WeaponResponseDTO>> findByWeaponClass(
            @PathVariable String weaponClass
    ) {
        try {
            Weapon.WeaponClass classEnum = Weapon.WeaponClass.valueOf(
                    weaponClass.toUpperCase()
            );
            List<WeaponResponseDTO> weapons = weaponService.findByWeaponClass(classEnum);
            return ResponseEntity.ok(weapons);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ====================================================================
    // GET - Filtrar por RARIDADE
    // ====================================================================
    /**
     * GET /api/v1/weapons/rarity/{rarity}
     *
     * Retorna lista de armas com uma raridade específica.
     *
     * @param rarity Nível de raridade (1-10, 5 = lendária, 8+ = suprema)
     * @return ResponseEntity com lista de WeaponResponseDTO
     *
     * Exemplos:
     * - GET /api/v1/weapons/rarity/5  → Lendárias
     * - GET /api/v1/weapons/rarity/3  → Raras
     * - GET /api/v1/weapons/rarity/8  → Supremas
     */
    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<WeaponResponseDTO>> findByRarity(
            @PathVariable Integer rarity
    ) {
        List<WeaponResponseDTO> weapons = weaponService.findByRarity(rarity);
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // GET - Buscar por NOME (com busca parcial)
    // ====================================================================
    /**
     * GET /api/v1/weapons/search?name={name}
     *
     * Busca armas por nome usando busca parcial (LIKE).
     * Case-insensitive.
     *
     * @param name Parte do nome da arma
     * @return ResponseEntity com lista de WeaponResponseDTO
     *
     * Exemplos:
     * - GET /api/v1/weapons/search?name=Excalibur  → Busca exata
     * - GET /api/v1/weapons/search?name=sword      → Busca parcial
     * - GET /api/v1/weapons/search?name=Calamity   → Busca parcial
     */
    @GetMapping("/search")
    public ResponseEntity<List<WeaponResponseDTO>> searchByName(
            @RequestParam String name
    ) {
        List<WeaponResponseDTO> weapons = weaponService.searchByName(name);
        return ResponseEntity.ok(weapons);
    }

    // ====================================================================
    // POST - Criar nova arma
    // ====================================================================
    /**
     * POST /api/v1/weapons
     *
     * Cria uma nova arma com os dados fornecidos.
     *
     * @param requestDTO Dados da arma a criar
     * @return ResponseEntity com 201 Created e dados da arma criada
     *
     * Exemplo de body:
     * {
     *   "name": "Nova Arma",
     *   "weaponClass": "MELEE",
     *   "element": "FIRE",
     *   "baseDamage": 50,
     *   "criticalChance": 5,
     *   "attacksPerTurn": 1.5,
     *   "range": 50,
     *   "rarity": 3,
     *   "price": 1000,
     *   "quality": 5
     * }
     *
     * Resposta (201 Created):
     * {
     *   "id": 100,
     *   "name": "Nova Arma",
     *   "element": "FIRE",
     *   ...
     * }
     */
    @PostMapping
    public ResponseEntity<WeaponResponseDTO> createWeapon(
            @RequestBody WeaponRequestDTO requestDTO
    ) {
        WeaponResponseDTO created = weaponService.createWeapon(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ====================================================================
    // PUT - Atualizar arma existente
    // ====================================================================
    /**
     * PUT /api/v1/weapons/{id}
     *
     * Atualiza uma arma existente com novos dados.
     *
     * @param id ID da arma a atualizar
     * @param requestDTO Novos dados da arma
     * @return ResponseEntity com 200 OK e dados atualizados
     *
     * Exemplo: PUT /api/v1/weapons/1
     *
     * Body: (mesmo do POST com campos atualizados)
     *
     * Resposta (200 OK):
     * {
     *   "id": 1,
     *   "name": "Excalibur Melhorado",
     *   ...
     * }
     *
     * Se não encontrar: 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<WeaponResponseDTO> updateWeapon(
            @PathVariable Long id,
            @RequestBody WeaponRequestDTO requestDTO
    ) {
        WeaponResponseDTO updated = weaponService.updateWeapon(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    // ====================================================================
    // DELETE - Deletar arma
    // ====================================================================
    /**
     * DELETE /api/v1/weapons/{id}
     *
     * Deleta uma arma existente.
     *
     * @param id ID da arma a deletar
     * @return ResponseEntity com 204 No Content
     *
     * Exemplo: DELETE /api/v1/weapons/1
     *
     * Resposta (204 No Content): Sucesso (sem body)
     * Resposta (404 Not Found): Arma não existe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeapon(@PathVariable Long id) {
        weaponService.deleteWeapon(id);
        return ResponseEntity.noContent().build();
    }

    // ====================================================================
    // REQUEST/RESPONSE DTOs
    // ====================================================================

    /**
     * DTO para requisições de criação/atualização de armas
     */
    @Data
    @Builder
    public static class WeaponRequestDTO {
        private String name;                 // Nome da arma
        private String weaponClass;          // Classe: MELEE, RANGED, MAGE, SUMMON, ROGUE
        private String element;              // Elemento: FIRE, ICE, LIGHTNING, etc
        private Integer baseDamage;          // Dano base
        private Integer criticalChance;      // Chance de crítico (0-100)
        private Double attacksPerTurn;       // Ataques por turno
        private Integer range;               // Alcance
        private Integer rarity;              // Raridade (1-10)
        private Integer price;               // Preço em moeda
        private Integer quality;             // Qualidade da crafting (1-10)
        private String abilities;            // Descrição de habilidades
        private String description;          // Descrição completa
        private String imageUrl;             // URL da imagem
    }
}
