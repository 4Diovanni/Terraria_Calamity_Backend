CREATE TABLE IF NOT EXISTS weapon_submissions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_by_id BIGINT NOT NULL REFERENCES users(id),
    target_weapon_id BIGINT REFERENCES weapons(id),
    rejection_reason TEXT,
    name VARCHAR(100) NOT NULL,
    weapon_class VARCHAR(50) NOT NULL,
    element VARCHAR(50) NOT NULL,
    base_damage INTEGER NOT NULL,
    critical_chance INTEGER NOT NULL,
    attacks_per_turn DOUBLE PRECISION NOT NULL,
    range INTEGER NOT NULL,
    rarity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    quality INTEGER NOT NULL,
    abilities TEXT,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weapon_submissions_status ON weapon_submissions(status);
CREATE INDEX idx_weapon_submissions_submitted_by ON weapon_submissions(submitted_by_id);
CREATE INDEX idx_weapon_submissions_target_weapon ON weapon_submissions(target_weapon_id);
