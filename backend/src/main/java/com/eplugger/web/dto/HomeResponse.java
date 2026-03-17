package com.eplugger.web.dto;

import java.util.List;

/**
 * 首页聚合响应，与 frontend HomePage Mock 结构对齐。
 */
public class HomeResponse {

    private ProgressSummary todayProgress;
    private ProgressSummary weekProgress;
    private UserStats userStats;
    /** 本周运动打卡次数 */
    private int weekExerciseCount;
    /** 本周正向打卡次数 */
    private int weekPositiveCount;
    private List<RecentCheckInItem> recentCheckIns;
    private List<HotPostItem> hotPosts;

    public static class ProgressSummary {
        private int doneCount;
        private int targetCount;
        private int currentDurationMinutes;
        private int targetDurationMinutes;
        private boolean completed;

        public int getDoneCount() { return doneCount; }
        public void setDoneCount(int doneCount) { this.doneCount = doneCount; }
        public int getTargetCount() { return targetCount; }
        public void setTargetCount(int targetCount) { this.targetCount = targetCount; }
        public int getCurrentDurationMinutes() { return currentDurationMinutes; }
        public void setCurrentDurationMinutes(int currentDurationMinutes) { this.currentDurationMinutes = currentDurationMinutes; }
        public int getTargetDurationMinutes() { return targetDurationMinutes; }
        public void setTargetDurationMinutes(int targetDurationMinutes) { this.targetDurationMinutes = targetDurationMinutes; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public static class UserStats {
        private int points;
        private int checkInDays;
        private int streak;
        private int rank;
        private int rankChange;

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }
        public int getCheckInDays() { return checkInDays; }
        public void setCheckInDays(int checkInDays) { this.checkInDays = checkInDays; }
        public int getStreak() { return streak; }
        public void setStreak(int streak) { this.streak = streak; }
        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
        public int getRankChange() { return rankChange; }
        public void setRankChange(int rankChange) { this.rankChange = rankChange; }
    }

    public static class RecentCheckInItem {
        private String id;
        private String type; // "exercise" | "positive"
        private String title;
        private String time;
        private String points;
        private String avatarColor;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public String getPoints() { return points; }
        public void setPoints(String points) { this.points = points; }
        public String getAvatarColor() { return avatarColor; }
        public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
    }

    public static class HotPostItem {
        private String id;
        private String avatar;
        private String avatarColor;
        private String name;
        private String dept;
        private String text;
        private int likes;
        private int comments;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public String getAvatarColor() { return avatarColor; }
        public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDept() { return dept; }
        public void setDept(String dept) { this.dept = dept; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public int getLikes() { return likes; }
        public void setLikes(int likes) { this.likes = likes; }
        public int getComments() { return comments; }
        public void setComments(int comments) { this.comments = comments; }
    }

    public ProgressSummary getTodayProgress() { return todayProgress; }
    public void setTodayProgress(ProgressSummary todayProgress) { this.todayProgress = todayProgress; }
    public ProgressSummary getWeekProgress() { return weekProgress; }
    public void setWeekProgress(ProgressSummary weekProgress) { this.weekProgress = weekProgress; }
    public UserStats getUserStats() { return userStats; }
    public void setUserStats(UserStats userStats) { this.userStats = userStats; }
    public int getWeekExerciseCount() { return weekExerciseCount; }
    public void setWeekExerciseCount(int weekExerciseCount) { this.weekExerciseCount = weekExerciseCount; }
    public int getWeekPositiveCount() { return weekPositiveCount; }
    public void setWeekPositiveCount(int weekPositiveCount) { this.weekPositiveCount = weekPositiveCount; }
    public List<RecentCheckInItem> getRecentCheckIns() { return recentCheckIns; }
    public void setRecentCheckIns(List<RecentCheckInItem> recentCheckIns) { this.recentCheckIns = recentCheckIns; }
    public List<HotPostItem> getHotPosts() { return hotPosts; }
    public void setHotPosts(List<HotPostItem> hotPosts) { this.hotPosts = hotPosts; }
}
