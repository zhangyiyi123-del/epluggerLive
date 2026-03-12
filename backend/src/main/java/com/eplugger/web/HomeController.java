package com.eplugger.web;

import com.eplugger.service.HomeAggregateService;
import com.eplugger.web.dto.HomeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;

/**
 * 首页聚合：GET /api/home，需 JWT。
 */
@RestController
@RequestMapping("/api")
public class HomeController {

    private final HomeAggregateService homeAggregateService;

    public HomeController(HomeAggregateService homeAggregateService) {
        this.homeAggregateService = homeAggregateService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/home")
    public ResponseEntity<HomeResponse> home(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        ZoneId zoneId = ZoneId.systemDefault();
        HomeResponse body = homeAggregateService.getHome(userId, zoneId);
        return ResponseEntity.ok(body);
    }
}
