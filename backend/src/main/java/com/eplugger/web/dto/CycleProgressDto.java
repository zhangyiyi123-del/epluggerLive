package com.eplugger.web.dto;

import java.time.LocalDate;

/**
 * 周期目标进度（当日/本周），与前端 CycleProgress 对齐。
 */
public class CycleProgressDto {

    private String cycleType; // "day" | "week"
    private String startDate;
    private String endDate;
    private int currentDurationMinutes;
    private double currentDistanceKm;
    private int targetDurationMinutes;
    private Double targetDistanceKm;
    private boolean completed;
    private int daysRemaining;

    public String getCycleType() {
        return cycleType;
    }

    public void setCycleType(String cycleType) {
        this.cycleType = cycleType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public int getCurrentDurationMinutes() {
        return currentDurationMinutes;
    }

    public void setCurrentDurationMinutes(int currentDurationMinutes) {
        this.currentDurationMinutes = currentDurationMinutes;
    }

    public double getCurrentDistanceKm() {
        return currentDistanceKm;
    }

    public void setCurrentDistanceKm(double currentDistanceKm) {
        this.currentDistanceKm = currentDistanceKm;
    }

    public int getTargetDurationMinutes() {
        return targetDurationMinutes;
    }

    public void setTargetDurationMinutes(int targetDurationMinutes) {
        this.targetDurationMinutes = targetDurationMinutes;
    }

    public Double getTargetDistanceKm() {
        return targetDistanceKm;
    }

    public void setTargetDistanceKm(Double targetDistanceKm) {
        this.targetDistanceKm = targetDistanceKm;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public int getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(int daysRemaining) {
        this.daysRemaining = daysRemaining;
    }
}
