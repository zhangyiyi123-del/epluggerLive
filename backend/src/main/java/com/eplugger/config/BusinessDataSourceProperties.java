package com.eplugger.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 易普圈业务主库（JPA / Flyway / user 等）。使用独立前缀，避免 {@code SPRING_DATASOURCE_URL}
 * 覆盖 {@code spring.datasource} 时把主库误指到人员库。
 */
@ConfigurationProperties(prefix = "app.business-datasource")
public class BusinessDataSourceProperties {

    private String url;
    private String username;
    private String password;
    private String driverClassName = "com.mysql.cj.jdbc.Driver";

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDriverClassName() {
        return driverClassName;
    }

    public void setDriverClassName(String driverClassName) {
        this.driverClassName = driverClassName;
    }
}
