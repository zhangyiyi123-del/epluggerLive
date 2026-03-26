package com.eplugger.service;

import com.eplugger.domain.entity.PointsRecord;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserMedal;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.UserMedalRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.MedalDto;
import com.eplugger.web.dto.PointsRecordDto;
import com.eplugger.web.dto.UserPointsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 用户积分、等级进度、积分明细、勋章列表。
 * 等级由 totalEarned 按档位计算，与前端 LEVEL_CONFIGS 一致。
 */
@Service
public class PointsService {

    private static final int[] LEVEL_MAX = { 200, 500, 1000, 1800, 2800, 4000, 5500, 7500, 10000, Integer.MAX_VALUE };
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    private static final Map<String, MedalMeta> MEDAL_META = Map.ofEntries(
            entry("sports-rookie", "运动萌新", "连续运动达标7天", "🏃", "连续运动7天", 7, 50),
            entry("sports-master", "运动达人", "累计运动达标30天", "🏅", "累计运动30天", 30, 50),
            entry("sports-champion", "运动健将", "累计运动达标100天", "🏆", "累计运动100天", 100, 50),
            entry("positive-messenger", "正向使者", "累计正向打卡20次", "✨", "累计正向打卡20次", 20, 50),
            entry("team-star", "团队之星", "累计邀请10人参与", "👥", "累计邀请10人参与", 10, 50),
            entry("community-star", "社区达人", "累计发布10条优质动态", "📱", "累计发布10条优质动态", 10, 50),
            entry("interaction-star", "互动之星", "累计点赞200次", "❤️", "累计点赞200次", 200, 50),
            entry("full-attendance", "全勤标兵", "自然月打卡全达标", "📅", "自然月全勤", 1, 50)
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

    public PointsService(
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            UserMedalRepository userMedalRepository,
            UserRepository userRepository
    ) {
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.userMedalRepository = userMedalRepository;
        this.userRepository = userRepository;
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
        List<MedalDto> medals = userMedalRepository.findByUser_IdOrderByObtainedAtDesc(userId).stream()
                .map(this::toMedalDto)
                .collect(Collectors.toList());
        dto.setMedals(medals);
        return Optional.of(dto);
    }

    public Page<PointsRecordDto> getRecords(Long userId, Pageable pageable) {
        return pointsRecordRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toRecordDto);
    }

    /**
     * 当前用户在当地自然日内已获得积分总和（仅统计 amount &gt; 0 的入账流水）。
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
        return userMedalRepository.findByUser_IdOrderByObtainedAtDesc(userId).stream()
                .map(this::toMedalDto)
                .collect(Collectors.toList());
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

    /** 发布圈子动态积分：与手动发帖、打卡同步发帖共用（FR-009）。 */
    @Transactional
    public void earnForPostPublish(long userId, long postId) {
        final int amount = 15;
        if (amount <= 0) return;
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
    }
}
