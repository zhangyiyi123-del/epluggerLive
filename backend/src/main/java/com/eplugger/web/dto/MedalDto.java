package com.eplugger.web.dto;

/**
 * 勋章信息，与前端 Medal 对齐。
 */
public class MedalDto {

    private String type;
    private String name;
    private String description;
    private String icon;
    private String condition;
    private int requiredCount;
    private int pointsReward;
    private String obtainedAt;
    private Integer progress;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public int getRequiredCount() { return requiredCount; }
    public void setRequiredCount(int requiredCount) { this.requiredCount = requiredCount; }
    public int getPointsReward() { return pointsReward; }
    public void setPointsReward(int pointsReward) { this.pointsReward = pointsReward; }
    public String getObtainedAt() { return obtainedAt; }
    public void setObtainedAt(String obtainedAt) { this.obtainedAt = obtainedAt; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
}
