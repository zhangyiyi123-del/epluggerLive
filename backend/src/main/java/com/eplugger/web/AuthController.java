package com.eplugger.web;

import com.eplugger.service.AuthService;
import com.eplugger.service.EpWorkSsoService;
import com.eplugger.web.dto.LoginRequest;
import com.eplugger.web.dto.LoginResponse;
import com.eplugger.web.dto.SsoExchangeRequest;
import com.eplugger.web.dto.UserMeResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口：登录（仅密码）、刷新 Token、获取当前用户。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER = "Bearer ";

    private final AuthService authService;
    private final EpWorkSsoService epWorkSsoService;

    public AuthController(AuthService authService, EpWorkSsoService epWorkSsoService) {
        this.authService = authService;
        this.epWorkSsoService = epWorkSsoService;
    }

    /**
     * 密码登录。body: phone, password
     */
    /**
     * epWorkApp SSO：用落地页下发的短时 code 换取圈内 JWT（与密码登录响应一致）。
     */
    @PostMapping("/sso/exchange")
    public ResponseEntity<LoginResponse> ssoExchange(@Valid @RequestBody SsoExchangeRequest request) {
        try {
            return ResponseEntity.ok(epWorkSsoService.redeemExchangeCode(request.getCode()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String rawPassword = request.getPassword() != null ? request.getPassword().trim() : "";
        LoginResponse response = authService.loginByPassword(request.getPhone().trim(), rawPassword);
        return ResponseEntity.ok(response);
    }

    /**
     * 刷新 Token：请求头 Authorization: Bearer &lt;token&gt;，返回新 token 与用户信息。
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest httpRequest) {
        String token = extractBearerToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(401).build();
        }
        LoginResponse response = authService.refresh(token);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取当前登录用户信息。请求头需带 Authorization: Bearer &lt;token&gt;
     */
    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String subject = authentication.getPrincipal().toString();
        Long userId = Long.parseLong(subject);
        UserMeResponse user = authService.getCurrentUser(userId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            return null;
        }
        return header.substring(BEARER.length()).trim();
    }
}
