-- User table for EPlugger (phase 2)
-- 密码加密存储；支持手机号/SSO 查询
CREATE TABLE `user` (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '姓名',
    avatar VARCHAR(512) DEFAULT NULL COMMENT '头像 URL',
    department VARCHAR(100) DEFAULT NULL COMMENT '部门',
    position VARCHAR(100) DEFAULT NULL COMMENT '岗位',
    password_hash VARCHAR(255) DEFAULT NULL COMMENT '密码哈希',
    sso_id VARCHAR(255) DEFAULT NULL COMMENT 'SSO 外部标识',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_phone UNIQUE (phone),
    INDEX idx_user_sso_id (sso_id(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '用户表';
