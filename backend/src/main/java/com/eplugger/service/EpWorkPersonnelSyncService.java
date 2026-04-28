package com.eplugger.service;

import com.eplugger.config.EpWorkPersonnelSyncProperties;
import com.eplugger.domain.entity.EpworkPersonnelSyncCursor;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.EpworkPersonnelSyncCursorRepository;
import com.eplugger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.security.SecureRandom;

/**
 * 人员同步：BIZ_PERSON LEFT JOIN wx_member、wx_department，字段映射与产品表一致。
 */
@Service
@ConditionalOnProperty(prefix = "app.epwork-personnel-sync", name = "enabled", havingValue = "true")
public class EpWorkPersonnelSyncService {

    private static final Logger log = LoggerFactory.getLogger(EpWorkPersonnelSyncService.class);
    private static final String ACTIVE = "ACTIVE";
    private static final String INACTIVE = "INACTIVE";
    private static final DateTimeFormatter MYSQL_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter MYSQL_DATETIME_MILLIS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    /** 查询结果列别名（与 SELECT 中 AS 一致） */
    private static final String A_PERSON_ID = "epl_person_id";
    private static final String A_SSO_ID = "epl_sso_id";
    private static final String A_NAME = "epl_name";
    private static final String A_WORK_STATUS = "epl_work_status";
    private static final String A_CURSOR = "epl_cursor_time";
    private static final String A_AVATAR = "epl_avatar";
    private static final String A_POSITION = "epl_position";
    private static final String A_MOBILE = "epl_mobile";
    private static final String A_DEPARTMENT = "epl_department";

    private static final String PASS_UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String PASS_LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String PASS_DIGITS = "0123456789";
    private static final String PASS_SPECIAL_CHARS = "!@#$%^&*";
    
    private final UserRepository userRepository;
    private final EpworkPersonnelSyncCursorRepository cursorRepository;
    private final EpWorkPersonnelSyncProperties properties;
    private final JdbcTemplate jdbcTemplate;
    private final UserIdAllocationService userIdAllocationService;
    private final PasswordEncoder passwordEncoder;

