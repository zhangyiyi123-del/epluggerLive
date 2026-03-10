package com.eplugger.web.dto;

import java.util.List;

/**
 * 用户积分与等级，与前端 UserPoints 对齐。
 */
public class UserPointsDto {

    private String userId;
    private int availablePoints;
    private int totalEarnedPoints;
    private int totalUsedPoints;
    private int expiringPoints;
    private String expiringDate;
    private int level;
    private int currentLevelPoints;
    private int nextLevelPoints;
    private List<MedalDto> medals;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public int getAvailablePoints() { return availablePoints; }
    public void setAvailablePoints(int availablePoints) { this.availablePoints = availablePoints; }
    public int getTotalEarnedPoints() { return totalEarnedPoints; }
    public void setTotalEarnedPoints(int totalEarnedPoints) { this.totalEarnedPoints = totalEarnedPoints; }
    public int getTotalUsedPoints() { return totalUsedPoints; }
    public void setTotalUsedPoints(int totalUsedPoints) { this.totalUsedPoints = totalUsedPoints; }
    public int getExpiringPoints() { return expiringPoints; }
    public void setExpiringPoints(int expiringPoints) { this.expiringPoints = expiringPoints; }
    public String getExpiringDate() { return expiringDate; }
    public void setExpiringDate(String expiringDate) { this.expiringDate = expiringDate; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public int getCurrentLevelPoints() { return currentLevelPoints; }
    public void setCurrentLevelPoints(int currentLevelPoints) { this.currentLevelPoints = currentLevelPoints; }
    public int getNextLevelPoints() { return nextLevelPoints; }
    public void setNextLevelPoints(int nextLevelPoints) { this.nextLevelPoints = nextLevelPoints; }
    public List<MedalDto> getMedals() { return medals; }
    public void setMedals(List<MedalDto> medals) { this.medals = medals; }
}
