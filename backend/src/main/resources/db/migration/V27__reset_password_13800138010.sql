-- V26 在手机号已存在时仅执行 ON DUPLICATE KEY UPDATE phone = phone，不会写入 password_hash。
-- 已存在的「刘伟」需显式重置密码，与 V4 种子用户一致：明文 123456（BCrypt）
UPDATE `user`
SET password_hash = '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu'
WHERE phone = '13800138010';
