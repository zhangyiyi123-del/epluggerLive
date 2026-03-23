package com.eplugger.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

/**
 * 前端来源 CORS：允许前端开发/生产域名访问 /api。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOriginsConfig;

    @Value("${app.upload.dir:./upload}")
    private String uploadDirPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = allowedOriginsConfig.trim().isEmpty()
                ? new String[]{"http://localhost:5173"}
                : allowedOriginsConfig.split("\\s*,\\s*");
        registry.addMapping("/api/**")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dir = (uploadDirPath != null && !uploadDirPath.isEmpty()) ? uploadDirPath : "./upload";
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + Paths.get(dir).toAbsolutePath().normalize() + "/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable());
    }
}
