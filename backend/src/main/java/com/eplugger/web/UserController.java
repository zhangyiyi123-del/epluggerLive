package com.eplugger.web;

import com.eplugger.service.UserProfileService;
import com.eplugger.web.dto.UserProfileDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;

/**
 * 用户：GET /api/users/me（个人资料与统计）。
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(
            Authentication authentication,
            @RequestParam(required = false) String timeZone
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();

        ZoneId zoneId = (timeZone != null && !timeZone.isEmpty())
                ? ZoneId.of(timeZone)
                : ZoneId.systemDefault();

        UserProfileDto profile = userProfileService.getProfile(userId, zoneId);
        if (profile == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }
}
