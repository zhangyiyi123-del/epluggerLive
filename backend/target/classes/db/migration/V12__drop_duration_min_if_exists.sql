-- 移除与实体不一致的冗余列 duration_min（实体使用 duration）
SET @db = DATABASE();
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'duration_min');
SET @sql = IF(@c > 0, 'ALTER TABLE check_in_record DROP COLUMN duration_min', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
