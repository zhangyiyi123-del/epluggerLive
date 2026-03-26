package com.eplugger.service;

import com.eplugger.domain.entity.CheckInRecord;
import com.eplugger.domain.entity.PointsRecord;
import com.eplugger.domain.entity.PositiveRecord;
import com.eplugger.domain.entity.Post;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserMedal;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.PositiveRecordRepository;
import com.eplugger.repository.PostLikeRepository;
import com.eplugger.repository.PostRepository;
import com.eplugger.repository.UserMedalRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.MedalDto;
import com.eplugger.web.dto.PointsRecordDto;
import com.eplugger.web.dto.UserPointsDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.YearMonth;
import java.util.List;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户积分、等级进度、积分明细、勋章列表。
 * 等级由 totalEarned 按档位计算，与前端 LEVEL_CONFIGS 一致。
 */
@Service
public class PointsService {

    private static final int[] LEVEL_MAX = { 200, 500, 1000, 1800, 2800, 4000, 5500, 7500, 10000, Integer.MAX_VALUE };
    private static final int HOT_AUTHOR_INTERACTION_THRESHOLD = 20;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String MEDAL_REWARD_RECORD_TYPE = "medal_reward";

    private static final Map<String, MedalMeta> MEDAL_META = Map.ofEntries(
            entry("sports-rookie", "运动萌新", "连续运动达标7天", "🏃", "连续运动7天", 7, 50),
            entry("sports-master", "运动达人", "累计运动达标30天", "🏅", "累计运动30天", 30, 50),
            entry("sports-champion", "运动健将", "累计运动达标100天", "🏆", "累计运动100天", 100, 50),
            entry("positive-messenger", "正向使者", "累计正向打卡20次", "✨", "累计正向打卡20次", 20, 50),
            entry("community-star", "正向标杆", "累计发布10条优质正向打卡", "📱", "累计发布10条优质正向打卡", 10, 50),
            entry("team-star", "团队之星", "累计邀请20人参与", "👥", "累计邀请20人参与", 20, 50),
            entry("post-rookie", "发圈新秀", "累计发布动态10条", "📝", "累计发布动态10条", 10, 50),
            entry("content-creator", "内容创作者", "累计发布动态50条", "🧠", "累计发布动态50条", 50, 50),
            entry("hot-author", "高热作者", "累计5条动态互动数达到20", "🔥", "累计5条动态互动数达到20", 5, 50),
            entry("interaction-star", "互动之星", "累计点赞200次", "❤️", "累计点赞200次", 200, 50),
            entry("full-attendance", "全勤标兵", "自然月打卡全达标", "📅", "自然月全勤", 1, 50)
    );
    private static final List<String> MEDAL_ORDER = List.of(
            "sports-rookie",
            "sports-master",
            "sports-champion",
            "positive-messenger",
            "community-star",
            "team-star",
            "post-rookie",
            "content-creator",
            "hot-author",
            "interaction-star",
            "full-attendance"
    );

    private static Map.Entry<String, MedalMeta> entry(String type, String name, String desc, String icon, String cond, int required, int reward) {
        return Map.entry(type, new MedalMeta(name, desc, icon, cond, required, reward));
    }

    private static class MedalMeta {
        final String name, description, icon, condition;
        final int requiredCount, pointsReward;
        MedalMeta(String name, String description, String icon, String condition, int requiredCount, int pointsReward) {
            this.name = name;
            this.description = description;
            this.icon = icon;
            this.condition = condition;
            this.requiredCount = requiredCount;
            this.pointsReward = pointsReward;
        }
    }

    private final UserPointsRepository userPointsRepository;
    private final PointsRecordRepository pointsRecordRepository;
    private final UserMedalRepository userMedalRepository;
    private final UserRepository userRepository;
    private final CheckInRecordRepository checkInRecordRepository;
    private final PositiveRecordRepository positiveRecordRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;

    public PointsService(
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            UserMedalRepository userMedalRepository,
            UserRepository userRepository,
            CheckInRecordRepository checkInRecordRepository,
            PositiveRecordRepository positiveRecordRepository,
            PostLikeRepository postLikeRepository,
            PostRepository postRepository
    ) {
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.userMedalRepository = userMedalRepository;
        this.userRepository = userRepository;
        this.checkInRecordRepository = checkInRecordRepository;
        this.positiveRecordRepository = positiveRecordRepository;
        this.postLikeRepository = postLikeRepository;
        this.postRepository = postRepository;
    }

