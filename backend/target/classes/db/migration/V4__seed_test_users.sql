-- 测试用户数据，密码均为 123456（BCrypt）
-- 若已存在相同 phone 则跳过（INSERT IGNORE 或 ON DUPLICATE KEY UPDATE phone=phone）

INSERT INTO `user` (phone, name, avatar, department, position, password_hash, created_at) VALUES
('13800138000', '测试用户', NULL, '技术部', '工程师',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138001', '张明', NULL, '技术部', '后端开发',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138002', '李华', NULL, '产品部', '产品经理',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138003', '王芳', NULL, '设计部', 'UI 设计师',  '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138004', '赵强', NULL, '运营部', '运营专员',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138005', '孙丽', NULL, '市场部', '市场策划',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138006', '周杰', NULL, '技术部', '前端开发',   '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138007', '吴敏', NULL, '人力资源', 'HR',       '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138008', '郑浩', NULL, '技术部', '测试工程师', '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6)),
('13800138009', '陈静', NULL, '财务部', '会计',       '$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu', NOW(6))
ON DUPLICATE KEY UPDATE phone = phone;
