package com.eplugger.web.util;

import java.time.ZoneId;

/**
 * 解析客户端传入的 IANA 时区；非法或缺省时使用 JVM 默认时区（与积分「自然日」口径一致）。
 */
public final class ZoneIdResolver {

    private ZoneIdResolver() {}

    public static ZoneId resolve(String timeZone) {
        if (timeZone == null || timeZone.isBlank()) {
            return ZoneId.systemDefault();
        }
        try {
            return ZoneId.of(timeZone.trim());
        } catch (Exception e) {
            return ZoneId.systemDefault();
        }
    }
}
