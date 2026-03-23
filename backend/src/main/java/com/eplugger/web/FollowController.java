package com.eplugger.web;

import com.eplugger.service.FollowService;
import com.eplugger.web.dto.FollowedUserDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 关注接口：POST /api/follow/{userId} 关注，DELETE 取消关注，GET /api/follow/following 获取已关注列表。
 */
@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    private Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** 关注指定用户。 */
    @PostMapping("/{userId}")
    public ResponseEntity<?> follow(Authentication authentication, @PathVariable Long userId) {
        Long currentId = currentUserId(authentication);
        if (currentId == null) return ResponseEntity.status(401).build();
        if (currentId.equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "不能关注自己"));
        }
        try {
            FollowedUserDto dto = followService.followUser(currentId, userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** 取消关注指定用户。 */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unfollow(Authentication authentication, @PathVariable Long userId) {
        Long currentId = currentUserId(authentication);
        if (currentId == null) return ResponseEntity.status(401).build();
        followService.unfollowUser(currentId, userId);
        return ResponseEntity.ok().build();
    }

    /** 获取当前用户已关注的用户列表。 */
    @GetMapping("/following")
    public ResponseEntity<List<FollowedUserDto>> following(Authentication authentication) {
        Long currentId = currentUserId(authentication);
        if (currentId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(followService.getFollowingUsers(currentId));
    }
}
