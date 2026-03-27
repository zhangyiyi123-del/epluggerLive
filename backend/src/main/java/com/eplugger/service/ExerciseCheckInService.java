package com.eplugger.service;

import com.eplugger.domain.entity.CheckInAttachment;
import com.eplugger.domain.entity.CheckInRecord;
import com.eplugger.domain.entity.PointsRecord;
import com.eplugger.domain.entity.SportType;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.SportTypeRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.CycleProgressDto;
import com.eplugger.web.dto.CommunitySyncResult;
import com.eplugger.web.dto.ExerciseCheckInRequest;
import com.eplugger.web.dto.ExerciseCheckInResponse;
import com.eplugger.web.dto.ExerciseMonthlySummaryDto;
import com.eplugger.web.dto.ExerciseRecordItem;
import com.eplugger.web.dto.SportTypeDto;
import com.eplugger.web.util.ZoneIdResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * 运动打卡：创建记录、按用户分页列表、当日/本周目标进度。
 */
@Service
public class ExerciseCheckInService {

    private static final int DEFAULT_DAILY_TARGET_MINUTES = 30;
    private static final int DEFAULT_WEEKLY_TARGET_MINUTES = 150;
    private static final int FIXED_CHECKIN_POINTS = 20;
    private static final int DAILY_SCORING_LIMIT = 2;

    private final CheckInRecordRepository checkInRecordRepository;
    private final SportTypeRepository sportTypeRepository;
    private final UserRepository userRepository;
    private final UserPointsRepository userPointsRepository;
    private final PointsRecordRepository pointsRecordRepository;
    private final CheckInCommunitySyncService checkInCommunitySyncService;
    private final PointsService pointsService;

    public ExerciseCheckInService(
            CheckInRecordRepository checkInRecordRepository,
            SportTypeRepository sportTypeRepository,
            UserRepository userRepository,
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            CheckInCommunitySyncService checkInCommunitySyncService,
            PointsService pointsService
    ) {
        this.checkInRecordRepository = checkInRecordRepository;
        this.sportTypeRepository = sportTypeRepository;
        this.userRepository = userRepository;
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.checkInCommunitySyncService = checkInCommunitySyncService;
        this.pointsService = pointsService;
    }

    @Transactional
    public ExerciseCheckInResponse create(Long userId, ExerciseCheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        SportType sportType = sportTypeRepository.findById(request.getSportTypeId())
                .orElseThrow(() -> new IllegalArgumentException("运动类型不存在"));

        int durationMinutes = toMinutes(request.getDuration(), request.getDurationUnit());
        BigDecimal distanceKm = normalizeDistance(toKm(request.getDistance(), request.getDistanceUnit()));
        String intensity = normalizeIntensity(request.getIntensity());
        ZoneId zoneId = ZoneIdResolver.resolve(request.getTimeZone());
        LocalDate today = LocalDate.now(zoneId);
        Instant dayStart = today.atStartOfDay(zoneId).toInstant();
        Instant dayEnd = today.plusDays(1).atStartOfDay(zoneId).toInstant();

        boolean duplicateOnDay = checkInRecordRepository.existsDuplicateOnDay(
                userId,
                dayStart,
                dayEnd,
                sportType.getId(),
                durationMinutes,
                "minute",
                intensity,
                distanceKm
        );
        String pointsHint = null;
        long todayScoredCount = checkInRecordRepository.countScoredByUserBetween(userId, dayStart, dayEnd);
        int points = FIXED_CHECKIN_POINTS;
        if (duplicateOnDay) {
            points = 0;
            pointsHint = "当天重复提交不计分";
        } else if (todayScoredCount >= DAILY_SCORING_LIMIT) {
            points = 0;
            pointsHint = "今日运动积分已达上限";
        }

        CheckInRecord record = new CheckInRecord();
        record.setUser(user);
        record.setSportType(sportType);
        record.setDuration(durationMinutes);
        record.setDurationUnit("minute");
        record.setDistance(distanceKm);
        record.setDistanceUnit(distanceKm != null ? "km" : null);
        record.setIntensity(intensity);
        record.setPoints(points);
        record.setStatus("normal");
        record.setCheckedInAt(Instant.now());

        if (request.getAttachmentUrls() != null && !request.getAttachmentUrls().isEmpty()) {
            for (String url : request.getAttachmentUrls()) {
                if (url == null || url.isBlank()) continue;
                CheckInAttachment att = new CheckInAttachment();
                att.setCheckInRecord(record);
                att.setUrl(url.trim());
                att.setType("image");
                record.getAttachments().add(att);
            }
        }

        record = checkInRecordRepository.save(record);

        if (points > 0) {
            // 入账积分：更新 user_points 并写入 points_record
            UserPoints up = userPointsRepository.findById(userId)
                    .orElseGet(() -> {
                        UserPoints newUp = new UserPoints();
                        newUp.setUserId(userId);
                        newUp.setUser(userRepository.getReferenceById(userId));
                        return userPointsRepository.save(newUp);
                    });
            int newTotalEarned = up.getTotalEarned() + points;
            int newAvailable = up.getAvailable() + points;
            up.setTotalEarned(newTotalEarned);
            up.setAvailable(newAvailable);
            up.setUpdatedAt(Instant.now());
            userPointsRepository.save(up);

            PointsRecord pr = new PointsRecord();
            pr.setUser(user);
            pr.setType("exercise_checkin");
            pr.setAmount(points);
            pr.setBalanceAfter(newAvailable);
            pr.setDescription("运动打卡");
            pr.setSourceId(String.valueOf(record.getId()));
            pr.setCreatedAt(Instant.now());
            pointsRecordRepository.save(pr);
        }
        pointsService.grantExerciseMedalsIfEligible(userId);

        ExerciseCheckInResponse response = toResponse(record);
        boolean wantSync = request.getSyncToCommunity() == null || Boolean.TRUE.equals(request.getSyncToCommunity());
        response.setCommunitySync(wantSync
                ? checkInCommunitySyncService.syncExerciseCheckIn(userId, record.getId())
                : CommunitySyncResult.notAttempted());
        response.setTodayEarnedPoints(pointsService.getTodayEarnedPoints(userId, zoneId));
        response.setPointsHint(pointsHint);
        return response;
    }

