package com.eplugger.service;

import com.eplugger.config.AppSsoUiProperties;
import com.eplugger.domain.entity.EpworkSsoExchangeCode;
import com.eplugger.domain.entity.EpworkSsoNonce;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.EpworkSsoExchangeCodeRepository;
import com.eplugger.repository.EpworkSsoNonceRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.security.EpWorkAppTokenVerifier;
import com.eplugger.security.JwtUtil;
import com.eplugger.security.SsoLogSanitizer;
import com.eplugger.web.dto.LoginResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Objects;

/**
 * epWorkApp SSO：验签、nonce、用户 upsert、exchange code、换取圈内 JWT。
 */
@Service
public class EpWorkSsoService {

    private static final Logger log = LoggerFactory.getLogger(EpWorkSsoService.class);

    private static final int EXCHANGE_TTL_SECONDS = 120;

    private final EpWorkAppTokenVerifier tokenVerifier;
    private final EpworkSsoNonceRepository nonceRepository;
    private final EpworkSsoExchangeCodeRepository exchangeCodeRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final AppSsoUiProperties ssoUiProperties;
    private final UserIdAllocationService userIdAllocationService;

    private final SecureRandom secureRandom = new SecureRandom();

    public EpWorkSsoService(
            EpWorkAppTokenVerifier tokenVerifier,
            EpworkSsoNonceRepository nonceRepository,
            EpworkSsoExchangeCodeRepository exchangeCodeRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            AuthService authService,
            AppSsoUiProperties ssoUiProperties,
            UserIdAllocationService userIdAllocationService
    ) {
        this.tokenVerifier = tokenVerifier;
        this.nonceRepository = nonceRepository;
        this.exchangeCodeRepository = exchangeCodeRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.ssoUiProperties = ssoUiProperties;
        this.userIdAllocationService = userIdAllocationService;
    }

    /**
     * 验签并建立 exchange，返回带 {@code code} 的完整前端回调 URL。
     */
    @Transactional
    public String buildFrontendRedirectAfterSso(String externalToken) {
        Map<String, Object> payload = tokenVerifier.verify(externalToken);
        String nonce = Objects.toString(payload.get("nonce"), "");

        EpworkSsoNonce row = new EpworkSsoNonce();
        row.setNonce(nonce);
        row.setConsumedAt(Instant.now());
        try {
            nonceRepository.save(row);
        } catch (DataIntegrityViolationException e) {
            log.warn("SSO nonce replay blocked, prefix={}", SsoLogSanitizer.tokenPrefix(nonce));
            throw new IllegalArgumentException("nonce replay");
        }

        User user = upsertUserFromPayload(payload);
        String code = newExchangeCode();
        EpworkSsoExchangeCode ex = new EpworkSsoExchangeCode();
        ex.setCode(code);
        ex.setUser(user);
        ex.setCreatedAt(Instant.now());
        ex.setExpiresAt(Instant.now().plus(EXCHANGE_TTL_SECONDS, ChronoUnit.SECONDS));
        ex.setUsed(false);
        exchangeCodeRepository.save(ex);

        String base = ssoUiProperties.getFrontendCallbackUrl();
        if (!StringUtils.hasText(base)) {
            throw new IllegalStateException("app.sso.frontend-callback-url is not configured");
        }
        String sep = base.contains("?") ? "&" : "?";
        return base + sep + "code=" + code;
    }

    @Transactional
    public LoginResponse redeemExchangeCode(String code) {
        if (!StringUtils.hasText(code)) {
            throw new IllegalArgumentException("missing code");
        }
        String trimmed = code.trim();
        EpworkSsoExchangeCode row = exchangeCodeRepository.findById(trimmed)
                .orElseThrow(() -> new IllegalArgumentException("invalid code"));

        if (row.isUsed()) {
            throw new IllegalArgumentException("code used");
        }
        if (Instant.now().isAfter(row.getExpiresAt())) {
            throw new IllegalArgumentException("code expired");
        }

        row.setUsed(true);
        exchangeCodeRepository.save(row);

        User u = row.getUser();
        String jwt = jwtUtil.issueToken(u.getId().toString());
        return new LoginResponse(jwt, authService.toUserMeResponse(u));
    }

