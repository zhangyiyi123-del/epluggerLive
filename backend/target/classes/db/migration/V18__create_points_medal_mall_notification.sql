-- 用户故事 5：积分体系 — 用户积分、流水、勋章、商品、订单、通知
CREATE TABLE IF NOT EXISTS user_points (
    user_id BIGINT NOT NULL PRIMARY KEY,
    total_earned INT NOT NULL DEFAULT 0 COMMENT '累计获取（用于等级）',
    total_used INT NOT NULL DEFAULT 0,
    available INT NOT NULL DEFAULT 0 COMMENT '可用积分',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_user_points_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '用户积分汇总';

CREATE TABLE IF NOT EXISTS points_record (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'exercise-checkin|exchange|...',
    amount INT NOT NULL COMMENT '正数获取负数消耗',
    balance_after INT NOT NULL COMMENT '变动后可用余额',
    description VARCHAR(500) DEFAULT NULL,
    source_id VARCHAR(100) DEFAULT NULL COMMENT '关联打卡/动态/订单ID',
    expires_at DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_points_record_user_created (user_id, created_at),
    CONSTRAINT fk_points_record_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '积分流水';

CREATE TABLE IF NOT EXISTS user_medal (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    medal_type VARCHAR(50) NOT NULL COMMENT 'sports-rookie|...',
    obtained_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_user_medal (user_id, medal_type),
    INDEX idx_user_medal_user (user_id),
    CONSTRAINT fk_user_medal_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '用户获得勋章';

CREATE TABLE IF NOT EXISTS product (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'physical' COMMENT 'physical|virtual|honor',
    points_cost INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    warning_stock INT NOT NULL DEFAULT 5,
    image VARCHAR(500) DEFAULT NULL COMMENT '图标或图片URL',
    status VARCHAR(20) NOT NULL DEFAULT 'available' COMMENT 'available|low-stock|out-of-stock|offline',
    min_level INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_product_status (status),
    INDEX idx_product_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '积分商品';

CREATE TABLE IF NOT EXISTS mall_order (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    points_spent INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending|delivered|completed|cancelled',
    redeemed_at DATETIME(6) NOT NULL,
    delivered_at DATETIME(6) DEFAULT NULL,
    completed_at DATETIME(6) DEFAULT NULL,
    pickup_code VARCHAR(50) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_mall_order_user (user_id),
    INDEX idx_mall_order_created (created_at),
    CONSTRAINT fk_mall_order_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_mall_order_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '积分订单';

CREATE TABLE IF NOT EXISTS notification (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '接收人',
    type VARCHAR(30) NOT NULL COMMENT 'post_like|comment|mention',
    related_post_id BIGINT DEFAULT NULL,
    related_comment_id BIGINT DEFAULT NULL,
    related_user_id BIGINT DEFAULT NULL COMMENT '触发人',
    content_summary VARCHAR(500) DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_notification_user_read_created (user_id, is_read, created_at),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '消息通知';
