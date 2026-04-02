package com.eplugger.security;

/**
 * SSO 外链 token 日志脱敏（仅保留前缀若干字符）。
 */
public final class SsoLogSanitizer {

    private static final int DEFAULT_PREFIX_LEN = 8;

    private SsoLogSanitizer() {}

    public static String tokenPrefix(String token) {
        if (token == null || token.isBlank()) {
            return "(empty)";
        }
        int n = Math.min(DEFAULT_PREFIX_LEN, token.length());
        return token.substring(0, n) + "...";
    }
}
