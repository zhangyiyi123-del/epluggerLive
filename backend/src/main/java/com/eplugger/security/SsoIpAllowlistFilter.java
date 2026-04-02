package com.eplugger.security;

import com.eplugger.config.AppSsoUiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 可选：仅允许配置的来源 IP/CIDR 访问 {@code /sso/**}。列表为空时不拦截。
 */
@Component
public class SsoIpAllowlistFilter extends OncePerRequestFilter {

    private final AppSsoUiProperties ssoUiProperties;

    public SsoIpAllowlistFilter(AppSsoUiProperties ssoUiProperties) {
        this.ssoUiProperties = ssoUiProperties;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (uri == null || !uri.startsWith("/sso/")) {
            filterChain.doFilter(request, response);
            return;
        }

        List<String> rules = ssoUiProperties.getAllowedSourceCidrs();
        if (rules == null || rules.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        boolean allowed = false;
        for (String rule : rules) {
            if (rule == null || rule.isBlank()) {
                continue;
            }
            String r = rule.trim();
            try {
                IpAddressMatcher matcher = new IpAddressMatcher(r);
                if (matcher.matches(clientIp)) {
                    allowed = true;
                    break;
                }
            } catch (Exception ignored) {
                // 非法规则跳过
            }
        }

        if (!allowed) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "SSO source IP not allowed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        return request.getRemoteAddr();
    }
}
