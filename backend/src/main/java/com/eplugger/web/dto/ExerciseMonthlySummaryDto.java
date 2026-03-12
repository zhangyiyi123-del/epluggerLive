package com.eplugger.web.dto;

/**
 * 运动打卡月度汇总：次数、总时长、总距离、总卡路里（估算），与历史记录口径一致。
 */
public class ExerciseMonthlySummaryDto {

    /** 月份 yyyy-MM */
    private String month;
    /** 该月运动打卡次数 */
    private int count;
    /** 总时长（分钟） */
    private int totalDurationMinutes;
    /** 总距离（公里） */
    private double totalDistanceKm;
    /** 总卡路里（估算，暂无明细则可为 0） */
    private int totalCalories;

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getTotalDurationMinutes() {
        return totalDurationMinutes;
    }

    public void setTotalDurationMinutes(int totalDurationMinutes) {
        this.totalDurationMinutes = totalDurationMinutes;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public int getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(int totalCalories) {
        this.totalCalories = totalCalories;
    }
}
