package com.eplugger.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway 策略：先 repair 再 migrate，避免因迁移脚本内容变更导致校验和不匹配而启动失败。
 * 校验和与库中不一致时，repair 会更新 flyway_schema_history 中的校验和与当前脚本一致。
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
