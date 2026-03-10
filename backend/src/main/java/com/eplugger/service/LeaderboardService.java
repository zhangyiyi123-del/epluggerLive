package com.eplugger.service;

import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.PositiveRecordRepository;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.LeaderboardEntryDto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 排行榜：积分榜、运动榜、正向榜，按时间范围（all/year/month/week/today）。
 */
@Service
public class LeaderboardService {

    private final UserPointsRepository userPointsRepository;
    private final PointsRecordRepository pointsRecordRepository;
    private final CheckInRecordRepository checkInRecordRepository;
    private final PositiveRecordRepository positiveRecordRepository;
    private final UserRepository userRepository;

    public LeaderboardService(
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            CheckInRecordRepository checkInRecordRepository,
            PositiveRecordRepository positiveRecordRepository,
            UserRepository userRepository
    ) {
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.checkInRecordRepository = checkInRecordRepository;
        this.positiveRecordRepository = positiveRecordRepository;
        this.userRepository = userRepository;
    }

    public List<LeaderboardEntryDto> getLeaderboard(String type, String timeRange, ZoneId zoneId) {
        if (zoneId == null) zoneId = ZoneId.systemDefault();
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        Instant start = Instant.EPOCH;
        Instant end = now.toInstant();
        if (timeRange != null && !"all".equals(timeRange)) {
            switch (timeRange) {
                case "today":
                    start = now.toLocalDate().atStartOfDay(zoneId).toInstant();
                    break;
                case "week":
                    start = now.toLocalDate().atStartOfDay(zoneId).minusDays(now.getDayOfWeek().getValue() - 1).toInstant();
                    break;
                case "month":
                    start = now.toLocalDate().atStartOfDay(zoneId).withDayOfMonth(1).toInstant();
                    break;
                case "year":
                    start = now.toLocalDate().atStartOfDay(zoneId).withDayOfYear(1).toInstant();
                    break;
                default:
                    start = Instant.EPOCH;
                    break;
            }
        }

        List<Object[]> rows = new ArrayList<>();
        List<Long> allUserIds = userPointsRepository.findAllByOrderByTotalEarnedDesc().stream()
                .map(UserPoints::getUserId).toList();

        if ("points".equals(type)) {
            if (timeRange == null || "all".equals(timeRange)) {
                for (UserPoints up : userPointsRepository.findAllByOrderByTotalEarnedDesc()) {
                    rows.add(new Object[]{ up.getUserId(), up.getTotalEarned() });
                }
            } else {
                List<Object[]> earned = pointsRecordRepository.sumEarnedByUserBetween(start, end);
                Map<Long, Integer> valueByUser = new LinkedHashMap<>();
                for (Long uid : allUserIds) valueByUser.put(uid, 0);
                for (Object[] r : earned) {
                    Long uid = (Long) r[0];
                    int v = r[1] instanceof Number ? ((Number) r[1]).intValue() : 0;
                    valueByUser.put(uid, v);
                }
                valueByUser.entrySet().stream()
                        .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                        .forEach(e -> rows.add(new Object[]{ e.getKey(), e.getValue() }));
            }
        } else if ("exercise".equals(type)) {
            List<Object[]> countRows = checkInRecordRepository.countByUserBetween(start, end);
            Map<Long, Integer> countByUser = new LinkedHashMap<>();
            if (!allUserIds.isEmpty()) {
                for (Long uid : allUserIds) countByUser.put(uid, 0);
            }
            for (Object[] r : countRows) {
                Long uid = (Long) r[0];
                int c = r[1] instanceof Number ? ((Number) r[1]).intValue() : 0;
                countByUser.put(uid, c);
            }
            countByUser.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                    .forEach(e -> rows.add(new Object[]{ e.getKey(), e.getValue() }));
        } else if ("positive".equals(type)) {
            List<Object[]> countRows = positiveRecordRepository.countByUserBetween(start, end);
            Map<Long, Integer> countByUser = new LinkedHashMap<>();
            if (!allUserIds.isEmpty()) {
                for (Long uid : allUserIds) countByUser.put(uid, 0);
            }
            for (Object[] r : countRows) {
                Long uid = (Long) r[0];
                int c = r[1] instanceof Number ? ((Number) r[1]).intValue() : 0;
                countByUser.put(uid, c);
            }
            countByUser.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                    .forEach(e -> rows.add(new Object[]{ e.getKey(), e.getValue() }));
        }

        if (rows.isEmpty()) return List.of();
        List<Long> userIds = rows.stream().map(r -> (Long) r[0]).distinct().toList();
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, u -> u));
        List<LeaderboardEntryDto> result = new ArrayList<>();
        for (Object[] r : rows) {
            Long uid = (Long) r[0];
            int value = r[1] instanceof Number ? ((Number) r[1]).intValue() : 0;
            User u = userMap.get(uid);
            LeaderboardEntryDto dto = new LeaderboardEntryDto();
            dto.setUserId(String.valueOf(uid));
            dto.setName(u != null ? u.getName() : "");
            dto.setInitial(u != null && u.getName() != null && !u.getName().isEmpty() ? u.getName().substring(0, 1) : "?");
            dto.setValue(value);
            result.add(dto);
        }
        return result;
    }
}
