package com.eplugger.security;

import com.eplugger.config.EpWorkSsoProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * 校验 epWorkApp 外链 token：{@code base64url(payload).base64url(HMAC-SHA256(payload, secret))}。
 */
@Component
public class EpWorkAppTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(EpWorkAppTokenVerifier.class);

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final EpWorkSsoProperties ssoProperties;

    public EpWorkAppTokenVerifier(EpWorkSsoProperties ssoProperties) {
        this.ssoProperties = ssoProperties;
    }

    /**
     * @return 解析后的 payload；失败抛出 IllegalArgumentException（消息不含完整 token）
     */
    public Map<String, Object> verify(String token) {
        String secret = ssoProperties.getSecret();
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException("EPWORK_SSO_SECRET / app.epwork.sso.secret is not configured");
        }
        if (!StringUtils.hasText(token) || !token.contains(".")) {
            log.warn("SSO token invalid format, prefix={}", SsoLogSanitizer.tokenPrefix(token));
            throw new IllegalArgumentException("token format invalid");
        }

        String[] parts = token.split("\\.", 2);
        String payloadBase64 = parts[0];
        String signature = parts[1];

        try {
            String expectedSignature = base64UrlEncode(hmacSha256(payloadBase64, secret));
            if (!constantTimeEquals(expectedSignature, signature)) {
                log.warn("SSO token signature invalid, prefix={}", SsoLogSanitizer.tokenPrefix(token));
                throw new IllegalArgumentException("signature invalid");
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(payloadBase64);
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = MAPPER.readValue(payloadBytes, Map.class);

            long now = System.currentTimeMillis();
            long exp = toLong(payload.get("exp"));
            if (exp <= 0 || now > exp) {
                log.warn("SSO token expired, prefix={}", SsoLogSanitizer.tokenPrefix(token));
                throw new IllegalArgumentException("token expired");
            }

            required(payload, "uid");
            required(payload, "systemCode");
            required(payload, "displayName");
            required(payload, "role");
            required(payload, "email");
            required(payload, "mobile");
            required(payload, "avatarUrl");
            required(payload, "nonce");
            required(payload, "issuer");

            Object issuer = payload.get("issuer");
            if (!"epWorkApp".equals(String.valueOf(issuer))) {
                throw new IllegalArgumentException("issuer invalid");
            }

            return payload;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("SSO token verify failed, prefix={}: {}", SsoLogSanitizer.tokenPrefix(token), e.getMessage());
            throw new IllegalArgumentException("token invalid");
        }
    }

    private static byte[] hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private static long toLong(Object v) {
        if (v == null) {
            return 0L;
        }
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        return Long.parseLong(String.valueOf(v));
    }

    private static void required(Map<String, Object> payload, String key) {
        if (!payload.containsKey(key)) {
            throw new IllegalArgumentException("missing claim: " + key);
        }
    }
}
