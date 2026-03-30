-- 原 V4/V27 等使用的 $2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu 经校验并非明文 123456 的 BCrypt（见 scripts/check_bcrypt.py）。
-- 另：在 PowerShell 中手工执行 UPDATE 时，若用双引号包裹含 $ 的哈希，$ 会被当作变量展开导致入库错误。
-- 下为 123456 的正确哈希（$2b$10$，Spring BCryptPasswordEncoder 可校验）。
UPDATE `user`
SET password_hash = '$2b$10$uuX4ST16qInJMLFiRyBr9erJVUmEUiss4ojxw9u1eHQVOhlbQGT4y';
