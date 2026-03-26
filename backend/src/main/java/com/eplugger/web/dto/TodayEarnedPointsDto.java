package com.eplugger.web.dto;

/**
 * 当日已获得积分（自然日 0 点起，所有正向入账汇总）。
 */
public class TodayEarnedPointsDto {

    private int points;

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
