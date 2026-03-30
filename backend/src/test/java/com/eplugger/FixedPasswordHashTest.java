package com.eplugger;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 旧 Flyway 种子哈希误标为 123456；V28 已统一为正确哈希。
 */
class FixedPasswordHashTest {

    @Test
    void old_seed_does_not_match_123456() {
        var enc = new BCryptPasswordEncoder();
        String wrong = "$2a$10$5VV8SijCCntXYrB8QeTmOuqDNn0JCs0sMNQeL4oE.5jQJKZqR1.Wu";
        assertFalse(enc.matches("123456", wrong));
    }

    @Test
    void v28_hash_matches_123456() {
        var enc = new BCryptPasswordEncoder();
        String ok = "$2b$10$uuX4ST16qInJMLFiRyBr9erJVUmEUiss4ojxw9u1eHQVOhlbQGT4y";
        assertTrue(enc.matches("123456", ok));
    }
}
