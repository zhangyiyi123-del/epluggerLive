package com.eplugger.web.dto;

/**
 * 已关注用户摘要：用于「关注」标签下横向列表展示。
 */
public class FollowedUserDto {

    private String id;
    private String name;
    private String avatar;
    private String department;

    public FollowedUserDto() {}

    public FollowedUserDto(String id, String name, String avatar, String department) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.department = department;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
