package com.eplugger.web.dto;

/**
 * 用户简要信息，用于动态/评论中的作者展示，与前端 User 对齐（id 为字符串）。
 */
public class UserDto {

    private String id;
    private String name;
    private String avatar;
    private String department;
    private String position;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
}
