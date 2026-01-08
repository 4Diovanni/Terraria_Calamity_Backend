package com.terraria.calamity.domain.entity;

/**
 * Enum de Elementos de Armas - Terraria + Terraria Calamity Mod
 *
 * Representa todos os tipos de elementos e efeitos que as armas podem ter.
 * Cada elemento tem propriedades e efeitos especiais.
 *
 * 👀 GRUPOS:
 * - NEUTRO: Sem elemento especial
 * - VANILLA (Terraria): Fogo, Gelo, Trovão, Terra, Água, Vento, Natureza
 * - CALAMITY (Terraria Calamity Mod): Enxofre, Chamas Sagradas, Shadowflame, Astral, Praga, Destruidor de Deuses, Sulfúrico
 * - ESPECIAIS: Arcano, Elemental, Cósmico, Temporal, Abissal, Omni
 */
public enum Element {
    // ====================================================================
    // ELEMENTO NEUTRO - Sem Propriedade Especial
    // ====================================================================
    NEUTRAL(
        "Neutro",
        "Sem elemento especial. Dano puro.",
        "default",
        false
    ),

    // ====================================================================
    // TERRARIA VANILLA - ELEMENTOS CLÁSSICOS
    // ====================================================================
    FIRE(
        "Fogo",
        "Causa queimadura. Dano contínuo por 7 segundos. Afeta inimigos normalmente.",
        "fire",
        true
    ),
    ICE(
        "Gelo",
        "Congela inimigos, reduzindo sua velocidade. Efeito de desaceleração.",
        "ice",
        true
    ),
    LIGHTNING(
        "Trovão",
        "Causa descarga elétrica. Pode saltar entre inimigos próximos.",
        "lightning",
        true
    ),
    EARTH(
        "Terra",
        "Dano de terra. Aumenta peso e reduz movimento. Raro em armas.",
        "earth",
        true
    ),
    WATER(
        "Água",
        "Elemento aquático. Bônus em ambientes molhados. Raramente usado.",
        "water",
        true
    ),
    WIND(
        "Vento",
        "Elemento do vento. Aumenta velocidade do projétil. Knockback elevado.",
        "wind",
        true
    ),
    NATURE(
        "Natureza",
        "Elemento da natureza. Regeneração leve e crescimento vegetal.",
        "nature",
        true
    ),
    HOLY(
        "Sagrado",
        "Dano sagrado/divino. Muito efetivo contra inimigos sombrios e demoníacos. Cura aliados próximos.",
        "holy",
        true
    ),

    // ====================================================================
    // TERRARIA CALAMITY MOD - ELEMENTOS DO CALAMITY
    // ====================================================================
    BRIMSTONE(
        "Enxofre (Brimstone)",
        "Elemento sulfuroso do Calamity. Causa queimadura intensa e poluição. Muito tóxico.",
        "brimstone",
        true
    ),
    HOLY_FLAMES(
        "Chamas Sagradas (Holy Flames)",
        "Chamas divinas que purificam corrupção. Efetivo contra Providence. Regeneração para o jogador.",
        "holy_flames",
        true
    ),
    SHADOWFLAME(
        "Shadowflame",
        "Chamas sombrias que causam escuridão e dano contínuo. Reduz defesa inimiga.",
        "shadowflame",
        true
    ),
    ASTRAL(
        "Astral",
        "Poder das estrelas e do cosmos. Ignora defesa parcial. Projéteis homing.",
        "astral",
        true
    ),
    PLAGUE(
        "Praga (Plague)",
        "Veneno virulento que se espalha entre inimigos. Debilita significativamente.",
        "plague",
        true
    ),
    GOD_SLAYER(
        "Destruidor de Deuses (God Slayer)",
        "Poder absoluto que mata deuses. Resistência a todos os elementos. Dano cataclísmico.",
        "god_slayer",
        true
    ),
    SULPHURIC(
        "Sulfúrico (Sulphuric)",
        "Ácido sulfúrico que corrói armaduras. Reduz resistência do inimigo significativamente.",
        "sulphuric",
        true
    ),