    private User upsertUserFromPayload(Map<String, Object> payload) {
        String uid = Objects.toString(payload.get("uid"), "").trim();
        if (!StringUtils.hasText(uid)) {
            throw new IllegalArgumentException("uid empty");
        }

        String displayName = strClaim(payload, "displayName");
        String role = strClaim(payload, "role");
        String avatarUrl = strClaim(payload, "avatarUrl");
        String mobile = strClaim(payload, "mobile");

        String phone;
        if (StringUtils.hasText(mobile)) {
            phone = mobile.trim();
        } else {
            phone = allocatePlaceholderPhone(uid);
        }

        Long bizPersonId = parseOptionalBizPersonId(payload);

        User user = userRepository.findBySsoId(uid).orElse(null);
        if (user == null && bizPersonId != null) {
            user = userRepository.findById(bizPersonId).orElse(null);
        }
        if (user == null) {
            user = new User();
            if (bizPersonId != null) {
                user.setId(bizPersonId);
            } else {
                user.setId(userIdAllocationService.allocateNext());
            }
            user.setSsoId(uid);
            user.setPhone(phone);
            user.setName(displayName);
            user.setPosition(StringUtils.hasText(role) ? role : null);
            user.setAvatar(StringUtils.hasText(avatarUrl) ? avatarUrl : null);
            user.setEmploymentStatus("ACTIVE");
            user.setLastSyncedAt(Instant.now());
            user.setPasswordHash(null);
            return userRepository.save(user);
        }

        user.setSsoId(uid);
        user.setName(displayName);
        if (StringUtils.hasText(role)) {
            user.setPosition(role);
        }
        if (StringUtils.hasText(avatarUrl)) {
            user.setAvatar(avatarUrl);
        }
        if (StringUtils.hasText(mobile) && !phoneTakenByOther(user, mobile.trim())) {
            user.setPhone(mobile.trim());
        }
        user.setEmploymentStatus("ACTIVE");
        user.setLastSyncedAt(Instant.now());
        return userRepository.save(user);
    }

    private static Long parseOptionalBizPersonId(Map<String, Object> payload) {
        for (String key : new String[] {"bizPersonId", "personId"}) {
            Object v = payload.get(key);
            if (v == null) {
                continue;
            }
            if (v instanceof Number n) {
                return n.longValue();
            }
            String s = Objects.toString(v, "").trim();
            if (StringUtils.hasText(s)) {
                try {
                    return Long.parseLong(s);
                } catch (NumberFormatException ignored) {
                    // try next key
                }
            }
        }
        return null;
    }

    private boolean phoneTakenByOther(User user, String phone) {
        return userRepository.findByPhone(phone)
                .map(other -> !other.getId().equals(user.getId()))
                .orElse(false);
    }

    private static String strClaim(Map<String, Object> payload, String key) {
        Object v = payload.get(key);
        return v == null ? "" : Objects.toString(v, "");
    }

    private String allocatePlaceholderPhone(String uid) {
        String sanitized = uid.replaceAll("[^a-zA-Z0-9]", "");
        if (sanitized.length() > 15) {
            sanitized = sanitized.substring(0, 15);
        }
        if (sanitized.isEmpty()) {
            sanitized = "u" + Math.abs(uid.hashCode());
        }
        String prefix = "s";
        for (int i = 0; i < 200; i++) {
            String candidate = prefix + sanitized + (i == 0 ? "" : i);
            if (candidate.length() > 20) {
                candidate = candidate.substring(0, 20);
            }
            if (!userRepository.existsByPhone(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("cannot allocate unique placeholder phone for sso uid");
    }

    private String newExchangeCode() {
        byte[] buf = new byte[32];
        secureRandom.nextBytes(buf);
        StringBuilder sb = new StringBuilder(64);
        for (byte b : buf) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
