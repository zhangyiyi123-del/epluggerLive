package com.eplugger.service;

import com.eplugger.domain.entity.CheckInRecord;
import com.eplugger.domain.entity.PositiveRecord;
import com.eplugger.domain.entity.Post;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.PositiveRecordRepository;
import com.eplugger.repository.PostRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.HomeResponse;
import com.eplugger.web.dto.LeaderboardEntryDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 首页聚合：今日/本周进度、个人统计、最近 3 条打卡、热门动态。
 */
@Service
public class HomeAggregateService {

    private static final int TODAY_TARGET_COUNT = 3;
    private static final int WEEK_TARGET_COUNT = 10;
    private static final int HOT_POSTS_SIZE = 3;
    private static final int RECENT_CHECK_INS_SIZE = 3;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final CheckInRecordRepository checkInRecordRepository;
    private final PositiveRecordRepository positiveRecordRepository;
    private final PostRepository postRepository;
    private final UserPointsRepository userPointsRepository;
    private final UserRepository userRepository;
    private final ExerciseCheckInService exerciseCheckInService;
    private final LeaderboardService leaderboardService;

    public HomeAggregateService(
            CheckInRecordRepository checkInRecordRepository,
            PositiveRecordRepository positiveRecordRepository,
            PostRepository postRepository,
            UserPointsRepository userPointsRepository,
            UserRepository userRepository,
            ExerciseCheckInService exerciseCheckInService,
            LeaderboardService leaderboardService
    ) {
        this.checkInRecordRepository = checkInRecordRepository;
        this.positiveRecordRepository = positiveRecordRepository;
        this.postRepository = postRepository;
        this.userPointsRepository = userPointsRepository;
        this.userRepository = userRepository;
        this.exerciseCheckInService = exerciseCheckInService;
        this.leaderboardService = leaderboardService;
    }