    // ====================================================================
    // ELEMENTOS ESPECIAIS/HÍBRIDOS
    // ====================================================================
    SHADOW(
        "Sombra",
        "Dano obscuro e sombrio. Associado à corrupção. Efeito de escuridão.",
        "shadow",
        true
    ),
    BLOOD(
        "Sangue",
        "Sangue corrompido. Causa sangramento contínuo. Vida roubada do inimigo.",
        "blood",
        true
    ),
    CRYSTAL(
        "Cristal",
        "Cristais que ricocheteiam. Dano mágico puro com penetração.",
        "crystal",
        true
    ),
    ARCANE(
        "Arcano",
        "Magia arcana pura. Ignora enchantments normais. Dano mágico elevado.",
        "arcane",
        true
    ),
    ELEMENTAL(
        "Elemental",
        "Combinação de múltiplos elementos (Fogo + Gelo + Trovão). Efeitos variados.",
        "elemental",
        true
    ),
    COSMIC(
        "Cósmico",
        "Poder universal dos cosmos. Dano absoluto que transcende elementos normais. Aura cósmica.",
        "cosmic",
        true
    ),
    TEMPORAL(
        "Temporal",
        "Controle do tempo. Distorção temporal que afeta velocidade inimiga.",
        "temporal",
        true
    ),
    ABYSSAL(
        "Abissal",
        "Profundezas do abismo. Pressão absoluta e dano desconhecido. Summoning entities.",
        "abyssal",
        true
    ),
    TOXIC(
        "Tóxico",
        "Veneno puro que se espalha em nuvem. Debilita defensas e velocidade.",
        "toxic",
        true
    ),
    OMNI(
        "Omni (Supremo)",
        "Todos os elementos em um. Poder infinito que combina tudo. Arma final suprema.",
        "omni",
        true
    ),
    MAGIC(
        "Mágico",
        "Magia geral. Dano mágico puro sem elemento específico.",
        "magic",
        true
    );

    private final String displayName;
    private final String description;
    private final String effectKey;
    private final boolean hasEffect;

    /**
     * Construtor do Enum
     *
     * @param displayName Nome exibível do elemento
     * @param description Descrição do efeito e propriedades
     * @param effectKey   Chave para efeito visual/sonoro
     * @param hasEffect   Se tem efeito especial ou não
     */
    Element(String displayName, String description, String effectKey, boolean hasEffect) {
        this.displayName = displayName;
        this.description = description;
        this.effectKey = effectKey;
        this.hasEffect = hasEffect;
    }

    // ====================================================================
    // GETTERS
    // ====================================================================

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getEffectKey() {
        return effectKey;
    }

    public boolean hasEffect() {
        return hasEffect;
    }

    // ====================================================================
    // MÉTODOS AUXILIARES
    // ====================================================================

    /**
     * Obtém elemento por nome (case-insensitive)
     */
    public static Element fromString(String value) {
        if (value == null || value.isEmpty()) {
            return NEUTRAL;
        }
        try {
            return Element.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NEUTRAL;
        }
    }

    /**
     * Verifica se é elemento Vanilla do Terraria
     */
    public boolean isVanilla() {
        return this == FIRE || this == ICE || this == LIGHTNING ||
               this == EARTH || this == WATER || this == WIND ||
               this == NATURE || this == HOLY || this == MAGIC;
    }

    /**
     * Verifica se é elemento do Calamity Mod
     */
    public boolean isCalamity() {
        return this == BRIMSTONE || this == HOLY_FLAMES || this == SHADOWFLAME ||
               this == ASTRAL || this == PLAGUE || this == GOD_SLAYER ||
               this == SULPHURIC || this == TEMPORAL || this == ABYSSAL;
    }

    /**
     * Verifica se é elemento supremo/final
     */
    public boolean isSupreme() {
        return this == COSMIC || this == OMNI || this == GOD_SLAYER;
    }

    /**
     * Retorna a cor do elemento para UI (CSS)
     */
    public String getColor() {
        return switch (this) {
            case FIRE -> "#FF6B35";
            case ICE -> "#4DB8FF";
            case LIGHTNING -> "#FFD700";
            case EARTH -> "#8B4513";
            case WATER -> "#1E90FF";
            case WIND -> "#87CEEB";
            case NATURE -> "#228B22";
            case HOLY -> "#FFD700";
            case BRIMSTONE -> "#FF4500";
            case HOLY_FLAMES -> "#FFD700";
            case SHADOWFLAME -> "#2F4F4F";
            case ASTRAL -> "#9932CC";
            case PLAGUE -> "#32CD32";
            case GOD_SLAYER -> "#DC143C";
            case SULPHURIC -> "#ADFF2F";
            case SHADOW -> "#2F2F2F";
            case BLOOD -> "#8B0000";
            case CRYSTAL -> "#00CED1";
            case ARCANE -> "#7B68EE";
            case ELEMENTAL -> "#FF69B4";
            case COSMIC -> "#4169E1";
            case TEMPORAL -> "#00BFFF";
            case ABYSSAL -> "#191970";
            case TOXIC -> "#00FF00";
            case OMNI -> "#FF1493";
            case MAGIC -> "#9370DB";
            case NEUTRAL -> "#808080";
        };
    }
}
