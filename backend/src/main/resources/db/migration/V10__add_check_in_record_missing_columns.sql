-- 补列：旧版迁移创建的 check_in_record 可能缺少 distance / distance_unit，此处按需添加
SET @db = DATABASE();

SET @add_distance = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'distance');
SET @sql = IF(@add_distance = 0, 'ALTER TABLE check_in_record ADD COLUMN distance DECIMAL(12,2) DEFAULT NULL COMMENT ''距离（与 distance_unit 配合）''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_distance_unit = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'check_in_record' AND COLUMN_NAME = 'distance_unit');
SET @sql = IF(@add_distance_unit = 0, 'ALTER TABLE check_in_record ADD COLUMN distance_unit VARCHAR(10) DEFAULT NULL COMMENT ''km | m''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