    public HomeResponse getHome(Long userId, ZoneId zoneId) {
        if (zoneId == null) zoneId = ZoneId.systemDefault();
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        Instant todayStart = now.toLocalDate().atStartOfDay(zoneId).toInstant();
        Instant todayEnd = now.plusDays(1).toLocalDate().atStartOfDay(zoneId).toInstant();
        Instant weekStart = now.toLocalDate().atStartOfDay(zoneId).minusDays(now.getDayOfWeek().getValue() - 1).toInstant();
        Instant weekEnd = now.plusDays(1).toLocalDate().atStartOfDay(zoneId).toInstant();

        HomeResponse res = new HomeResponse();

        // 今日/本周进度（按次数）
        int todayDone = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, todayStart, todayEnd).size()
                + positiveRecordRepository.findByUser_IdAndCreatedAtBetween(userId, todayStart, todayEnd).size();
        int weekExercise = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, weekStart, weekEnd).size();
        int weekPositive = positiveRecordRepository.findByUser_IdAndCreatedAtBetween(userId, weekStart, weekEnd).size();
        int weekDone = weekExercise + weekPositive;

        var todayProgress = exerciseCheckInService.getTodayProgress(userId, zoneId);
        var weekProgress = exerciseCheckInService.getWeekProgress(userId, zoneId);

        HomeResponse.ProgressSummary todaySummary = new HomeResponse.ProgressSummary();
        todaySummary.setDoneCount(todayDone);
        todaySummary.setTargetCount(TODAY_TARGET_COUNT);
        todaySummary.setCurrentDurationMinutes(todayProgress.getCurrentDurationMinutes());
        todaySummary.setTargetDurationMinutes(todayProgress.getTargetDurationMinutes());
        todaySummary.setCompleted(todayProgress.isCompleted());
        res.setTodayProgress(todaySummary);

        HomeResponse.ProgressSummary weekSummary = new HomeResponse.ProgressSummary();
        weekSummary.setDoneCount(weekDone);
        weekSummary.setTargetCount(WEEK_TARGET_COUNT);
        weekSummary.setCurrentDurationMinutes(weekProgress.getCurrentDurationMinutes());
        weekSummary.setTargetDurationMinutes(weekProgress.getTargetDurationMinutes());
        weekSummary.setCompleted(weekProgress.isCompleted());
        res.setWeekProgress(weekSummary);

        // 个人统计
        HomeResponse.UserStats userStats = new HomeResponse.UserStats();
        UserPoints up = userPointsRepository.findById(userId).orElse(null);
        userStats.setPoints(up != null ? up.getTotalEarned() : 0);
        userStats.setCheckInDays(countDistinctCheckInDays(userId, zoneId));
        userStats.setStreak(0); // 后续可扩展连续天数
        List<LeaderboardEntryDto> weekLeaderboard = leaderboardService.getLeaderboard("points", "week", zoneId);
        int rank = 0;
        for (int i = 0; i < weekLeaderboard.size(); i++) {
            if (String.valueOf(userId).equals(weekLeaderboard.get(i).getUserId())) {
                rank = i + 1;
                break;
            }
        }
        userStats.setRank(rank);
        userStats.setRankChange(0);
        res.setUserStats(userStats);
        res.setWeekExerciseCount(weekExercise);
        res.setWeekPositiveCount(weekPositive);

        // 最近 3 条打卡（运动 + 正向按时间合并取前 3）
        res.setRecentCheckIns(buildRecentCheckIns(userId, zoneId));

        // 热门动态（按点赞、评论、时间）
        res.setHotPosts(buildHotPosts(userId));

        return res;
    }

    private int countDistinctCheckInDays(Long userId, ZoneId zoneId) {
        Instant start = ZonedDateTime.now(zoneId).minusDays(365).toInstant();
        Instant end = Instant.now();
        List<CheckInRecord> exercise = checkInRecordRepository.findByUserIdAndCheckedInAtBetween(userId, start, end);
        List<PositiveRecord> positive = positiveRecordRepository.findByUser_IdAndCreatedAtBetween(userId, start, end);
        Set<String> days = Stream.concat(
                exercise.stream().map(r -> r.getCheckedInAt().atZone(zoneId).toLocalDate().format(DATE_FMT)),
                positive.stream().map(r -> r.getCreatedAt().atZone(zoneId).toLocalDate().format(DATE_FMT))
        ).collect(Collectors.toSet());
        return days.size();
    }

    private List<HomeResponse.RecentCheckInItem> buildRecentCheckIns(Long userId, ZoneId zoneId) {
        List<CheckInRecord> exerciseList = checkInRecordRepository.findByUser_IdOrderByCheckedInAtDesc(userId, PageRequest.of(0, 5)).getContent();
        List<PositiveRecord> positiveList = positiveRecordRepository.findByUser_IdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5)).getContent();

        List<RecordWithTime> withTime = new ArrayList<>();
        for (CheckInRecord r : exerciseList) {
            HomeResponse.RecentCheckInItem item = new HomeResponse.RecentCheckInItem();
            item.setId("e-" + r.getId());
            item.setType("exercise");
            item.setTitle(r.getSportType() != null ? r.getSportType().getName() : "运动");
            item.setTime(formatCheckInTime(r.getCheckedInAt(), zoneId));
            item.setPoints("+" + r.getPoints());
            item.setAvatarColor("#F87171");
            withTime.add(new RecordWithTime(r.getCheckedInAt(), item));
        }
        for (PositiveRecord r : positiveList) {
            HomeResponse.RecentCheckInItem item = new HomeResponse.RecentCheckInItem();
            item.setId("p-" + r.getId());
            item.setType("positive");
            item.setTitle(r.getTitle() != null && !r.getTitle().isBlank() ? r.getTitle() : (r.getCategory() != null ? r.getCategory().getName() : "正向行为"));
            item.setTime(formatCheckInTime(r.getCreatedAt(), zoneId));
            item.setPoints("+" + r.getPoints());
            item.setAvatarColor("#10B981");
            withTime.add(new RecordWithTime(r.getCreatedAt(), item));
        }
        return withTime.stream()
                .sorted(Comparator.comparing(RecordWithTime::instant).reversed())
                .limit(RECENT_CHECK_INS_SIZE)
                .map(RecordWithTime::item)
                .toList();
    }

    private record RecordWithTime(Instant instant, HomeResponse.RecentCheckInItem item) {}

    private String formatCheckInTime(Instant instant, ZoneId zoneId) {
        if (instant == null) return "";
        ZonedDateTime zdt = instant.atZone(zoneId);
        ZonedDateTime todayStart = ZonedDateTime.now(zoneId).toLocalDate().atStartOfDay(zoneId);
        if (zdt.toInstant().toEpochMilli() >= todayStart.toInstant().toEpochMilli()) {
            return "今天 " + zdt.format(TIME_FMT);
        }
        if (zdt.toInstant().toEpochMilli() >= todayStart.minusDays(1).toInstant().toEpochMilli()) {
            return "昨天 " + zdt.format(TIME_FMT);
        }
        return zdt.format(DateTimeFormatter.ofPattern("MM-dd HH:mm"));
    }

    private List<HomeResponse.HotPostItem> buildHotPosts(Long currentUserId) {
        List<Post> posts = postRepository.findAllByOrderByLikesCountDescCreatedAtDesc(PageRequest.of(0, HOT_POSTS_SIZE)).getContent();
        List<HomeResponse.HotPostItem> result = new ArrayList<>();
        String[] colors = { "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6" };
        for (int i = 0; i < posts.size(); i++) {
            Post p = posts.get(i);
            User author = p.getAuthor();
            HomeResponse.HotPostItem item = new HomeResponse.HotPostItem();
            item.setId(String.valueOf(p.getId()));
            item.setAvatar(author != null && author.getName() != null && !author.getName().isEmpty() ? author.getName().substring(0, 1) : "?");
            item.setAvatarColor(colors[i % colors.length]);
            item.setName(author != null ? author.getName() : "");
            item.setDept(author != null ? author.getDepartment() : "");
            String text = p.getContentText();
            item.setText(text != null && text.length() > 50 ? text.substring(0, 50) + "…" : (text != null ? text : ""));
            item.setLikes(p.getLikesCount());
            item.setComments(p.getCommentsCount());
            result.add(item);
        }
        return result;
    }
}
