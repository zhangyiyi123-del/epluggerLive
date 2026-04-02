package com.eplugger.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

/**
 * 启动时打印主数据源 JDBC URL，便于核对「人员同步写入的 user 表」究竟在哪台库的哪个 schema。
 * 若此处不是预期的本机 eplugger，请检查 app.business-datasource（或 EPLUGGER_BUSINESS_DB_*）。
 */
@Component
@Order(0)
public class PrimaryDataSourceStartupLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PrimaryDataSourceStartupLogger.class);

    private final DataSource dataSource;

    public PrimaryDataSourceStartupLogger(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection c = dataSource.getConnection()) {
            DatabaseMetaData md = c.getMetaData();
            log.warn(
                    "Eplugger primary datasource (JPA/user writes): url={} user={}",
                    md.getURL(),
                    md.getUserName()
            );
        }
    }
}
