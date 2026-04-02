package com.eplugger.web;

import com.eplugger.config.AppSsoUiProperties;
import com.eplugger.service.EpWorkSsoService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.view.RedirectView;

/**
 * epWorkApp 浏览器跳转落地：{@code GET /sso/login?token=...}。
 */
@Controller
@RequestMapping("/sso")
public class SsoController {

    private final EpWorkSsoService epWorkSsoService;
    private final AppSsoUiProperties ssoUiProperties;

    public SsoController(EpWorkSsoService epWorkSsoService, AppSsoUiProperties ssoUiProperties) {
        this.epWorkSsoService = epWorkSsoService;
        this.ssoUiProperties = ssoUiProperties;
    }

    @GetMapping("/login")
    public RedirectView login(@RequestParam(value = "token", required = false) String token) {
        if (!StringUtils.hasText(token)) {
            return redirectOrThrow("missing_token");
        }
        try {
            String target = epWorkSsoService.buildFrontendRedirectAfterSso(token);
            return new RedirectView(target);
        } catch (IllegalStateException e) {
            return redirectOrThrow("misconfigured");
        } catch (IllegalArgumentException e) {
            return redirectOrThrow("invalid_token");
        }
    }

    private RedirectView redirectOrThrow(String reason) {
        String err = ssoUiProperties.getFrontendErrorUrl();
        if (StringUtils.hasText(err)) {
            String sep = err.contains("?") ? "&" : "?";
            return new RedirectView(err + sep + "reason=" + reason);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SSO failed");
    }
}