    public Page<ExerciseRecordItem> findRecordsByUserId(Long userId, Pageable pageable) {
        return checkInRecordRepository.findByUser_IdOrderByCheckedInAtDesc(userId, pageable)
                .map(this::toRecordItem);
    }

    public List<SportTypeDto> listSportTypes() {
        return sportTypeRepository.findByEnabledTrueOrderBySortOrderAsc().stream()
                .map(this::toSportTypeDto)
                .collect(Collectors.toList());
    }

    /** 当日进度（当天 0 点到现在的打卡时长/距离） */
    public CycleProgressDto getTodayProgress(Long userId, ZoneId zoneId) {
        LocalDate today = LocalDate.now(zoneId);
        Instant start = today.atStartOfDay(zoneId).toInstant();
        Instant end = Instant.now();
        List<CheckInRecord> list = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end);
        int totalMinutes = list.stream().mapToInt(CheckInRecord::getDuration).sum();
        double totalKm = list.stream()
                .map(CheckInRecord::getDistance)
                .filter(d -> d != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        CycleProgressDto dto = new CycleProgressDto();
        dto.setCycleType("day");
        dto.setStartDate(today.toString());
        dto.setEndDate(today.toString());
        dto.setCurrentDurationMinutes(totalMinutes);
        dto.setCurrentDistanceKm(totalKm);
        dto.setTargetDurationMinutes(DEFAULT_DAILY_TARGET_MINUTES);
        dto.setCompleted(totalMinutes >= DEFAULT_DAILY_TARGET_MINUTES);
        dto.setDaysRemaining(0);
        return dto;
    }

    /** 月度汇总：指定 yyyy-MM 的运动打卡次数、总时长、总距离、总卡路里（估算），与历史记录口径一致 */
    public ExerciseMonthlySummaryDto getMonthlySummary(Long userId, String yearMonth, ZoneId zoneId) {
        ExerciseMonthlySummaryDto dto = new ExerciseMonthlySummaryDto();
        dto.setMonth(yearMonth);
        dto.setCount(0);
        dto.setTotalDurationMinutes(0);
        dto.setTotalDistanceKm(0);
        dto.setTotalCalories(0);

        YearMonth ym;
        try {
            ym = YearMonth.parse(yearMonth);
        } catch (Exception e) {
            return dto;
        }
        LocalDate first = ym.atDay(1);
        LocalDate last = ym.atEndOfMonth();
        Instant start = first.atStartOfDay(zoneId).toInstant();
        Instant end = last.plusDays(1).atStartOfDay(zoneId).toInstant();

        List<CheckInRecord> list = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end);
        int count = list.size();
        int totalMinutes = list.stream().mapToInt(CheckInRecord::getDuration).sum();
        double totalKm = list.stream()
                .map(CheckInRecord::getDistance)
                .filter(d -> d != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();
        // 卡路里估算：约 5 kcal/min 轻度有氧（与常见运动 App 口径接近）
        int totalCalories = (int) Math.round(totalMinutes * 5.0);

        dto.setCount(count);
        dto.setTotalDurationMinutes(totalMinutes);
        dto.setTotalDistanceKm(totalKm);
        dto.setTotalCalories(totalCalories);
        return dto;
    }

