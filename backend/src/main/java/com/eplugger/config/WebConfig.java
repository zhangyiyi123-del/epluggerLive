package com.eplugger.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

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
        String[] origins = allowedOriginsConfig.trim().isEmpty()
                ? new String[0]
                : allowedOriginsConfig.split("\\s*,\\s*");
        registry.addMapping("/api/**")
                .allowedOrigins(origins.length > 0 ? origins : new String[]{"http://localhost:5173"})
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dir = (uploadDirPath != null && !uploadDirPath.isEmpty()) ? uploadDirPath : "./upload";
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + Paths.get(dir).toAbsolutePath().normalize() + "/");
    }
}
