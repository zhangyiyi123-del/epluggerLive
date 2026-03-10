-- 补列：positive_record 与 JPA 实体对齐，补全所有可能缺失列（旧表可能缺 related_colleague_ids 等）
SET @db = DATABASE();

-- title
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'title');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN title VARCHAR(200) DEFAULT NULL COMMENT ''标题''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- description
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'description');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN description TEXT NOT NULL DEFAULT '''' COMMENT ''描述''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tag_ids
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'tag_ids');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN tag_ids VARCHAR(500) DEFAULT NULL COMMENT ''标签ID列表''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- related_colleague_ids
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'related_colleague_ids');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN related_colleague_ids VARCHAR(500) DEFAULT NULL COMMENT ''@同事userId列表''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- points
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'points');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN points INT NOT NULL DEFAULT 0 COMMENT ''获得积分''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- status
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'status');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT ''pending'' COMMENT ''状态''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- created_at
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_record' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_record ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
