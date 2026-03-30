"""Run: python scripts/check_bcrypt.py  (from backend/) — 避免 PowerShell 把 $ 当变量"""
import bcrypt

SEED = b"$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu"
print("old Flyway seed matches 123456:", bcrypt.checkpw(b"123456", SEED))

# V28 迁移中使用的固定哈希（明文 123456），与 Spring BCryptPasswordEncoder 兼容
FIXED = b"$2b$10$uuX4ST16qInJMLFiRyBr9erJVUmEUiss4ojxw9u1eHQVOhlbQGT4y"
print("V28 fixed hash matches 123456:", bcrypt.checkpw(b"123456", FIXED))
