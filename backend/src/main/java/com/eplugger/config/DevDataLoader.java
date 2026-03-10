package com.eplugger.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * 开发环境占位配置。测试用户数据由 Flyway 脚本 V4__seed_test_users.sql 插入。
 */
@Configuration
@Profile("!prod")
public class DevDataLoader {
}
