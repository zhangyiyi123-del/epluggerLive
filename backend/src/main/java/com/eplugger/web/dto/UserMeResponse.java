package com.eplugger.web.dto;

/**
 * 当前用户信息，与前端 User 类型对齐（id 为字符串）。
 */
public class UserMeResponse {

    private String id;
    private String name;
    private String avatar;
    private String department;
    private String position;

    public UserMeResponse() {}

    public UserMeResponse(String id, String name, String avatar, String department, String position) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.department = department != null ? department : "";
        this.position = position;
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

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }
}
