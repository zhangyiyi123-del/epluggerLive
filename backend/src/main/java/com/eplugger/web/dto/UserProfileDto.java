package com.eplugger.web.dto;

/**
 * 个人中心：用户资料 + 统计（连续打卡天数、累计积分、勋章数）。
 */
public class UserProfileDto {

    private String id;
    private String name;
    private String avatar;
    private String department;
    private String position;
    private int consecutiveCheckInDays;
    private int totalEarnedPoints;
    private int medalCount;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public int getConsecutiveCheckInDays() { return consecutiveCheckInDays; }
    public void setConsecutiveCheckInDays(int consecutiveCheckInDays) { this.consecutiveCheckInDays = consecutiveCheckInDays; }
    public int getTotalEarnedPoints() { return totalEarnedPoints; }
    public void setTotalEarnedPoints(int totalEarnedPoints) { this.totalEarnedPoints = totalEarnedPoints; }
    public int getMedalCount() { return medalCount; }
    public void setMedalCount(int medalCount) { this.medalCount = medalCount; }
}
