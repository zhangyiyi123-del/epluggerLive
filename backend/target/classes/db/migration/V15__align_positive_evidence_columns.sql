-- 补列：positive_evidence 与 JPA 实体对齐，补全所有可能缺失列（彻底避免 schema-validation 缺列）
SET @db = DATABASE();

-- uploaded_at
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_evidence' AND COLUMN_NAME = 'uploaded_at');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_evidence ADD COLUMN uploaded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- url（若表为极旧版本缺列）
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_evidence' AND COLUMN_NAME = 'url');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_evidence ADD COLUMN url VARCHAR(512) NOT NULL DEFAULT '''' COMMENT ''文件访问 URL''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- type
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'positive_evidence' AND COLUMN_NAME = 'type');
SET @sql = IF(@c = 0, 'ALTER TABLE positive_evidence ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT ''image'' COMMENT ''image|file|link''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
