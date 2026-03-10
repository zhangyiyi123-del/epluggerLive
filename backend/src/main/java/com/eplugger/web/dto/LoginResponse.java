package com.eplugger.web.dto;

/**
 * 登录/刷新成功响应：token + 当前用户信息。
 */
public class LoginResponse {

    private String token;
    private UserMeResponse user;

    public LoginResponse() {}

    public LoginResponse(String token, UserMeResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserMeResponse getUser() {
        return user;
    }

    public void setUser(UserMeResponse user) {
        this.user = user;
    }
}
