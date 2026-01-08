package com.terraria.calamity.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity que representa uma arma no jogo Terraria + Calamity Mod
 *
 * Mapeia para a tabela 'weapons' no banco de dados.
 * Contém toda a informação da arma: nome, classe, elemento, dano, etc.
 *
 * 👀 OBSERVAÇÃO:
 * - Utiliza {@link Element} como enum separado (em package raiz)
 * - Utiliza {@link WeaponClass} como enum interno (específico desta entidade)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "weapons")
public class Weapon extends BaseEntity {
    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "Class cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeaponClass weaponClass;

    @NotNull(message = "Element cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Element element;

    @NotNull(message = "Base damage cannot be null")
    @Min(1)
    @Column(nullable = false)
    private Integer baseDamage;

    @Min(1)
    @Max(20)
    @Column(nullable = false)
    private Integer criticalChance;

    @NotNull(message = "Attack speed cannot be null")
    @Min(1)
    @Column(nullable = false)
    private Double attacksPerTurn;

    @Min(0)
    @Column(nullable = false)
    private Integer range;

    @NotNull(message = "Rarity cannot be null")
    @Min(-1)
    @Max(17)
    @Column(nullable = false)
    private Integer rarity;

    @Min(0)
    @Column(nullable = false)
    private Integer price;

    @Min(0)
    @Max(10)
    @Column(nullable = false)
    private Integer quality;

    @Column(columnDefinition = "TEXT")
    private String abilities;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;

    // ====================================================================
    // NESTED ENUM - Classe da Arma (MELEE, RANGED, MAGE, SUMMON, ROGUE)
    // ====================================================================
    /**
     * Enum que define a classe/tipo da arma.
     * Específico desta entidade pois não é reutilizado em outraséticas.
     */
    public enum WeaponClass {
        MELEE,    // Combate próximo (espadas, machados)
        RANGED,   // Combate à distância (arcos, rifles)
        MAGE,     // Mágico (varinhas, cajados, livros)
        SUMMON,   // Convocação (cajados de minions)
        ROGUE     // Rogue - classe exclusiva Calamity (facas, shurikens)
    }

    // ====================================================================
    // REFERÜNCIA AO ENUM SEPARADO - Elemento da Arma
    // ====================================================================
    // 👀 O enum Element agora está em arquivo separado:
    //    com.terraria.calamity.domain.entity.Element
    //
    // Beneficios:
    // ✅ Reutilizável em outras entidades (Inimigos, Habilidades, etc)
    // ✅ Más fácil de manter
    // ✅ Lógica de elementos centralizada
    // ✅ Métodos auxiliares disponíveis (getColor(), isVanilla(), etc)
    //
    // Uso na classe:
    //   @Enumerated(EnumType.STRING)
    //   private Element element;  // Já importado no topo
    //
    // Uso em queries/lógica:
    //   if (weapon.getElement() == Element.FIRE) { ... }
    //   if (weapon.getElement().isCalamity()) { ... }
    //   Color color = weapon.getElement().getColor();
}
