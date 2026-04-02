package com.eplugger.config;

import com.eplugger.security.JwtAuthenticationFilter;
import com.eplugger.security.SsoIpAllowlistFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 安全配置：放行健康检查与认证接口，其余 /api 需 JWT；无状态会话。
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final SsoIpAllowlistFilter ssoIpAllowlistFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, SsoIpAllowlistFilter ssoIpAllowlistFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.ssoIpAllowlistFilter = ssoIpAllowlistFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/sso/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/sso/exchange").permitAll()
                        .requestMatchers("/api/health", "/api/auth/**").permitAll()
                        .requestMatchers("/api/uploads/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                // 必须先注册 JwtAuthenticationFilter，才能相对它插入 SsoIpAllowlistFilter（否则报 “does not have a registered order”）
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(ssoIpAllowlistFilter, JwtAuthenticationFilter.class);
        return http.build();
    }
}