    public Optional<UserPointsDto> getMe(Long userId) {
        UserPoints up = getOrCreateUserPoints(userId);
        if (up == null) return Optional.empty();
        UserPointsDto dto = new UserPointsDto();
        dto.setUserId(String.valueOf(userId));
        dto.setAvailablePoints(up.getAvailable());
        dto.setTotalEarnedPoints(up.getTotalEarned());
        dto.setTotalUsedPoints(up.getTotalUsed());
        dto.setExpiringPoints(0);
        dto.setExpiringDate(null);
        int level = levelFromTotalEarned(up.getTotalEarned());
        dto.setLevel(level);
        dto.setCurrentLevelPoints(up.getTotalEarned());
        dto.setNextLevelPoints(level >= 10 ? up.getTotalEarned() : LEVEL_MAX[level]);
        dto.setMedals(buildMedalsWithProgress(userId));
        return Optional.of(dto);
    }

    public Page<PointsRecordDto> getRecords(Long userId, Pageable pageable) {
        return pointsRecordRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toRecordDto);
    }

    /**
     * 当前用户在当地自然日内已获得积分总和：{@code points_record} 中当日 {@code amount &gt; 0} 的合计，
     * 不按类型过滤（运动/正向打卡、发帖奖励、互动奖励等均计入）；兑换等扣分为负，不计入。
     */
    public int getTodayEarnedPoints(Long userId, ZoneId zoneId) {
        if (zoneId == null) {
            zoneId = ZoneId.systemDefault();
        }
        LocalDate today = LocalDate.now(zoneId);
        Instant start = today.atStartOfDay(zoneId).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(zoneId).toInstant();
        Long sum = pointsRecordRepository.sumEarnedAmountForUserBetween(userId, start, end);
        return sum != null ? sum.intValue() : 0;
    }

    public List<MedalDto> getMedals(Long userId) {
        return buildMedalsWithProgress(userId);
    }

    @Transactional
    public UserPoints getOrCreateUserPoints(Long userId) {
        return userPointsRepository.findById(userId)
                .orElseGet(() -> {
                    UserPoints up = new UserPoints();
                    up.setUserId(userId);
                    up.setUser(userRepository.getReferenceById(userId));
                    return userPointsRepository.save(up);
                });
    }

    private int levelFromTotalEarned(int totalEarned) {
        for (int i = 0; i < LEVEL_MAX.length; i++) {
            if (totalEarned <= LEVEL_MAX[i]) return i + 1;
        }
        return 10;
    }

    private MedalDto toMedalDto(UserMedal m) {
        MedalDto dto = new MedalDto();
        dto.setType(m.getMedalType());
        MedalMeta meta = MEDAL_META.get(m.getMedalType());
        if (meta != null) {
            dto.setName(meta.name);
            dto.setDescription(meta.description);
            dto.setIcon(meta.icon);
            dto.setCondition(meta.condition);
            dto.setRequiredCount(meta.requiredCount);
            dto.setPointsReward(meta.pointsReward);
        }
        dto.setObtainedAt(m.getObtainedAt() != null ? m.getObtainedAt().toString() : null);
        return dto;
    }

    private List<MedalDto> buildMedalsWithProgress(Long userId) {
        Map<String, UserMedal> obtainedByType = userMedalRepository.findByUser_IdOrderByObtainedAtDesc(userId).stream()
                .collect(Collectors.toMap(
                        UserMedal::getMedalType,
                        m -> m,
                        (a, b) -> a
                ));
        return MEDAL_ORDER.stream()
                .map(type -> {
                    MedalMeta meta = MEDAL_META.get(type);
                    if (meta == null) return null;
                    MedalDto dto = new MedalDto();
                    dto.setType(type);
                    dto.setName(meta.name);
                    dto.setDescription(meta.description);
                    dto.setIcon(meta.icon);
                    dto.setCondition(meta.condition);
                    dto.setRequiredCount(meta.requiredCount);
                    dto.setPointsReward(meta.pointsReward);
                    int progress = Math.min(calculateProgressForMedal(type, userId), meta.requiredCount);
                    dto.setProgress(progress);
                    UserMedal obtained = obtainedByType.get(type);
                    dto.setObtainedAt(obtained != null && obtained.getObtainedAt() != null
                            ? obtained.getObtainedAt().toString()
                            : null);
                    return dto;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private int calculateProgressForMedal(String medalType, Long userId) {
        return switch (medalType) {
            case "sports-rookie" -> countConsecutiveExerciseDays(userId);
            case "sports-master", "sports-champion" -> safeLongToInt(checkInRecordRepository.countByUser_Id(userId));
            case "positive-messenger" -> safeLongToInt(positiveRecordRepository.countByUser_Id(userId));
            case "community-star" -> countQualifiedCommunityPosts(userId);
            case "team-star" -> countInvitedParticipants(userId);
            case "post-rookie", "content-creator" -> safeLongToInt(postRepository.countByAuthor_Id(userId));
            case "hot-author" -> countHotPostsByAuthor(userId);
            case "interaction-star" -> safeLongToInt(postLikeRepository.countByUser_Id(userId));
            case "full-attendance" -> isCurrentMonthFullAttendance(userId) ? 1 : 0;
            default -> 0;
        };
    }

    private int countConsecutiveExerciseDays(Long userId) {
        List<CheckInRecord> records = checkInRecordRepository.findByUser_IdOrderByCheckedInAtDesc(userId, Pageable.unpaged()).getContent();
        if (records.isEmpty()) return 0;
        Set<LocalDate> dates = records.stream()
                .map(r -> LocalDate.ofInstant(r.getCheckedInAt(), ZoneId.systemDefault()))
                .collect(Collectors.toSet());
        LocalDate cursor = LocalDate.now();
        int count = 0;
        while (dates.contains(cursor)) {
            count++;
            cursor = cursor.minusDays(1);
        }
        return count;
    }

    private int countInvitedParticipants(Long userId) {
        List<PositiveRecord> records = positiveRecordRepository.findByUser_Id(userId);
        int total = 0;
        for (PositiveRecord r : records) {
            total += splitLongIds(r.getRelatedColleagueIds()).size();
        }
        return total;
    }

    public int countQualifiedCommunityPosts(Long userId) {
        return (int) postRepository.findByAuthor_Id(userId).stream()
                .filter(this::isQualifiedCommunityPost)
                .count();
    }

    private int countHotPostsByAuthor(Long userId) {
        return (int) postRepository.findByAuthor_Id(userId).stream()
                .filter(p -> p.getLikesCount() + p.getCommentsCount() >= HOT_AUTHOR_INTERACTION_THRESHOLD)
                .count();
    }

    private boolean isCurrentMonthFullAttendance(Long userId) {
        ZoneId zoneId = ZoneId.systemDefault();
        YearMonth month = YearMonth.now(zoneId);
        Instant start = month.atDay(1).atStartOfDay(zoneId).toInstant();
        Instant end = month.plusMonths(1).atDay(1).atStartOfDay(zoneId).toInstant();
        Set<LocalDate> days = new HashSet<>();
        for (CheckInRecord r : checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end)) {
            days.add(LocalDate.ofInstant(r.getCheckedInAt(), zoneId));
        }
        for (PositiveRecord r : positiveRecordRepository.findByUser_IdAndCreatedAtBetween(userId, start, end)) {
            days.add(LocalDate.ofInstant(r.getCreatedAt(), zoneId));
        }
        return days.size() >= month.lengthOfMonth();
    }

    private boolean isQualifiedCommunityPost(Post post) {
        String content = post.getContentText() != null ? post.getContentText() : "";
        int nonWhitespaceLength = content.replaceAll("\\s+", "").length();
        int uniqueMentions = splitLongIds(post.getMentionUserIds()).size();
        boolean hasImage = hasAtLeastOneEvidenceImage(post.getContentImages());
        return nonWhitespaceLength >= 100 && uniqueMentions >= 1 && hasImage;
    }

    private boolean hasAtLeastOneEvidenceImage(String contentImages) {
        if (contentImages == null || contentImages.isBlank()) return false;
        try {
            List<String> images = OBJECT_MAPPER.readValue(contentImages, new TypeReference<List<String>>() {});
            return images.stream().anyMatch(url -> url != null && !url.isBlank());
        } catch (Exception e) {
            return false;
        }
    }

    private List<Long> splitLongIds(String ids) {
        if (ids == null || ids.isBlank()) return List.of();
        return java.util.Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Long.parseLong(s);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(v -> v != null)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public void grantExerciseMedalsIfEligible(long userId) {
        grantMedalIfEligible(userId, "sports-rookie");
        grantMedalIfEligible(userId, "sports-master");
        grantMedalIfEligible(userId, "sports-champion");
        grantAttendanceMedalIfEligible(userId);
    }

    @Transactional
    public void grantPositiveMedalsIfEligible(long userId) {
        grantMedalIfEligible(userId, "positive-messenger");
        grantMedalIfEligible(userId, "team-star");
        grantAttendanceMedalIfEligible(userId);
    }

    @Transactional
    public void grantPostMedalsIfEligible(long userId) {
        grantMedalIfEligible(userId, "post-rookie");
        grantMedalIfEligible(userId, "content-creator");
        grantMedalIfEligible(userId, "community-star");
        grantMedalIfEligible(userId, "hot-author");
    }

    @Transactional
    public void grantInteractionMedalIfEligible(long userId) {
        grantMedalIfEligible(userId, "interaction-star");
    }

    @Transactional
    public void grantAttendanceMedalIfEligible(long userId) {
        grantMedalIfEligible(userId, "full-attendance");
    }

    private void grantMedalIfEligible(long userId, String medalType) {
        MedalMeta meta = MEDAL_META.get(medalType);
        if (meta == null) return;
        if (userMedalRepository.existsByUser_IdAndMedalType(userId, medalType)) return;
        int progress = calculateProgressForMedal(medalType, userId);
        if (progress < meta.requiredCount) return;

        Instant now = Instant.now();
        UserMedal medal = new UserMedal();
        medal.setUser(userRepository.getReferenceById(userId));
        medal.setMedalType(medalType);
        medal.setObtainedAt(now);
        try {
            userMedalRepository.save(medal);
        } catch (DataIntegrityViolationException ignored) {
            // 并发场景下可能重复授予，唯一约束兜底后直接忽略。
            return;
        }

        UserPoints up = getOrCreateUserPoints(userId);
        int reward = Math.max(0, meta.pointsReward);
        int newTotalEarned = up.getTotalEarned() + reward;
        int newAvailable = up.getAvailable() + reward;
        up.setTotalEarned(newTotalEarned);
        up.setAvailable(newAvailable);
        up.setUpdatedAt(now);
        userPointsRepository.save(up);

        PointsRecord pr = new PointsRecord();
        pr.setUser(userRepository.getReferenceById(userId));
        pr.setType(MEDAL_REWARD_RECORD_TYPE);
        pr.setAmount(reward);
        pr.setBalanceAfter(newAvailable);
        pr.setDescription("获得勋章奖励：" + meta.name);
        pr.setSourceId("medal:" + medalType);
        pr.setCreatedAt(now);
        pointsRecordRepository.save(pr);
    }

    private int safeLongToInt(long value) {
        return value > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) value;
    }

    private PointsRecordDto toRecordDto(PointsRecord r) {
        PointsRecordDto dto = new PointsRecordDto();
        dto.setId(r.getId());
        dto.setType(r.getType());
        dto.setAmount(r.getAmount());
        dto.setBalance(r.getBalanceAfter());
        dto.setDescription(r.getDescription());
        dto.setSourceId(r.getSourceId());
        dto.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        dto.setExpiresAt(r.getExpiresAt() != null ? r.getExpiresAt().toString() : null);
        return dto;
    }

    /** 发布动态单次奖励分值（与 {@link #earnForPostPublish} 入账一致）。 */
    public static int postPublishRewardAmount() {
        return 15;
    }

    /**
     * 发布圈子动态积分：与手动发帖、打卡同步发帖共用（FR-009）。
     *
     * @return 实际入账积分，失败时为 0
     */
    @Transactional
    public int earnForPostPublish(long userId, long postId) {
        final int amount = postPublishRewardAmount();
        if (amount <= 0) return 0;
        try {
            UserPoints up = getOrCreateUserPoints(userId);
            int newTotalEarned = up.getTotalEarned() + amount;
            int newAvailable = up.getAvailable() + amount;
            up.setTotalEarned(newTotalEarned);
            up.setAvailable(newAvailable);
            up.setUpdatedAt(Instant.now());
            userPointsRepository.save(up);

            PointsRecord pr = new PointsRecord();
            pr.setUser(userRepository.getReferenceById(userId));
            pr.setType("post_publish");
            pr.setAmount(amount);
            pr.setBalanceAfter(newAvailable);
            pr.setDescription("发布动态");
            pr.setSourceId("post:" + postId);
            pr.setCreatedAt(Instant.now());
            pointsRecordRepository.save(pr);
            return amount;
        } catch (Exception e) {
            return 0;
        }
    }
}
