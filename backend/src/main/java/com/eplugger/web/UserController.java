package com.eplugger.web;

import com.eplugger.domain.entity.User;
import com.eplugger.repository.UserRepository;
import com.eplugger.service.UserProfileService;
import com.eplugger.web.dto.UserDto;
import com.eplugger.web.dto.UserProfileDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户：GET /api/users/me（个人资料与统计）、GET /api/users/colleagues（同事列表，用于 @ 提及/参与同事选择）。
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final String ACTIVE = "ACTIVE";

    private final UserProfileService userProfileService;
    private final UserRepository userRepository;

    public UserController(UserProfileService userProfileService, UserRepository userRepository) {
        this.userProfileService = userProfileService;
        this.userRepository = userRepository;
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

    /**
     * 同事列表：用于发布动态 @ 提及、正向打卡参与同事选择。排除当前登录用户，按姓名排序。
     */
    @GetMapping("/colleagues")
    public ResponseEntity<List<UserDto>> colleagues(Authentication authentication) {
        Long currentUserId = currentUserId(authentication);
        if (currentUserId == null) return ResponseEntity.status(401).build();

        List<UserDto> list = userRepository.findByEmploymentStatusOrderByNameAsc(ACTIVE).stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(this::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private UserDto toUserDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId() != null ? u.getId().toString() : null);
        dto.setName(u.getName());
        dto.setAvatar(u.getAvatar());
        dto.setDepartment(u.getDepartment());
        dto.setPosition(u.getPosition());
        return dto;
    }
}
