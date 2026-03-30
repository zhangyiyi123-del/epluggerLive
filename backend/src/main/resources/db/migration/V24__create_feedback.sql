-- 用户问题反馈登记
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL COMMENT '提交人，未登录可为空',
    content TEXT NOT NULL COMMENT '反馈正文',
    contact VARCHAR(128) NULL COMMENT '选填联系方式',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_feedback_created (created_at),
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '问题反馈';
