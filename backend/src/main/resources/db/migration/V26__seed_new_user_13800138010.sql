-- 新增演示用户（密码与其它种子用户相同：123456，BCrypt）
INSERT INTO `user` (phone, name, avatar, department, position, password_hash, created_at) VALUES
(
  '13800138010',
  '刘伟',
  NULL,
  '技术部',
  '开发',
  '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu',
  NOW(6)
)
ON DUPLICATE KEY UPDATE phone = phone;

INSERT INTO user_points (user_id, total_earned, total_used, available, updated_at)
SELECT u.id, 0, 0, 0, NOW(6)
FROM `user` u
WHERE u.phone = '13800138010'
  AND NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = u.id);
