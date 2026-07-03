CREATE TABLE IF NOT EXISTS armors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    armor_class VARCHAR(20) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    total_defense INTEGER NOT NULL,
    image_url VARCHAR(500),
    markdown_content TEXT,
    flavor_text VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS armor_pieces (
    id BIGSERIAL PRIMARY KEY,
    armor_id BIGINT NOT NULL REFERENCES armors(id) ON DELETE CASCADE,
    slot VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    defense INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_armor_pieces_armor_slot UNIQUE (armor_id, slot)
);

CREATE INDEX idx_armors_armor_class ON armors(armor_class);
CREATE INDEX idx_armors_rarity ON armors(rarity);
CREATE INDEX idx_armor_pieces_armor_id ON armor_pieces(armor_id);
