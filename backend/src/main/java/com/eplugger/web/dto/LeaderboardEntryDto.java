package com.eplugger.web.dto;

/**
 * 排行榜单项，与前端展示对齐。
 */
public class LeaderboardEntryDto {

    private String userId;
    private String name;
    private String initial;
    private int value;
    private Integer change;  // 排名变化，可选

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getInitial() { return initial; }
    public void setInitial(String initial) { this.initial = initial; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
    public Integer getChange() { return change; }
    public void setChange(Integer change) { this.change = change; }
}
