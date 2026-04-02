package com.eplugger.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class EpWorkPersonnelDataSourceConfig {

    @Bean(name = "epWorkPersonnelDataSource")
    @ConditionalOnProperty(prefix = "app.epwork-personnel-sync", name = "enabled", havingValue = "true")
    public DataSource epWorkPersonnelDataSource(EpWorkPersonnelDataSourceProperties properties) {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName(properties.getDriverClassName());
        ds.setUrl(properties.getUrl());
        ds.setUsername(properties.getUsername());
        ds.setPassword(properties.getPassword());
        return ds;
    }

    @Bean(name = "epWorkPersonnelJdbcTemplate")
    @ConditionalOnProperty(prefix = "app.epwork-personnel-sync", name = "enabled", havingValue = "true")
    public JdbcTemplate epWorkPersonnelJdbcTemplate(
            @Qualifier("epWorkPersonnelDataSource") DataSource epWorkPersonnelDataSource) {
        return new JdbcTemplate(epWorkPersonnelDataSource);
    }
}
