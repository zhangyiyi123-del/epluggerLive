-- 用户故事 3：正向行为打卡 — 分类、记录、佐证（幂等：表已存在时跳过）
CREATE TABLE IF NOT EXISTS positive_category (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '分类标识，如 teamwork',
    name VARCHAR(100) NOT NULL COMMENT '显示名称',
    icon VARCHAR(50) NOT NULL DEFAULT '' COMMENT '图标 emoji',
    description VARCHAR(500) DEFAULT NULL COMMENT '分类说明',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    is_enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    evidence_requirement VARCHAR(20) NOT NULL DEFAULT 'optional' COMMENT 'required | optional | exempt',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_positive_category_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '正向行为分类';

CREATE TABLE IF NOT EXISTS positive_record (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户 ID',
    category_id VARCHAR(50) NOT NULL COMMENT '分类 ID',
    title VARCHAR(200) DEFAULT NULL COMMENT '标题',
    description TEXT NOT NULL COMMENT '描述 20-500 字',
    tag_ids VARCHAR(500) DEFAULT NULL COMMENT '标签 ID 列表，逗号分隔',
    related_colleague_ids VARCHAR(500) DEFAULT NULL COMMENT '@同事 userId 列表，逗号分隔',
    points INT NOT NULL DEFAULT 0 COMMENT '获得积分',
    status VARCHAR(30) NOT NULL DEFAULT 'pending' COMMENT 'pending | confirmed | rejected | suspicious',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_positive_record_user_created (user_id, created_at),
    INDEX idx_positive_record_category (category_id),
    CONSTRAINT fk_positive_record_user FOREIGN KEY (user_id) REFERENCES `user`(id),
    CONSTRAINT fk_positive_record_category FOREIGN KEY (category_id) REFERENCES positive_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '正向打卡记录';

CREATE TABLE IF NOT EXISTS positive_evidence (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    positive_record_id BIGINT NOT NULL COMMENT '所属正向记录',
    url VARCHAR(512) NOT NULL COMMENT '文件访问 URL',
    type VARCHAR(20) NOT NULL DEFAULT 'image' COMMENT 'image | file | link',
    name VARCHAR(255) DEFAULT NULL COMMENT '文件名或链接标题',
    uploaded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_positive_evidence_record (positive_record_id),
    CONSTRAINT fk_positive_evidence_record FOREIGN KEY (positive_record_id) REFERENCES positive_record(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '正向打卡佐证';

-- 种子数据：与前端 DEFAULT_POSITIVE_CATEGORIES 对齐（已存在则忽略）
INSERT IGNORE INTO positive_category (id, name, icon, description, sort_order, is_enabled, evidence_requirement) VALUES
('teamwork', '团队协作', '🤝', '跨部门协作、项目助力、经验分享', 1, 1, 'required'),
('culture', '文化建设', '🎉', '团队活动、正向分享、同事互助', 2, 1, 'optional'),
('growth', '个人成长', '📈', '技能学习、工作总结、正向心态', 3, 1, 'exempt'),
('other', '其他正向', '✨', '公益参与、公司形象维护等', 4, 1, 'optional');
