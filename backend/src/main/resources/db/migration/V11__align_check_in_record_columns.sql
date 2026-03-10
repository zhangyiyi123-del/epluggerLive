-- 一次性补全 check_in_record 与实体一致的所有可能缺失列（旧版迁移表结构不一致时使用）
SET @db = DATABASE();

-- duration
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'duration');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN duration INT NOT NULL DEFAULT 0 COMMENT ''时长''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- duration_unit
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'duration_unit');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN duration_unit VARCHAR(20) NOT NULL DEFAULT ''minute'' COMMENT ''minute|hour''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- distance
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'distance');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN distance DECIMAL(12,2) DEFAULT NULL COMMENT ''距离''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- distance_unit
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'distance_unit');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN distance_unit VARCHAR(10) DEFAULT NULL COMMENT ''km|m''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- intensity
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'intensity');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN intensity VARCHAR(20) NOT NULL DEFAULT ''medium'' COMMENT ''low|medium|high''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- points
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'points');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN points INT NOT NULL DEFAULT 0 COMMENT ''获得积分''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- status
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'status');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT ''normal'' COMMENT ''normal|suspicious|pending_review|rejected''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- checked_in_at
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'checked_in_at');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN checked_in_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT ''打卡时间''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- created_at
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@c = 0, 'ALTER TABLE check_in_record ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
