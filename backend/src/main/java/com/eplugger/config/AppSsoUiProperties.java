package com.eplugger.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * 绑定 {@code app.sso.*}：前端回调 URL、错误页、可选来源 IP 白名单。
 */
@ConfigurationProperties(prefix = "app.sso")
public class AppSsoUiProperties {

    private String frontendCallbackUrl = "";
    private String frontendErrorUrl = "";
    private List<String> allowedSourceCidrs = new ArrayList<>();

    public String getFrontendCallbackUrl() {
        return frontendCallbackUrl;
    }

    public void setFrontendCallbackUrl(String frontendCallbackUrl) {
        this.frontendCallbackUrl = frontendCallbackUrl;
    }

    public String getFrontendErrorUrl() {
        return frontendErrorUrl;
    }

    public void setFrontendErrorUrl(String frontendErrorUrl) {
        this.frontendErrorUrl = frontendErrorUrl;
    }

    public List<String> getAllowedSourceCidrs() {
        return allowedSourceCidrs;
    }

    public void setAllowedSourceCidrs(List<String> allowedSourceCidrs) {
        this.allowedSourceCidrs = allowedSourceCidrs != null ? allowedSourceCidrs : new ArrayList<>();
    }
}
