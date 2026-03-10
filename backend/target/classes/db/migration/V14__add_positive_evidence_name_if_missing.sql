-- 补列：旧版 positive_evidence 可能缺少 name，与 JPA 实体对齐
SET @db = DATABASE();
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_evidence' AND COLUMN_NAME = 'name');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_evidence ADD COLUMN name VARCHAR(255) DEFAULT NULL COMMENT ''文件名或链接标题''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
