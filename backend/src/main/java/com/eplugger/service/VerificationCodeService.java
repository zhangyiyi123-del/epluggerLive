package com.eplugger.service;

import org.springframework.stereotype.Service;

/**
 * 短信验证码服务：当前为桩实现，不支持发送与校验。
 * 后续接入短信网关后可替换为真实实现。
 */
@Service
public class VerificationCodeService {

    /**
     * 发送验证码到手机号。当前未实现，直接抛出异常。
     */
    public void sendCode(String phone) {
        throw new UnsupportedOperationException("验证码登录暂未开放，请使用密码登录");
    }

    /**
     * 校验手机号与验证码是否匹配。当前未实现，始终返回 false。
     */
    public boolean verify(String phone, String code) {
        return false;
    }
}
