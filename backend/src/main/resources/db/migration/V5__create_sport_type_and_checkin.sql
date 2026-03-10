-- 运动打卡：运动类型、打卡记录、佐证附件（用户故事 2）
-- sport_type 供前端下拉与展示
CREATE TABLE sport_type (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '类型标识，如 running',
    name VARCHAR(100) NOT NULL COMMENT '显示名称',
    icon VARCHAR(50) NOT NULL DEFAULT '' COMMENT '图标标识或 emoji',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    is_enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_sport_type_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '运动类型';

-- 运动打卡记录
CREATE TABLE check_in_record (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户 ID',
    sport_type_id VARCHAR(50) NOT NULL COMMENT '运动类型 ID',
    duration INT NOT NULL COMMENT '时长（与 duration_unit 配合）',
    duration_unit VARCHAR(20) NOT NULL DEFAULT 'minute' COMMENT 'minute | hour',
    distance DECIMAL(12,2) DEFAULT NULL COMMENT '距离（与 distance_unit 配合）',
    distance_unit VARCHAR(10) DEFAULT NULL COMMENT 'km | m',
    intensity VARCHAR(20) NOT NULL DEFAULT 'medium' COMMENT 'low | medium | high',
    points INT NOT NULL DEFAULT 0 COMMENT '获得积分',
    status VARCHAR(30) NOT NULL DEFAULT 'normal' COMMENT 'normal | suspicious | pending_review | rejected',
    checked_in_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '打卡时间',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_checkin_user_checked (user_id, checked_in_at),
    INDEX idx_checkin_sport (sport_type_id),
    CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_checkin_sport_type FOREIGN KEY (sport_type_id) REFERENCES sport_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '运动打卡记录';

-- 打卡佐证附件（URL 由上传接口返回）
CREATE TABLE check_in_attachment (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    check_in_record_id BIGINT NOT NULL COMMENT '所属打卡记录',
    url VARCHAR(512) NOT NULL COMMENT '文件访问 URL',
    type VARCHAR(20) NOT NULL DEFAULT 'image' COMMENT 'image | screenshot',
    uploaded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_attachment_record (check_in_record_id),
    CONSTRAINT fk_attachment_record FOREIGN KEY (check_in_record_id) REFERENCES check_in_record(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '运动打卡佐证附件';
