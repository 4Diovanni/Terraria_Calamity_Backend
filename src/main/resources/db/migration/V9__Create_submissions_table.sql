CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL,
    submission_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_by_id BIGINT NOT NULL REFERENCES users(id),
    target_entity_id BIGINT,
    payload JSONB NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_entity_type_status ON submissions(entity_type, status);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by_id);
CREATE INDEX idx_submissions_target_entity ON submissions(entity_type, target_entity_id);
