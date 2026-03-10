package com.eplugger.service;

import com.eplugger.domain.entity.User;
import com.eplugger.repository.UserRepository;
import com.eplugger.security.JwtUtil;
import com.eplugger.web.dto.LoginResponse;
import com.eplugger.web.dto.UserMeResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 认证服务：当前仅支持手机号+密码登录；签发 Token、获取当前用户。
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 密码登录：校验手机号与密码，成功则签发 Token 并返回用户信息。
     *
     * @return LoginResponse 成功时
     * @throws IllegalArgumentException 手机号或密码错误时
     */
    public LoginResponse loginByPassword(String phone, String rawPassword) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new IllegalArgumentException("手机号或密码错误"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("手机号或密码错误");
        }
        String token = jwtUtil.issueToken(user.getId().toString());
        return new LoginResponse(token, toUserMeResponse(user));
    }

    /**
     * 根据 userId（JWT subject）获取当前用户信息；用于 /api/auth/me 与 refresh。
     */
    public UserMeResponse getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(this::toUserMeResponse)
                .orElse(null);
    }

    /**
     * 刷新 Token：用旧 token 的 subject 签发新 token。
     */
    public LoginResponse refresh(String currentToken) {
        String subject = jwtUtil.getSubject(currentToken);
        if (subject == null) {
            throw new IllegalArgumentException("无效或过期的 Token");
        }
        Long userId = Long.parseLong(subject);
        UserMeResponse user = getCurrentUser(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        String newToken = jwtUtil.issueToken(subject);
        return new LoginResponse(newToken, user);
    }

    public UserMeResponse toUserMeResponse(User user) {
        return new UserMeResponse(
                user.getId().toString(),
                user.getName(),
                user.getAvatar(),
                user.getDepartment() != null ? user.getDepartment() : "",
                user.getPosition()
        );
    }
}
