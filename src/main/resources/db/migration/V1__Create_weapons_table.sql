CREATE TABLE IF NOT EXISTS weapons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    weapon_class VARCHAR(50) NOT NULL,
    element VARCHAR(50) NOT NULL,
    base_damage INTEGER NOT NULL,
    critical_chance INTEGER NOT NULL CHECK (critical_chance >= 1 AND critical_chance <= 20),
    attacks_per_turn DOUBLE PRECISION NOT NULL,
    range INTEGER NOT NULL,
    rarity INTEGER NOT NULL CHECK (rarity >= -1 AND rarity <= 17),
    price INTEGER NOT NULL,
    quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 10),
    abilities TEXT,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weapon_class ON weapons(weapon_class);
CREATE INDEX idx_weapon_element ON weapons(element);
CREATE INDEX idx_weapon_rarity ON weapons(rarity);
CREATE INDEX idx_weapon_name ON weapons(name);