    /** 指定月份内有运动打卡的日期（日号 1–31），用于日历绿点展示 */
    public List<Integer> getCheckedDaysInMonth(Long userId, String yearMonth, ZoneId zoneId) {
        YearMonth ym;
        try {
            ym = YearMonth.parse(yearMonth);
        } catch (Exception e) {
            return List.of();
        }
        LocalDate first = ym.atDay(1);
        LocalDate last = ym.atEndOfMonth();
        Instant start = first.atStartOfDay(zoneId).toInstant();
        Instant end = last.plusDays(1).atStartOfDay(zoneId).toInstant();
        List<CheckInRecord> list = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end);
        return list.stream()
                .map(r -> r.getCheckedInAt().atZone(zoneId).getDayOfMonth())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /** 本周进度（周一 0 点到当前） */
    public CycleProgressDto getWeekProgress(Long userId, ZoneId zoneId) {
        LocalDate now = LocalDate.now(zoneId);
        WeekFields wf = WeekFields.of(Locale.getDefault());
        LocalDate weekStart = now.with(wf.dayOfWeek(), 1);
        if (weekStart.isAfter(now)) {
            weekStart = weekStart.minusWeeks(1);
        }
        LocalDate weekEnd = weekStart.plusDays(6);
        Instant start = weekStart.atStartOfDay(zoneId).toInstant();
        Instant end = now.plusDays(1).atStartOfDay(zoneId).toInstant();
        List<CheckInRecord> list = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end);
        int totalMinutes = list.stream().mapToInt(CheckInRecord::getDuration).sum();
        double totalKm = list.stream()
                .map(CheckInRecord::getDistance)
                .filter(d -> d != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        CycleProgressDto dto = new CycleProgressDto();
        dto.setCycleType("week");
        dto.setStartDate(weekStart.toString());
        dto.setEndDate(weekEnd.toString());
        dto.setCurrentDurationMinutes(totalMinutes);
        dto.setCurrentDistanceKm(totalKm);
        dto.setTargetDurationMinutes(DEFAULT_WEEKLY_TARGET_MINUTES);
        dto.setCompleted(totalMinutes >= DEFAULT_WEEKLY_TARGET_MINUTES);
        dto.setDaysRemaining(Math.max(0, (int) java.time.temporal.ChronoUnit.DAYS.between(now, weekEnd) + 1));
        return dto;
    }

    private int toMinutes(int value, String unit) {
        if ("hour".equalsIgnoreCase(unit)) {
            return value * 60;
        }
        return value;
    }

    private BigDecimal toKm(BigDecimal value, String unit) {
        if (value == null || value.compareTo(BigDecimal.ZERO) == 0) return null;
        if ("m".equalsIgnoreCase(unit)) {
            return value.divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        }
        return value;
    }

    private BigDecimal normalizeDistance(BigDecimal value) {
        if (value == null) return null;
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeIntensity(String intensity) {
        if (intensity == null || intensity.isBlank()) return "medium";
        return intensity.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private SportTypeDto toSportTypeDto(SportType st) {
        SportTypeDto dto = new SportTypeDto();
        dto.setId(st.getId());
        dto.setName(st.getName());
        dto.setIcon(st.getIcon());
        dto.setSortOrder(st.getSortOrder());
        dto.setEnabled(st.isEnabled());
        return dto;
    }

    private ExerciseCheckInResponse toResponse(CheckInRecord r) {
        ExerciseCheckInResponse res = new ExerciseCheckInResponse();
        res.setId(r.getId());
        res.setSportTypeId(r.getSportType().getId());
        res.setSportTypeName(r.getSportType().getName());
        res.setSportTypeIcon(r.getSportType().getIcon());
        res.setDuration(r.getDuration());
        res.setDurationUnit(r.getDurationUnit());
        res.setDistance(r.getDistance());
        res.setDistanceUnit(r.getDistanceUnit());
        res.setIntensity(r.getIntensity());
        res.setPoints(r.getPoints());
        res.setStatus(r.getStatus());
        res.setCheckedInAt(r.getCheckedInAt());
        res.setAttachments(r.getAttachments().stream().map(a -> {
            ExerciseCheckInResponse.AttachmentDto dto = new ExerciseCheckInResponse.AttachmentDto();
            dto.setId(a.getId());
            dto.setUrl(a.getUrl());
            dto.setType(a.getType());
            dto.setUploadedAt(a.getUploadedAt());
            return dto;
        }).collect(Collectors.toList()));
        return res;
    }

    private ExerciseRecordItem toRecordItem(CheckInRecord r) {
        ExerciseRecordItem item = new ExerciseRecordItem();
        item.setId(r.getId());
        item.setSportTypeId(r.getSportType().getId());
        item.setSportTypeName(r.getSportType().getName());
        item.setSportTypeIcon(r.getSportType().getIcon());
        item.setDuration(r.getDuration());
        item.setDurationUnit(r.getDurationUnit());
        item.setDistance(r.getDistance());
        item.setDistanceUnit(r.getDistanceUnit());
        item.setIntensity(r.getIntensity());
        item.setPoints(r.getPoints());
        item.setCheckedInAt(r.getCheckedInAt());
        item.setAttachments(r.getAttachments().stream().map(a -> {
            ExerciseCheckInResponse.AttachmentDto dto = new ExerciseCheckInResponse.AttachmentDto();
            dto.setId(a.getId());
            dto.setUrl(a.getUrl());
            dto.setType(a.getType());
            dto.setUploadedAt(a.getUploadedAt());
            return dto;
        }).collect(Collectors.toList()));
        return item;
    }
}
