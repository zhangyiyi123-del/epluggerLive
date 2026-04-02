ALTER TABLE user
    ADD COLUMN employment_status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' AFTER sso_id,
    ADD COLUMN last_synced_at TIMESTAMP NULL AFTER employment_status;

CREATE INDEX idx_user_employment_status ON user (employment_status);
CREATE INDEX idx_user_last_synced_at ON user (last_synced_at);