    public EpWorkPersonnelSyncService(
            UserRepository userRepository,
            EpworkPersonnelSyncCursorRepository cursorRepository,
            EpWorkPersonnelSyncProperties properties,
            @Qualifier("epWorkPersonnelJdbcTemplate") JdbcTemplate jdbcTemplate,
            UserIdAllocationService userIdAllocationService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.cursorRepository = cursorRepository;
        this.properties = properties;
        this.jdbcTemplate = jdbcTemplate;
        this.userIdAllocationService = userIdAllocationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Scheduled(cron = "${app.epwork-personnel-sync.full-cron:0 0 * * * *}")
    public void syncFull() {
        if (!properties.isEnabled()) {
            return;
        }
        if (!StringUtils.hasText(properties.getTable())) {
            log.warn("personnel sync skipped: table is empty");
            return;
        }
        if (!StringUtils.hasText(properties.getUpdateTimeColumn())) {
            log.warn("personnel sync skipped: update_time_column is empty");
            return;
        }

        String cursorKey = StringUtils.hasText(properties.getCursorKey()) ? properties.getCursorKey() : properties.getTable();
        EpworkPersonnelSyncCursor cursor = cursorRepository.findById(cursorKey).orElse(null);
        Instant lastCursor = cursor == null ? null : cursor.getLastUpdateTime();

        List<Map<String, Object>> rows;
        try {
            String sql = buildJoinSelectSql(lastCursor != null);
            if (lastCursor == null) {
                rows = jdbcTemplate.queryForList(sql);
            } else {
                rows = jdbcTemplate.queryForList(sql, java.sql.Timestamp.from(lastCursor));
            }
        } catch (Exception ex) {
            log.error("personnel sync query failed: {}", ex.getMessage(), ex);
            return;
        }

        int created = 0;
        int updated = 0;
        int skipped = 0;
        Instant now = Instant.now();
        Instant maxUpdateTime = lastCursor;

        for (Map<String, Object> row : rows) {
            String ssoId = cellString(row, A_SSO_ID);
            if (!StringUtils.hasText(ssoId)) {
                skipped++;
                continue;
            }
            String name = cellString(row, A_NAME);
            String avatar = cellString(row, A_AVATAR);
            String department = cellString(row, A_DEPARTMENT);
            String position = cellString(row, A_POSITION);
            String mobile = cellString(row, A_MOBILE);
            String workStatus = cellString(row, A_WORK_STATUS);
            String employmentStatus = mapWorkStatus(workStatus);
            Instant rowUpdateTime = readUpdateTime(row, A_CURSOR);
            if (rowUpdateTime != null && (maxUpdateTime == null || rowUpdateTime.isAfter(maxUpdateTime))) {
                maxUpdateTime = rowUpdateTime;
            }

            User user = userRepository.findBySsoId(ssoId).orElse(null);
            if (user == null) {
                user = new User();
                user.setSsoId(ssoId);
                user.setId(userIdAllocationService.allocateNext());
                user.setPhone(allocatePlaceholderPhone(ssoId));
                created++;
            } else {
                updated++;
            }

            if (StringUtils.hasText(name)) {
                user.setName(name);
            }
            if (StringUtils.hasText(avatar)) {
                user.setAvatar(avatar);
            }
            if (StringUtils.hasText(department)) {
                user.setDepartment(department);
            }
            if (StringUtils.hasText(position)) {
                user.setPosition(position);
            }
            if (StringUtils.hasText(mobile) && !phoneTakenByOther(user, mobile.trim())) {
                user.setPhone(mobile.trim());
            }
            user.setEmploymentStatus(employmentStatus);
            // 生成随机密码并加密
            String randomPassword = generateRandomPassword();
            user.setPasswordHash(passwordEncoder.encode(randomPassword));
            user.setLastSyncedAt(now);
            userRepository.save(user);
        }

        if (maxUpdateTime != null) {
            EpworkPersonnelSyncCursor next = cursor == null ? new EpworkPersonnelSyncCursor() : cursor;
            next.setCursorKey(cursorKey);
            next.setLastUpdateTime(maxUpdateTime);
            next.setUpdatedAt(now);
            cursorRepository.save(next);
        }

        log.info("personnel sync done, total={}, created={}, updated={}, skipped={}, cursor={}",
                rows.size(), created, updated, skipped, maxUpdateTime);
    }

    public void triggerFullRebuild() {
        String table = properties.getTable();
        String cursorKey = StringUtils.hasText(properties.getCursorKey()) ? properties.getCursorKey() : table;
        cursorRepository.deleteById(cursorKey);
        log.info("personnel sync cursor reset, cursorKey={}", cursorKey);
        syncFull();
    }

    /**
     * BIZ_PERSON bp
     * LEFT JOIN wx_member wm ON bp.user_id = wm.user_id
     * LEFT JOIN wx_department wd ON bp.DEPARTMENT = wd.DEPARTMENT_ID
     */
    private String buildJoinSelectSql(boolean incremental) {
        EpWorkPersonnelSyncProperties p = properties;
        String bp = qIdent(p.getPersonTableAlias());
        String pt = qIdent(p.getTable());
        String wm = qIdent(p.getWxMemberAlias());
        String wmt = qIdent(p.getWxMemberTable());
        String wd = qIdent(p.getWxDepartmentAlias());
        String wdt = qIdent(p.getWxDepartmentTable());

        String idCol = qIdent(p.getPersonIdColumn());
        String ssoIdCol = qIdent(p.getPersonSsoIdColumn());
        String nameCol = qIdent(p.getPersonNameColumn());
        String workCol = qIdent(p.getPersonWorkStatusColumn());
        String cursorCol = qIdent(p.getUpdateTimeColumn());
        String pUserCol = qIdent(p.getPersonUserIdColumn());
        String pDeptCol = qIdent(p.getPersonDepartmentColumn());

        String wmUser = qIdent(p.getWxMemberUserIdColumn());
        String wmAv = qIdent(p.getWxMemberAvatarColumn());
        String wmPos = qIdent(p.getWxMemberPositionColumn());
        String wmMob = qIdent(p.getWxMemberMobileColumn());

        String wdId = qIdent(p.getWxDepartmentIdColumn());
        String wdName = qIdent(p.getWxDepartmentNameColumn());

        StringBuilder sb = new StringBuilder(512);
        sb.append("SELECT ");
        sb.append(bp).append('.').append(idCol).append(" AS ").append(A_PERSON_ID).append(", ");
        sb.append(bp).append('.').append(ssoIdCol).append(" AS ").append(A_SSO_ID).append(", ");
        sb.append(bp).append('.').append(nameCol).append(" AS ").append(A_NAME).append(", ");
        sb.append(bp).append('.').append(workCol).append(" AS ").append(A_WORK_STATUS).append(", ");
        sb.append(bp).append('.').append(cursorCol).append(" AS ").append(A_CURSOR).append(", ");
        sb.append(wm).append('.').append(wmAv).append(" AS ").append(A_AVATAR).append(", ");
        sb.append(wm).append('.').append(wmPos).append(" AS ").append(A_POSITION).append(", ");
        sb.append(wm).append('.').append(wmMob).append(" AS ").append(A_MOBILE).append(", ");
        sb.append(wd).append('.').append(wdName).append(" AS ").append(A_DEPARTMENT).append(" ");
        sb.append("FROM ").append(pt).append(' ').append(bp).append(" ");
        sb.append("LEFT JOIN ").append(wmt).append(' ').append(wm)
                .append(" ON ").append(bp).append('.').append(pUserCol)
                .append(" = ").append(wm).append('.').append(wmUser).append(" ");
        sb.append("LEFT JOIN ").append(wdt).append(' ').append(wd)
                .append(" ON ").append(bp).append('.').append(pDeptCol)
                .append(" = ").append(wd).append('.').append(wdId).append(" ");
        if (incremental) {
            sb.append("WHERE ").append(bp).append('.').append(cursorCol).append(" > ? ");
            sb.append("ORDER BY ").append(bp).append('.').append(cursorCol).append(" ASC");
        } else {
            sb.append("ORDER BY ").append(bp).append('.').append(cursorCol).append(" ASC");
        }
        return sb.toString();
    }

    private static String qIdent(String raw) {
        if (raw == null || !raw.matches("[A-Za-z0-9_]+")) {
            throw new IllegalArgumentException("invalid SQL identifier: " + raw);
        }
        return "`" + raw + "`";
    }

    private boolean phoneTakenByOther(User user, String phone) {
        return userRepository.findByPhone(phone)
                .map(other -> !other.getId().equals(user.getId()))
                .orElse(false);
    }

    private static Long cellLong(Map<String, Object> row, String alias) {
        for (Map.Entry<String, Object> e : row.entrySet()) {
            if (e.getKey() != null && e.getKey().equalsIgnoreCase(alias)) {
                Object v = e.getValue();
                if (v == null) {
                    return null;
                }
                if (v instanceof Number n) {
                    return n.longValue();
                }
                String s = Objects.toString(v, "").trim();
                if (!StringUtils.hasText(s)) {
                    return null;
                }
                try {
                    // 数字 ID
                    return Long.parseLong(s);
                } catch (NumberFormatException ex) {
                    // 非数字（例如十六进制字符串）不再参与该同步主键逻辑，直接视为不可用。
                    return null;
                }
            }
        }
        return null;
    }

    private static String cellString(Map<String, Object> row, String alias) {
        for (Map.Entry<String, Object> e : row.entrySet()) {
            if (e.getKey() != null && e.getKey().equalsIgnoreCase(alias)) {
                Object v = e.getValue();
                if (v == null) {
                    return "";
                }
                return Objects.toString(v, "").trim();
            }
        }
        return "";
    }

    private String mapWorkStatus(String workStatus) {
        if (!StringUtils.hasText(workStatus)) {
            return INACTIVE;
        }
        String s = workStatus.trim().toUpperCase();
        String raw = workStatus.trim();
        if ("离职".equals(raw)) {
            return INACTIVE;
        }
        if ("正式员工".equals(raw) || "试用".equals(raw) || "在职".equals(raw)) {
            return ACTIVE;
        }
        if ("1".equals(s) || "A".equals(s) || "ACTIVE".equals(s)) {
            return ACTIVE;
        }
        return INACTIVE;
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
        for (int i = 0; i < 300; i++) {
            String candidate = prefix + sanitized + (i == 0 ? "" : i);
            if (candidate.length() > 20) {
                candidate = candidate.substring(0, 20);
            }
            if (!userRepository.existsByPhone(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("cannot allocate unique placeholder phone");
    }

    /**
     * 生成随机密码（8-12位，包含大小写字母、数字和特殊字符）
     */
    private String generateRandomPassword() {
        String allChars = PASS_UPPER_CASE + PASS_LOWER_CASE + PASS_DIGITS + PASS_SPECIAL_CHARS;
        
        SecureRandom random = new SecureRandom();
        int length = 8 + random.nextInt(5); // 8-12位随机长度
        
        StringBuilder password = new StringBuilder(length);
        
        // 确保至少包含每种字符类型各一个
        password.append(PASS_UPPER_CASE.charAt(random.nextInt(PASS_UPPER_CASE.length())));
        password.append(PASS_LOWER_CASE.charAt(random.nextInt(PASS_LOWER_CASE.length())));
        password.append(PASS_DIGITS.charAt(random.nextInt(PASS_DIGITS.length())));
        password.append(PASS_SPECIAL_CHARS.charAt(random.nextInt(PASS_SPECIAL_CHARS.length())));
        
        // 填充剩余字符
        for (int i = 4; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // 打乱密码字符顺序
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }

    private Instant readUpdateTime(Map<String, Object> row, String alias) {
        Object v = null;
        for (Map.Entry<String, Object> e : row.entrySet()) {
            if (e.getKey() != null && e.getKey().equalsIgnoreCase(alias)) {
                v = e.getValue();
                break;
            }
        }
        if (v == null) {
            return null;
        }
        if (v instanceof java.sql.Timestamp ts) {
            return ts.toInstant();
        }
        if (v instanceof java.util.Date d) {
            return d.toInstant();
        }
        if (v instanceof LocalDateTime dt) {
            return dt.atZone(ZoneId.systemDefault()).toInstant();
        }
        String s = Objects.toString(v, "").trim();
        if (!StringUtils.hasText(s)) {
            return null;
        }
        try {
            return Instant.parse(s);
        } catch (Exception ignored) {
            // continue
        }
        try {
            LocalDateTime dt = LocalDateTime.parse(s, MYSQL_DATETIME);
            return dt.atZone(ZoneId.systemDefault()).toInstant();
        } catch (Exception ignored) {
            // continue
        }
        try {
            LocalDateTime dt = LocalDateTime.parse(s, MYSQL_DATETIME_MILLIS);
            return dt.atZone(ZoneId.systemDefault()).toInstant();
        } catch (Exception ignored) {
            return null;
        }
    }
}
