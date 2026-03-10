-- 补建缺失表：若库中曾用旧版 V5 迁移（未含 check_in_attachment），此处补建。约束名加后缀避免与已有约束重名。
CREATE TABLE IF NOT EXISTS check_in_attachment (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    check_in_record_id BIGINT NOT NULL COMMENT '所属打卡记录',
    url VARCHAR(512) NOT NULL COMMENT '文件访问 URL',
    type VARCHAR(20) NOT NULL DEFAULT 'image' COMMENT 'image | screenshot',
    uploaded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_attachment_record (check_in_record_id),
    CONSTRAINT fk_attachment_record_v9 FOREIGN KEY (check_in_record_id) REFERENCES check_in_record(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '运动打卡佐证附件';
