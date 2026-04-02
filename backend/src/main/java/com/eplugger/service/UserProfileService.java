package com.eplugger.service;

import com.eplugger.domain.entity.CheckInRecord;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.UserMedalRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.UserProfileDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 个人中心：用户资料与统计（连续打卡天数、累计积分、勋章数）。
 * 资料字段来自持久化的 {@link User}；epWorkApp SSO 在登录时更新同一用户行，此处无需单独缓存。
 */
@Service
public class UserProfileService {

    private static final int MAX_DAYS_FOR_STREAK = 500;

    private final UserRepository userRepository;
    private final UserPointsRepository userPointsRepository;
    private final UserMedalRepository userMedalRepository;
    private final CheckInRecordRepository checkInRecordRepository;

    public UserProfileService(
            UserRepository userRepository,
            UserPointsRepository userPointsRepository,
            UserMedalRepository userMedalRepository,
            CheckInRecordRepository checkInRecordRepository
    ) {
        this.userRepository = userRepository;
        this.userPointsRepository = userPointsRepository;
        this.userMedalRepository = userMedalRepository;
        this.checkInRecordRepository = checkInRecordRepository;
    }

    /**
     * 获取当前用户资料与统计，用于个人中心展示。
     */
    public UserProfileDto getProfile(Long userId, ZoneId zoneId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId().toString());
        dto.setName(user.getName() != null ? user.getName() : "");
        dto.setAvatar(user.getAvatar());
        dto.setDepartment(user.getDepartment() != null ? user.getDepartment() : "");
        dto.setPosition(user.getPosition());

        int totalEarned = 0;
        int medalCount = 0;
        UserPoints up = userPointsRepository.findById(userId).orElse(null);
        if (up != null) {
            totalEarned = up.getTotalEarned();
        }
        medalCount = userMedalRepository.findByUser_IdOrderByObtainedAtDesc(userId).size();
        dto.setTotalEarnedPoints(totalEarned);
        dto.setMedalCount(medalCount);

        int streak = computeConsecutiveCheckInDays(userId, zoneId != null ? zoneId : ZoneId.systemDefault());
        dto.setConsecutiveCheckInDays(streak);

        return dto;
    }

    /**
     * 连续打卡天数：从「今天」起往前数，有运动打卡的连续天数。
     */
    private int computeConsecutiveCheckInDays(Long userId, ZoneId zoneId) {
        List<CheckInRecord> recent = checkInRecordRepository.findByUser_IdOrderByCheckedInAtDesc(
                userId, PageRequest.of(0, MAX_DAYS_FOR_STREAK)).getContent();
        if (recent.isEmpty()) return 0;

        Set<LocalDate> dates = recent.stream()
                .map(r -> r.getCheckedInAt() != null
                        ? LocalDate.ofInstant(r.getCheckedInAt(), zoneId)
                        : null)
                .filter(d -> d != null)
                .collect(Collectors.toSet());

        if (dates.isEmpty()) return 0;
        List<LocalDate> sorted = new ArrayList<>(dates);
        sorted.sort((a, b) -> b.compareTo(a));

        LocalDate today = LocalDate.now(zoneId);
        if (!dates.contains(today)) return 0;

        int count = 0;
        LocalDate d = today;
        while (dates.contains(d)) {
            count++;
            d = d.minusDays(1);
        }
        return count;
    }
}
