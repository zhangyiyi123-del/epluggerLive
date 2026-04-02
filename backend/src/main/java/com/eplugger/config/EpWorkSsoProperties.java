package com.eplugger.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 与 epWorkApp {@code external.jump.secret} 一致的 HMAC 密钥。
 */
@ConfigurationProperties(prefix = "app.epwork.sso")
public class EpWorkSsoProperties {

    /**
     * 空表示未配置，验签将失败（开发可设环境变量 EPWORK_SSO_SECRET）。
     */
    private String secret = "";

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
