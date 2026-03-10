package com.eplugger.web;

import com.eplugger.service.NotificationService;
import com.eplugger.web.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 消息通知：GET /api/notifications、PATCH /api/notifications/:id/read、GET /api/notifications/unread-count。
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> list(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(notificationService.listByUser(userId, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return notificationService.markRead(id, userId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
