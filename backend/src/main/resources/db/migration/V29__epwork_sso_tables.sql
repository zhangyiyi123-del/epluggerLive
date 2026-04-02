-- epWorkApp SSO：nonce 防重放、一次性 exchange code
CREATE TABLE epwork_sso_nonce (
    nonce VARCHAR(128) NOT NULL PRIMARY KEY,
    consumed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '已消费的外链 token nonce，防重放';

CREATE TABLE epwork_sso_exchange_code (
    code VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at DATETIME(6) NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_sso_exchange_user FOREIGN KEY (user_id) REFERENCES user (id),
    INDEX idx_sso_exchange_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT 'SSO 落地后短时交换码，换取圈内 JWT';
