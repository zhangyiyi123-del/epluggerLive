package com.eplugger.web.dto;

/**
 * 正向打卡积分预览：与前端积分奖励预览对齐。
 */
public class PointsPreviewDto {

    private int basePoints;
    private int qualityBonus;
    private int evidenceBonus;
    private int colleagueBonus;
    private int totalPoints;

    public int getBasePoints() {
        return basePoints;
    }

    public void setBasePoints(int basePoints) {
        this.basePoints = basePoints;
    }

    public int getQualityBonus() {
        return qualityBonus;
    }

    public void setQualityBonus(int qualityBonus) {
        this.qualityBonus = qualityBonus;
    }

    public int getEvidenceBonus() {
        return evidenceBonus;
    }

    public void setEvidenceBonus(int evidenceBonus) {
        this.evidenceBonus = evidenceBonus;
    }

    public int getColleagueBonus() {
        return colleagueBonus;
    }

    public void setColleagueBonus(int colleagueBonus) {
        this.colleagueBonus = colleagueBonus;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
}
