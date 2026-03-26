package com.eplugger.web.dto;

/**
 * 当日已获得积分：客户端自然日 0 点起，{@code points_record} 中所有 {@code amount &gt; 0} 的汇总
 *（含发帖奖励、打卡、互动等，不按类型排除）。
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
